boxy.CollectiblesManager = class {
  constructor(spawnMap, tiles, entityFactory) {
    this._spawnMap = spawnMap;
    this._tiles = tiles;
    this._entities = [];

    this._entityFactory = entityFactory;
  }

  spawnAll() {
    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow; j++) {
        var spawn = spawnRow[j];

        if (this._locationSpawnable(i, j)) {
          var collEntity = new boxy.CollectibleEntity(i, j, spawn, this._spriteSheet);
          this._entities.push(collEntity);
        }
      }
    }
  }

  _locationSpawnable(row, column) {
    if (this._tiles[row][column] == 1) {
      return false;
    }
    var playerLoc = game.playerEntity.rc;
    return playerLoc[0] == row && playerLoc[1] == column;
  }

  spawnEntity(spawnType) {

  }
}
