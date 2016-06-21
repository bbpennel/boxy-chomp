boxy.CollectiblesManager = class {
  constructor(stageMap, entityFactory) {
    this._spawnMap = stageMap.spawnMap;
    this._spawnInfo = stageMap.spawnInfo;
    this._stageMap = stageMap;
    this._entityFactory = entityFactory;
  }

  spawnAll() {
    this._collectionLocations = this._determineStartingLocations(boxy.COLLECTION_ID, this._spawnInfo.collectionStart);

    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow.length; j++) {
        var spawnType = spawnRow[j];

        if (this._locationSpawnable(i, j)) {
          this.spawnEntity(i, j, spawnType);
        }
      }
    }
  }

  _determineStartingLocations(typeValue, startCount) {
    if (startCount == 0) {
      return;
    }

    var candidateLocations = [];

    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow.length; j++) {
        if (spawnRow[j] == typeValue) {
          candidateLocations.push([i,j]);
        }
      }
    }

    var result = [];
    for (var i = 0; i < startCount; i++) {
      var index = Math.floor(Math.random() * candidateLocations.length);
      result.push(candidateLocations[index]);
      candidateLocations.splice(index, 1);
    }

    return result;
  }

  _locationSpawnable(row, column) {
    if (this._stageMap.isBlocked([row, column])) {
      return false;
    }

    var playerLoc = boxy.game.playerEntity.rc;
    return !(playerLoc[0] == row && playerLoc[1] == column);
  }

  spawnEntity(row, column, spawnType) {
    switch (spawnType) {
      case boxy.FOLDER_ID:
        return this._entityFactory.addFolder(row, column);
      case boxy.COLLECTION_ID:
        if (boxy.indexOfPair(this._collectionLocations, [row, column]) != -1) {
          return this._entityFactory.addCollection(row, column, "text", "blue");
        } else {
          return this._entityFactory.addFolder(row, column);
        }
    }
  }
}
