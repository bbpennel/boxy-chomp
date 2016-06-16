boxy.CollectiblesManager = class {
  constructor(stageMap, entityFactory) {
    this._spawnMap = stageMap.spawnMap;
    this._stageMap = stageMap;
    this._entityFactory = entityFactory;
  }

  spawnAll() {
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

  _locationSpawnable(row, column) {
    if (this._stageMap.isBlocked([row, column])) {
      return false;
    }

    var playerLoc = boxy.game.playerEntity.rc;
    return !(playerLoc[0] == row && playerLoc[1] == column);
  }

  spawnEntity(row, column, spawnType) {
    switch (spawnType) {
      case 1:
          return this._entityFactory.addFolder(row, column, 0);
    }
  }
}
