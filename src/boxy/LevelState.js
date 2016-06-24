// Tracks progress on the current level
boxy.LevelState = class {
  constructor(stageNumber, difficultyLevel) {
    this._collectionLimit = 2;
    this._completedCollections = [];
    // Active collections
    this._collections = [];
    this._difficultyLevel = difficultyLevel;
    this._stageNumber = stageNumber;
    this._stageLevel = boxy.STAGE_LEVELS[this._stageNumber];
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
        goal : this._stageLevel.itemsPerCollection
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
      if (collection.progress >= collection.goal) {
        this._completedCollections.push(collection);
        this._collections.splice(collectionIndex, 1);
        
        boxy.game.eventHandler.collectionRemoved(collection, true);
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
          var collection = this._collections.splice(index, 1)[0];
          boxy.game.eventHandler.collectionRemoved(collection, false);
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
  
  get completedCollections() {
    return this._completedCollections;
  }
  
  get completedCollectionsCount() {
    return this._completedCollections.length;
  }
  
  get collectionGoal() {
    return this._stageLevel.collectionGoal;
  }
  
  hasReachedGoal() {
    return this._completedCollections.length >= this._stageLevel.collectionGoal;
  }
}