boxy.CollectiblesManager = class {
  constructor(spawnMap, tiles, spriteImages) {
    this._spawnMap = spawnMap;
    this._tiles = tiles;
    this._entities = [];

    this._spriteSheet = new createjs.SpriteSheet({
        framerate: 0,
        "images": [spriteImages],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 16, "regY": 0, "width": boxy.game.settings.grid_size}
      });
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
