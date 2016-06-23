// Tracks progress on the current level
boxy.LevelState = class {
  constructor(difficultyLevel) {
    this._collectionLimit = 2;
    this._completedCollections = [];
    // Active collections
    this._collections = [];
    this._difficultyLevel = difficultyLevel;
    this._activeColors = ["plain"];
  }
  
  get difficultyLevel() {
    return this._difficultyLevel;
  }
  
  registerCollection(collection) {
    if (this._collections.length < this._collectionLimit) {
      // Can only be one collection per color at a time
      if (this._getCollectionIndexByColor(collection.color) != -1) {
        return;
      }
      
      var collEntry = {
        color : collection.color,
        collObj : collection,
        progress : 0,
        goal : 10
      };
      
      this._collections.push(collEntry);
      
      boxy.game.eventHandler.collectionRegistered(collEntry);
    }
  }
  
  addToCollection(collectible) {
    if (!collectible.color) {
      return;
    }
    // Find the collection that this collectible is associated with by color
    var collectionIndex = this._getCollectionIndexByColor(collectible.color);
    var collection = this._collections[collectionIndex];
    if (collection != null) {
      collection.progress++;
      console.log("Progress:", collection.color, collection.progress, "/", collection.goal);
      if (collection.progress >= collection.goal) {
        this._completedCollections.push(collection);
        this._collections.splice(collectionIndex, 1);
        
        boxy.game.eventHandler.collectionComplete({
          
        });
      }
    }
  }
  
  subtractFromCollections(colls) {
    for (var i = 0; i < colls.length; i++) {
      var coll = colls[i];
      
      // Only need to worry about unregistering folders and collections
      if (coll.itemType == "folder" || coll.itemType == "collection") {
        var index = this._getCollectionIndexByColor(coll.color);
        if (index == -1) {
          continue;
        }
        
        if (coll.itemType == "folder") {
          this._collections[index].progress--;
        } else {
          // Lost a collection, yikes!
          this._collections.splice(index, 1);
        }
      }
    }
  }
  
  _getCollectionIndexByColor(color) {
    for (var i = 0; i < this._collections.length; i++) {
      if (this._collections[i].color == color) {
        return i;
      }
    }
    return -1;
  }
  
  get collectionProgress() {
    return this._collections;
  }
  
  get activeColors() {
    return this._activeColors;
  }
}