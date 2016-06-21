boxy.LevelState = class {
  constructor() {
    this._collectionLimit = 2;
    this._completedCollections = [];
    // Active collections
    this._collections = [];
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
        
        boxy.game.eventHandler.collectionComplete({
          
        });
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
}