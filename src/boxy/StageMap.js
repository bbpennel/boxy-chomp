boxy.StageMap = class {
  constructor(data, spriteFactory, gridSize, offsetX, offsetY) {
    this._mapData = data;
    this._spriteFactory = spriteFactory;
    this._gridSize = gridSize;
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._tileSprites = [];
  }

  get hasChanged() {
    return this._hasChanged;
  }

  get spawnMap() {
    return this._spawnMap;
  }

  selectMap(mapId) {
    this._selectedId = mapId;
    this._selectedData = this._mapData[mapId];
    this._numRows = this._selectedData.tiles.length;
    this._numColumns = this._selectedData.tiles[0].length;
    this._spawnMap = this._selectedData.spawns;

    this._computeMap();
    return this;
  }

  _computeMap() {
    var computed = [];

    var tiles = this._mapData[this._selectedId].tiles;
    for (var i = 0; i < tiles.length; i++) {
      var computedRow = [];
      computed.push(computedRow);
      var row = tiles[i];
      for (var j = 0; j < row.length; j++) {
        if (row[j] == 0) {
          // Not a wall, nothing else to check
          computedRow.push(-1);
          continue;
        }
        
        var connectUp = (i > 0 && tiles[i-1][j] == 1);
        var connectRight = (j < row.length - 1 && row[j+1] == 1);
        var connectDown = (i < tiles.length - 1 && tiles[i+1][j] == 1);
        var connectLeft = (j > 0 && row[j-1] == 1);

        if (connectUp && connectRight && connectLeft && connectDown) {
          // Internal wall
          computedRow.push(10)
        } else if (!connectUp && connectRight && connectLeft && connectDown) {
          computedRow.push(8);
        } else if (connectUp && !connectRight && connectLeft && connectDown) {
          computedRow.push(9);
        } else if (connectUp && connectRight && !connectLeft && connectDown) {
          computedRow.push(7);
        } else if (connectUp && connectRight && connectLeft && !connectDown) {
          computedRow.push(6);
        } else if (!connectUp && !connectRight && connectLeft && connectDown) {
          computedRow.push(4);
        } else if (!connectUp && connectRight && !connectLeft && connectDown) {
          computedRow.push(3);
        } else if (!connectUp && connectRight && connectLeft && !connectDown) {
          computedRow.push(1);
        } else if (connectUp && !connectRight && !connectLeft && connectDown) {
          computedRow.push(0);
        } else if (connectUp && !connectRight && connectLeft && !connectDown) {
          computedRow.push(5);
        } else if (connectUp && connectRight && !connectLeft && !connectDown) {
          computedRow.push(2);
        } else if (!connectUp && !connectRight && !connectLeft && connectDown) {
          computedRow.push(12);
        } else if (!connectUp && !connectRight && connectLeft && !connectDown) {
          computedRow.push(13);
        } else if (!connectUp && connectRight && !connectLeft && !connectDown) {
          computedRow.push(15);
        } else if (connectUp && !connectRight && !connectLeft && !connectDown) {
          computedRow.push(14);
        } else {
          // Stand alone
          computedRow.push(11);
        }
      }
    }

    this._computedMap = computed;
  }

  renderMap() {
    var grid = this._computedMap;

    for (var i = 0; i < grid.length; i++) {
      var row = grid[i];
      var offsetY = i * this._gridSize;

      for (var j = 0; j < row.length; j++) {
        var tileValue = row[j];

        if (tileValue < 0) {
          continue;
        }

        var sprite = this._spriteFactory.createMapTileSprite(tileValue);
        sprite.x = j * this._gridSize + this._offsetX;
        sprite.y = offsetY + this._offsetY;
        this._tileSprites.push(sprite);
      }
    }

    return this;
  }

  allowedDirections(rc) {
    var dirs = [];
    var tiles = this._selectedData.tiles;
    var column = rc[1], row = rc[0];

    if (row > 0 && tiles[row - 1][column] == 0) {
      dirs.push(0);
    }
    if (row < this._numRows - 1 && tiles[row + 1][column] == 0) {
      dirs.push(2);
    }

    if (column < this._numColumns - 1 && tiles[row][column + 1] == 0) {
      dirs.push(1);
    }
    if (column > 0 && tiles[row][column - 1] == 0) {
      dirs.push(3);
    }

    return dirs;
  }

  isBlocked(rc) {
    return this._selectedData.tiles[rc[0]][rc[1]] == 1;
  }

  gridToCoordinate(rc) {
    return [rc[1] * this._gridSize + this._offsetX,
      rc[0] * this._gridSize + this._offsetY];
  }

  coordinateToGrid(xy) {
    var row = Math.floor((xy[1] - this._offsetY) / this._gridSize);
    var column = Math.floor((xy[0] - this._offsetX) / this._gridSize);
    return [row, column];
  }
}