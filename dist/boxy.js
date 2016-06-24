var boxy = boxy || {};

// 1 = folder, color assignable
boxy.FOLDER_ID = 1;
// 2 = collection, random location, alternate folder
boxy.COLLECTION_ID = 2;
// 3 = hard drive spawn location, random, alternate folder
boxy.DISK_ID = 3;
// 4 = random bonus, occasionally spawns here
boxy.RANDOM_BONUS_ID = 4;

boxy.COLLECTIBLE_NAMES = ["none", "folder", "collection", "disk", "bonus"];
boxy.COLLECTIBLE_COLORS = ["plain", "blue", "pink", "green", "red"];

boxy.DIFFICULTY_LEVELS = {
  0 : {
    damageCost : 3,
    invincibleDuration : 4000,
    freezeDuration : 500
  },
  1 : {
    damageCost : 5,
    invincibleDuration: 4000,
    freezeDuration : 500
  },
  2 : {
    damageCost : 10,
    invincibleDuration: 2000,
    freezeDuration : 800
  }
};

boxy.SPRINT_COOLDOWN = 8000;
boxy.SPRINT_DURATION = 2000;
boxy.SPRINT_SPEED_MULTIPLIER = 2;

boxy.GHOST_EATEN_TIME = 5000;;
boxy.MapEntity = class {
  constructor(rc, sprite) {
    this._rc = [rc[0], rc[1]];
    this._snapToGrid();
    this._sprite = sprite;
    this.collisionRadiusRatio = 0.5;
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  get xy() {
    return this._x;
  }

  set xy(xy) {
    this._xy = xy;
  }

  get rc() {
    return this._rc;
  }

  get sprite() {
    return this._sprite;
  }
  
  set invincibleTime(time) {
    this._invincibleTime = time;
  }
  
  get isInvincible() {
    return this._invincibleTime != null && this._invincibleTime > 0;
  }

  center() {
    var offset = boxy.game.settings.grid_size / 2;
    return [this._xy[0] + offset, this._xy[1] + offset];
  }

  get collisionRadius() {
    return this._collisionRadius;
  }

  // Determines the size of this entities collision box, relative to the size of a grid node.
  // Ratio should be a number > 0 but less than 1
  set collisionRadiusRatio(ratio) {
    this._collisionRadius = boxy.game.settings.grid_size * (ratio / 2);
  }

  isCollidingWith(entity) {
    var thisCenter = this.center();
    var entityCenter = entity.center();
    var distX = Math.abs(thisCenter[0] - entityCenter[0]);
    var distY = Math.abs(thisCenter[1] - entityCenter[1]);
    var collideDist = this.collisionRadius + entity.collisionRadius;

    // Two grid objects are colliding if their collision boxes are overlapping, 
    // determined by the sum of their collision radiuses exceeding the distance between centers
    return distX <= collideDist && distY <= collideDist;
  }
  
  gridDistanceLessThan(rc, distance) {
    var distR = Math.abs(this.rc[0] - rc[0]);
    var distC = Math.abs(this.rc[1] - rc[1]);
    
    return distR < distance && distC < distance;
  }

  _snapToGrid() {
    this._xy = boxy.game.stageMap.gridToCoordinate(this._rc);
  }

  _addToGame() {
    game.stage
  }

  update() {
    this.updateDisplay();
    this.updateState();
  }
  
  updateState() {
     if (this._invincibleTime) {
       this._invincibleTime -= boxy.game.tick.delta;
     }
  }

  updateDisplay() {
  }
};
boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(rc, itemType, format, color, sprite) {
    super(rc, sprite);
    this._itemType = itemType;
    this._format = format;
    this._color = color;
    this._stateChange = true;
  }
  
  static buildAnimationName(itemType, format, color) {
    var animation = itemType;
    if (format != null) {
      animation += "_" + format;
    }
    if (color != null) {
      animation += "_" + color;
    }
    return animation;
  }

  get itemType() {
    return this._itemType;
  }
  
  get format() {
    return this._format;
  }
  
  get color() {
    return this._color;
  }
  
  set color(color) {
    this._color = color;
    // Update the animation for the newly set color
    console.log(this._itemType, this._format, this._color);
    var animationName = boxy.CollectibleEntity.buildAnimationName(this._itemType, this._format, this._color);
    console.log("Change color animation", animationName);
    this._sprite.gotoAndPlay(animationName);
  }

  updateDisplay() {
    if (!this._stateChange) {
      return;
    }

    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];
  }
};
boxy.CollectiblesManager = class {
  constructor(stageMap, entityFactory) {
    this._spawnMap = stageMap.spawnMap;
    this._spawnInfo = stageMap.spawnInfo;
    this._stageMap = stageMap;
    this._entityFactory = entityFactory;
    this._consumedQueue = [];
    this._respawnQueue = [];
    this._collectionFormatIndex = 0;
    this._typeCountTotal = [];
    this._typeCountCurrent = [];
    for (var i = 0; i < boxy.COLLECTIBLE_NAMES.length; i++) {
      this._typeCountTotal.push(0);
      this._typeCountCurrent.push(0);
    }
  }

  spawnAll() {
    this._collectionLocations = this._determineStartingLocations(boxy.COLLECTION_ID, this._spawnInfo.collectionStart);
    this._diskLocations = this._determineStartingLocations(boxy.DISK_ID, 1);//this._spawnInfo.diskStart);

    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow.length; j++) {
        var spawnType = spawnRow[j];

        if (this._locationSpawnable(i, j)) {
          this.spawnEntity([i, j], spawnType);
        }
      }
    }
  }
  
  update() {
    var delta = boxy.game.tick.delta;
    var i = 0;
    while (i < this._respawnQueue.length) {
      var info = this._respawnQueue[i];
      info.timeToRespawn -= delta;
      // If the respawn time is up and boxy is not too close, then respawn
      if (info.timeToRespawn <= 0 && !boxy.game.playerEntity.gridDistanceLessThan(info.rc, info.respawnDistance)) {
        this._respawnEntity(info.rc, info.spawnType);
        this._respawnQueue.splice(i, 1);
      } else {
        i++;
      }
    }
  }
  
  ejectConsumed(count) {
    var length = this._consumedQueue.length;
    if (length < count) {
      return this._consumedQueue.splice(0, length);
    }
    
    return this._consumedQueue.splice(length - count, count);
  }
  
  consume(collectible) {
    this._consumedQueue.push(collectible);
    this._markForRespawn(collectible);
  }
  
  // Register that the collectible at the given location has been removed, and queue it for respawn
  _markForRespawn(entity) {
    // The type of the object in a location may not match the spawn type of the tile
    var instanceTypeId = boxy.COLLECTIBLE_NAMES.indexOf(entity.itemType);
    this._typeCountCurrent[instanceTypeId]--;
    
    var rc = entity.rc;
    
    var spawnType = this._spawnMap[rc[0]][rc[1]];
    var typeName = boxy.COLLECTIBLE_NAMES[spawnType];
    var typeInfo = boxy.game.settings.collectibles[typeName];
    
    this._respawnQueue.push({
      timeToRespawn : typeInfo.respawnTime + ((Math.random() - 0.5) * 0.4 * typeInfo.respawnTime),
      respawnDistance : typeInfo.respawnDistance,
      rc : rc,
      spawnType : spawnType
    });
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

  spawnEntity(rc, spawnType) {
    switch (spawnType) {
      case boxy.FOLDER_ID:
        return this._spawn(rc, spawnType);
      case boxy.COLLECTION_ID:
        if (boxy.indexOfPair(this._collectionLocations, rc) != -1) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
      case boxy.DISK_ID:
        if (boxy.indexOfPair(this._diskLocations, rc) != -1) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
    }
  }
  
  _respawnEntity(rc, spawnType) {
    switch (spawnType) {
      case boxy.FOLDER_ID:
        return this._spawn(rc, spawnType);
      case boxy.COLLECTION_ID:
        if (this._respawnOkay(spawnType)) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
      case boxy.DISK_ID:
        if (this._respawnOkay(spawnType)) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
    }
  }
  
  _spawn(rc, spawnType) {
    this._typeCountCurrent[spawnType]++;
    this._typeCountTotal[spawnType]++;
    
    switch (spawnType) {
      case boxy.FOLDER_ID:
        var color = this._folderColors[Math.floor(Math.random() * this._folderColors.length)];
        return this._entityFactory.addFolder(rc, color);
      case boxy.COLLECTION_ID:
        var color = "plain";
        // get the available collection colors, set difference all colors against active
        var availColors = boxy.arrayDifference(boxy.COLLECTIBLE_COLORS, this._folderColors);
        // Randomly pick one of the remaining colors, or generic color if none left
        if (availColors.length > 0) {
          color = availColors[Math.floor(Math.random() * availColors.length)];
        }

        // pick format from the set of formats allowed by the level
        var format = this._spawnInfo.collectionTypes[this._collectionFormatIndex];
        this._collectionFormatIndex = ++this._collectionFormatIndex % this._spawnInfo.collectionTypes.length;
        
        return this._entityFactory.addCollection(rc, format, color);
      case boxy.DISK_ID:
        return this._entityFactory.addDisk(rc);
    }
  }
  
  _respawnOkay(spawnType) {
    var typeName = boxy.COLLECTIBLE_NAMES[spawnType];
    var spawnChance = this._spawnInfo[typeName + "SpawnChance"];
    var totalLimit = this._spawnInfo[typeName + "Count"];
    var maxConcur = this._spawnInfo[typeName + "MaxConcurrent"];

    return (maxConcur === undefined || maxConcur > this._typeCountCurrent[spawnType])
        && (totalLimit === undefined || totalLimit > this._typeCountTotal[spawnType])
        && (spawnChance === undefined || spawnChance < 0 || Math.random() < spawnChance);
  }
  
  set folderColors(colors) {
    this._folderColors = colors;
  }
  
  get folderColors() {
    return this._folderColors;
  }
  
  randomizeFolderColors(folderEntities) {
    for (var i = 0; i < folderEntities.length; i++) {
      var folder = folderEntities[i];
      var newColor = this._folderColors[Math.floor(Math.random() * this._folderColors.length)];
      
      folder.color = newColor;
    }
  }
}
;
boxy.MobileEntity = class extends boxy.MapEntity {
  constructor(rc, speed, sprite, spritePrefix) {
    super(rc, sprite);
    this._speed = speed;
    this._computedSpeed = speed;
    this._stopTimer = 0;
    this._idle = false;
    this._spritePrefix = spritePrefix || "";
    this._positionChanged = true;
    this._freezeTime = 0;
  }

  set nextDirection(dir) {
    if (dir == this._currentDirection) {
      this._nextDirection = null;
      return this;
    }
    this._nextDirection = dir;
    return this;
  }

  get nextDirection() {
    return this._nextDirection;
  }
  
  reverseDirection() {
    if (this._currentDirection != null) {
      this._nextDirection = (this._currentDirection + 2) % 4;
    }
  }
  
  set freezeTime(time) {
    this._freezeTime = time;
  }
  
  get isFrozen() {
    return this._freezeTime > 0;
  }
  
  // Get the row/column position in the current 
  nextRc() {
    var row = this._rc[0], column = this._rc[1];
    switch (this._currentDirection) {
    case 0:
      return [row - 1, column];
    case 1:
      return [row, column + 1];
    case 2:
      return [row + 1, column];
    case 3:
      return [row, column - 1];
    }
    return this._rc;
  }

  get currentDirection() {
    return this._currentDirection;
  }

  set currentDirection(dir) {
    this._currentDirection = dir;
  }

  get speed() {
    return this._speed;
  }

  set speed(speed) {
    this._speed = speed;
  }
  
  boostSpeed(multiplier) {
    this._computedSpeed = this._speed * multiplier;
  }
  
  resetSpeed() {
    this._computedSpeed = this._speed;
  }
  
  changeAnimation(animation) {
    this._sprite.gotoAndPlay(this._spritePrefix + animation);
  }

  update() {
    this.updatePosition();
    this.updateDisplay();

    this.updateState();
  }
  
  updateState() {
    super.updateState();
    
    if (this._freezeTime) {
      this._freezeTime -= boxy.game.tick.delta;
      if (this._freezeTime < 0) {
        this._freezeTime = 0;
      }
    }
    
    // If not moving, wait a bit then start to idle
    if (this.currentDirection == null) {
      this._stopTimer++;
    }
    if (this._stopTimer == boxy.game.settings.idle_time) {
      this._idle = true;
      this._animationChange = true;
    }

    this._clearMovementFlags();
  }

  _movementStopped() {
    this._currentDirection = null;
    this._nextDirection = null;
    this._movementChange = true;
    this._stopTimer = 0;
    this._nextDirection = null;
    this._directionChanged = false;
  }

  _changeDirection(direction) {
    this.currentDirection = this._nextDirection;
    this._nextDirection = null;
    this._movementChange = true;
    this._idle = false;
    this._directionChanged = true;
  }

  _clearMovementFlags() {
    this._positionChanged = false;
    this._movementChange = false;
  }

  updatePosition() {
    if (this.isFrozen) {
      return;
    }
    
    var newX = this._xy[0], newY = this._xy[1];
    var newGrid = this._rc;

    if (this._currentDirection != null) {
      var speed = boxy.calculateMoveDelta(this._computedSpeed);
      switch (this.currentDirection) {
        case 0:
          newY -= speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
          break;
        case 1:
          newX += speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX + boxy.game.settings.grid_size, newY]);
          break;
        case 2:
          newY += speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY + boxy.game.settings.grid_size]);
          break;
        case 3:
          newX -= speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
          break;
      }

      this._positionChanged = newGrid[0] != this._rc[0] || newGrid[1] != this._rc[1];
    }

    if (!this._directionChanged && (this._positionChanged || this._currentDirection == null)) {
      // Retrieve or compute the next direction if one is provided
      var nextDirection = this.nextDirection;

      var dirs = boxy.game.stageMap.allowedDirections(this._rc);
      if (nextDirection != null) {
        // make sure that the selected direction is allowed
        if (dirs.indexOf(nextDirection) != -1) {
          this._snapToGrid();
          this._changeDirection(nextDirection);
          return;
        }
      }
      // Can't go any further in the selected direction, and no further direction given
      if (this._currentDirection != null && dirs.indexOf(this._currentDirection) == -1) {
        this._snapToGrid();
        this._movementStopped();
        return;
      }
    }

    // Continue movement in the current direction
    this._xy = [newX, newY];
    this._rc = newGrid;
    this._directionChanged = false;

    return;
  }

  updateDisplay() {
    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];

    if (this._animationChange) {
      if (this._idle) {
        this.changeAnimation("idle");
      }
      this._animationChange = false;
    }

    if (this._movementChange) {
      var dirName, stopMove;
      switch (this.currentDirection) {
        case 0:
          dirName = "up";
          break;
        case 1:
          dirName = "right";
          break;
        case 2:
          dirName = "down";
          break;
        case 3:
          dirName = "left";
          break;
        case null:
          stopMove = true;
          break;
      }
      if (stopMove) {
        this._sprite.stop();
      } else {
        this.changeAnimation("move_" + dirName);
      }
    }
    return this;
  }
};
boxy.GhostEntity = class extends boxy.MobileEntity {
  constructor(rc, speed, sprite, spritePrefix) {
    super(rc, speed, sprite, spritePrefix);
    this._eatenTime = 0;
  }
  
  get isEaten() {
    return this._eatenTime > 0;
  }
  
  eatenFor(time) {
    this._eatenTime = time;
    this.changeAnimation("eaten");
  }
  
  get isFrozen() {
    return this._freezeTime > 0 || this._eatenTime > 0;
  }

  get nextDirection() {
    if (this._nextDirection != null || !this._positionChanged) {
      return this._nextDirection;
    }

    var dirs = boxy.game.stageMap.allowedDirections(this._rc);

    if (this._currentDirection == null) {
      var randomDir = Math.floor(Math.random() * dirs.length);
      this._nextDirection = dirs[randomDir];
      return this._nextDirection;
    }

    // Prevent reversal if there are any other options
    if (dirs.length > 1) {
      var reverse = (this._currentDirection + 2) % 4;
      var reverseIndex = dirs.indexOf(reverse);
      if (reverseIndex != -1) {
        dirs.splice(reverseIndex, 1);
      }
    }

    var randomDir = Math.floor(Math.random() * dirs.length);
    this._nextDirection = dirs[randomDir];

    // console.log("Picked new direction", this._nextDirection, "from options", dirs, 
    //   "at position", this._rc, "previous dir", this._currentDirection);
    return this._nextDirection;
  }
  
  update() {
    super.update();
    
    if (this._eatenTime) {
      this._eatenTime -= boxy.game.tick.delta;
      if (this._eatenTime <= 0) {
        this._eatenTime = 0;
        // Reset the animation next time around
        this._movementChange = true;
      }
    }
  }
};
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

  get spawnInfo() {
    return this._spawnInfo;
  }

  selectMap(mapId) {
    this._selectedId = mapId;
    this._selectedData = this._mapData[mapId];
    this._numRows = this._selectedData.tiles.length;
    this._numColumns = this._selectedData.tiles[0].length;
    this._spawnMap = this._selectedData.spawns;
    this._spawnInfo = this._selectedData.spawnInfo;

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
};
boxy.SpriteFactory = class {
  constructor(loader, stage) {
    this._loader = loader;
    this._stage = stage;
  }

  init() {
    this._generateSpritesheets();
  }

  _generateSpritesheets() {
    this._boxySheet = new createjs.SpriteSheet({
        framerate: 6,
        "images": [this._loader.getResult("boxy_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 17, 
          "regY": 0, "width": boxy.game.settings.grid_size},
        // define two animations, run (loops, 1.5x speed) and jump (returns to run):
        "animations": {
          "move_right": {
            frames: [0,1,2,3,2,1],
            speed: 2
          },
          "move_left": {
            frames: [4,5,6,7,6,5],
            speed: 2
          },
          "move_down": {
            frames: [8,9,10,11,10,9],
            speed: 2
          },
          "move_up": {
            frames: [12,13,14,15,14,13],
            speed: 2
          },
          "idle": {
            frames: [8,8,8,16],
            speed: 0.3
          }
        }
      });
    this._boxyContainer = new createjs.SpriteContainer(this._boxySheet);
    
    this._ghostSheet = new createjs.SpriteSheet({
        framerate: 2,
        "images": [this._loader.getResult("ghost_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 20, 
          "regY": 0, "width": boxy.game.settings.grid_size},
        // define two animations, run (loops, 1.5x speed) and jump (returns to run):
        "animations": {
          "i_move_right": 3,
          "i_move_left": 2,
          "i_move_down": 0,
          "i_move_up": 1,
          "i_idle": 0,
          "i_eaten": 4,
          "cw_move_right": 8,
          "cw_move_left": 7,
          "cw_move_down": 5,
          "cw_move_up": 6,
          "cw_idle": 5,
          "cw_eaten": 9,
          "hat_move_right": 13,
          "hat_move_left": 12,
          "hat_move_down": 10,
          "hat_move_up": 11,
          "hat_idle": 10,
          "hat_eaten": 14,
          "mol_move_right": 18,
          "mol_move_left": 17,
          "mol_move_down": 15,
          "mol_move_up": 16,
          "mol_idle": 15,
          "mol_eaten": 19
        }
      });
    this._ghostContainer = new createjs.SpriteContainer(this._ghostSheet);

    this._mapTilesSheet = new createjs.SpriteSheet({
        framerate: 0,
        "images": [this._loader.getResult("map_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 16, "regY": 0, "width": boxy.game.settings.grid_size}
      });
    this._mapTilesContainer = new createjs.SpriteContainer(this._mapTilesSheet);

    this._collectiblesSheet = new createjs.SpriteSheet({
        framerate: 0,
        "images": [this._loader.getResult("collectibles_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 27, "regY": 0, "width": boxy.game.settings.grid_size},
        "animations": {
          "folder_plain": 0,
          "folder_blue": 1,
          "folder_pink": 2,
          "folder_green": 3,
          "folder_red": 4,
          "collection_plain": 5,
          "collection_blue": 6,
          "collection_pink": 7,
          "collection_green": 8,
          "collection_red": 9,
          "collection_data_blue": 10,
          "collection_data_pink": 11,
          "collection_data_green": 12,
          "collection_data_red": 13,
          "collection_image_blue": 14,
          "collection_image_pink": 15,
          "collection_image_green": 16,
          "collection_image_red": 17,
          "collection_text_blue": 18,
          "collection_text_pink": 19,
          "collection_text_green": 20,
          "collection_text_red": 21,
          "collection_audio_blue": 22,
          "collection_audio_pink": 23,
          "collection_audio_green": 24,
          "collection_audio_red": 25,
          "disk": 26
        }
      });
    this._collectiblesContainer = new createjs.SpriteContainer(this._collectiblesSheet);

    this._textContainer = new createjs.Container();

    // Add containers to the stage in render order
    this._stage.addChild(this._mapTilesContainer, this._textContainer,
      this._collectiblesContainer, this._ghostContainer, this._boxyContainer);
  }

  createBoxySprite() {
    return this._createSprite(this._boxySheet, this._boxyContainer, "idle");
  }
  
  createGhostSprite() {
    return this._createSprite(this._ghostSheet, this._ghostContainer, 0);
  }

  createMapTileSprite(tileValue) {
    return this._createSprite(this._mapTilesSheet, this._mapTilesContainer, tileValue, true);
  }

  createFolderSprite(color) {
    return this._createCollectibleSprite("folder", null, color);
  }
  
  createCollectionSprite(format, color) {
    return this._createCollectibleSprite("collection", format, color);
  }

  createDiskSprite(category, color) {
    return this._createCollectibleSprite("disk");
  }
  
  _createCollectibleSprite(itemType, format, color) {
    var animation = boxy.CollectibleEntity.buildAnimationName(itemType, format, color);
    
    return this._createSprite(this._collectiblesSheet, this._collectiblesContainer, animation, true);
  }
  
  _createSprite(spritesheet, container, animation, stopAnimation) {
    var sprite = new createjs.Sprite(spritesheet, animation);
    container.addChild(sprite);
    if (stopAnimation) {
      sprite.stop();
    }
    return sprite;
  }

  createText(value) {
    var text = new createjs.Text(value, "48px silkscreen", "#FFFFFF");
    text.textBaseline = "alphabetic";
    this._textContainer.addChild(text);
    return text;
  }
};
boxy.MapEntityFactory = class {
  constructor(entityManager, spriteFactory, stage) {
    this._entityManager = entityManager;
    this._spriteFactory = spriteFactory;
    this._stage = stage;
  }

  addBoxy(rc, speed) {
    var sprite = this._spriteFactory.createBoxySprite();
    var entity = new boxy.MobileEntity(rc, speed, sprite);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }

  addFolder(rc, color) {
    var sprite = this._spriteFactory.createFolderSprite(color);
    var entity = new boxy.CollectibleEntity(rc, "folder", null, color, sprite);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
    return entity;
  }

  addCollection(rc, format, color) {
    var sprite = this._spriteFactory.createCollectionSprite(format, color);
    var entity = new boxy.CollectibleEntity(rc, "collection", format, color, sprite);
    entity.collisionRadiusRatio = 0.6;
    this._entityManager.register(entity);
    return entity;
  }
  
  addDisk(rc) {
    var sprite = this._spriteFactory.createDiskSprite();
    var entity = new boxy.CollectibleEntity(rc, "disk", null, null, sprite);
    entity.collisionRadiusRatio = 0.7;
    this._entityManager.register(entity);
    return entity;
  }
  
  addGhost(rc, ghostIdentity) {
    var sprite = this._spriteFactory.createGhostSprite();
    var speed = 200;
    var prefix;
    switch (ghostIdentity) {
      case 0:
        prefix = "i_";
        break;
      case 1:
        prefix = "cw_";
        break;
      case 2:
        prefix = "hat_";
        break;
      case 3:
        prefix = "mol_";
        break;
    }
    if (ghostIdentity == 0) {
      prefix = "i_";
    }
    var entity = new boxy.GhostEntity(rc, speed, sprite, prefix);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }
};
boxy.MapEntityManager = class {
  constructor(stage) {
    this._stage = stage;
    this._entities = [];
    this._nextId = 0;
    this._mobileEntities = [];
  }

  _generateId() {
    return ++this._nextId;
  }

  update() {
    this._entities.forEach(function(entity) {
      entity.update();
    });

    this.detectCollisions();
  }

  // Register a MapEntity 
  register(entity) {
    if (!(entity instanceof boxy.MapEntity)) {
      throw "Attempted to register non-entity object " + entity;
    }
    entity.id = this._generateId();
    this._entities.push(entity);
    if (entity instanceof boxy.MobileEntity) {
      this._mobileEntities.push(entity);
    }

    return this;
  }

  destroy(entity) {
    var eIndex = this._entities.indexOf(entity);
    var mIndex = this._mobileEntities.indexOf(entity);

    entity.sprite.parent.removeChild(entity.sprite);

    if (eIndex != -1) {
      this._entities.splice(eIndex, 1);
    }

    if (mIndex != -1) {
      this._mobileEntities.splice(mIndex, 1);
    }
  }

  // Return the entity with the given id
  findEntityById(id) {
    for (var i = 0; i < this._entities.length; i++) {
      var entity = this._entities[i];
      if (entity && entity.id == id) {
        return this._entities[i];
      }
    }
  }

  // Finds all entities within the same grid location or any of the 4 adjacent locations
  // as seekEntity
  findNeighbors(seekEntity) {
    var neighbors = [];
    var row = seekEntity.rc[0];
    var col = seekEntity.rc[1];

    for (var i = 0; i < this._entities.length; i++) {
      var entity = this._entities[i];
      if (!entity) continue;
      // Determine how far away this entity is
      var rDist = Math.abs(row - entity.rc[0]);
      var cDist = Math.abs(col - entity.rc[1]);
      // If the combined row and col distance is <= 1, then it is adjacent or overlapping
      // But is not the entity being calculated for
      if ((rDist + cDist) < 2 && entity !== seekEntity) {
        neighbors.push(entity);
      }
    }

    return neighbors;
  }

  detectCollisions() {
    for (var i = 0; i < this._mobileEntities.length; i++) {
      var entity = this._mobileEntities[i];
      if (!entity) continue;
      var neighbors = this.findNeighbors(entity);

      for (var j = 0; j < neighbors.length; j++) {
        var neighbor = neighbors[j];
        if (entity.isCollidingWith(neighbor)) {
          boxy.game.eventHandler.collisionEvent({
            collider : entity,
            collidee : neighbor
          });
        }
      }
    }
  }
  
  getCollectiblesByType(itemType) {
    var result = [];
    for (var i = 0; i < this._entities.length; i++) {
      var entity = this._entities[i];
      if (!(entity instanceof boxy.CollectibleEntity) || entity.itemType != itemType) {
        continue;
      }
      result.push(entity);
    }
    return result;
  }
};
boxy.PlayerState = class {
  constructor(startingCapacity) {
    this._score = 0;
    this._diskUsage = 0;
    this._diskCapacity = startingCapacity;
    this._sprintCooldown = 0;
    this._sprintTime = 0;
  }
  
  get sprintReady() {
    return this._sprintCooldown <= 0;
  }
  
  set sprintCooldown(time) {
    this._sprintCooldown = time;
  }
  
  get isSprinting() {
    return this._sprintTime > 0;
  }
  
  set sprintTime(time) {
    this._sprintTime = time;
  }
  
  get score() {
    return this._score;
  }
  
  get diskUsage() {
    return this._diskUsage;
  }
  
  get diskCapacity() {
    return this._diskCapacity;
  }
  
  update() {
    if (!this.sprintReady) {
      this._sprintCooldown -= boxy.game.tick.delta;
      if (this._sprintCooldown < 0) {
        console.log("Sprint is ready!");
        this._sprintCooldown = 0;
      }
    }
    
    if (this.isSprinting) {
      this._sprintTime -= boxy.game.tick.delta;
      if (this._sprintTime <= 0) {
        boxy.game.eventHandler.sprintEnd();
      }
    }
  }

  adjustStats(stats, subtract) {
    if (boxy.isString(stats)) {
      stats = boxy.game.settings.collectibles[stats];
    }
    
    if (stats.score) {
      this._score += (subtract? -1 : 1) * stats.score;
    }
    if (stats.disk) {
      this._diskUsage += (subtract? -1 : 1) * stats.disk;
    }
    if (stats.capacity) {
      this._diskCapacity += (subtract? -1 : 1) * stats.capacity;
    }
  }
};
boxy.EventHandler = class {
  constructor() {
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }
  
  set collectiblesManager(manager) {
    this._collectiblesManager = manager;
  }
  
  set entityManager(manager) {
    this._entityManager = manager;
  }
  
  set stageMap(stageMap) {
    this._stageMap = stageMap;
  }
  
  set playerState(playerState) {
    this._playerState = playerState;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        this._collidePlayerAndCollectible(collider, collidee);
      }
    } else if (collider instanceof boxy.GhostEntity) {
      if (collidee instanceof boxy.GhostEntity) {
        this._collideGhostAndGhost(collider, collidee);
      } else if (collidee === boxy.game.playerEntity) {
        this._collideGhostAndPlayer(collider, collidee);
      }
    }
  }
  
  // Dinner time for boxy
  _collidePlayerAndCollectible(collider, collidee) {
    switch (collidee.itemType) {
    case "folder" :
      this._entityManager.destroy(collidee);
      this._levelState.addToCollection(collidee);
      this._playerState.adjustStats("folder");
      this._collectiblesManager.consume(collidee);
      break;
    case "collection" :
      this._entityManager.destroy(collidee);
      this._playerState.adjustStats("collection");
      this._levelState.registerCollection(collidee);
      this._collectiblesManager.consume(collidee);
      break;
    case "disk" :
      this._entityManager.destroy(collidee);
      this._playerState.adjustStats("disk");
      this._collectiblesManager.consume(collidee);
      break;
    }
  }
  
  _collideGhostAndGhost(collider, collidee) {
    var rc = collider.nextRc();
    // Ghost should reverse directions
    //console.log("Ghost on ghost violence", collider.rc, rc, collidee.rc);
    if (rc[0] == collidee.rc[0] && rc[1] == collidee.rc[1]) {
      console.log("Turn the beat around");
      collider.reverseDirection();
    } else {
      //console.log("Turn the other cheek");
    }
    
    //collidee.reverseDirection();
  }
  
  _collideGhostAndPlayer(ghost, player) {
    // No collision if the player was invincible (but not sprinting), or the ghost was out of commission
    if ((player.isInvincible && !this._playerState.isSprinting) || ghost.isEaten) {
      return;
    }
    
    // Boxy is sprinting, and therefore eats the ghosts instead of being hit by them
    if (this._playerState.isSprinting) {
      ghost.eatenFor(boxy.GHOST_EATEN_TIME);
      this._playerState.adjustStats("ghost");
      return;
    }
    
    // Boxy is hit by the ghost, and therefore loses progress
    var difficulty = boxy.DIFFICULTY_LEVELS[this._levelState.difficultyLevel];
    
    // Get the last N consumed objects, based on difficulty level
    var ejected = this._collectiblesManager.ejectConsumed(difficulty.damageCost);
    // Deregister lost objects from collection progress
    this._levelState.subtractFromCollections(ejected);
    
    // Substract the value of the last N consumed items
    for (var i = 0; i < ejected.length; i++) {
      var ejEntity = ejected[i];
      this._playerState.adjustStats(ejEntity.itemType, true);
    }
    
    // Make boxy invincible for a little while after
    player.invincibleTime = difficulty.invincibleDuration;
    player.freezeTime = difficulty.freezeDuration;
    
    console.log("Boxy lost the following items", ejected);
  }
  
  sprintRequested() {
    if (this._playerState.sprintReady) {
      this.sprintStart();
    }
  }
  
  sprintStart() {
    console.log("Boxy sprint!");
    this._playerState.sprintTime = boxy.SPRINT_DURATION;
    boxy.game.playerEntity.boostSpeed(boxy.SPRINT_SPEED_MULTIPLIER);
  }
  
  sprintEnd() {
    console.log("Sprint over, boxy can relax");
    this._playerState.sprintTime = 0;
    this._playerState.sprintCooldown = boxy.SPRINT_COOLDOWN;
    boxy.game.playerEntity.resetSpeed();
  }
  
  collectionRegistered(data) {
    var colors = this._levelState.activeColors;
    colors.push(data.color);
    this._collectiblesManager.folderColors = colors;
    
    var folders = this._entityManager.getCollectiblesByType("folder");
    this._collectiblesManager.randomizeFolderColors(folders);
  }
  
  collectionCompleted(data) {
    var colors = this._levelState.activeColors;
    var index = colors.indexOf(data.color);
    colors.splice(index, 1);
    
    this._collectiblesManager.folderColors = colors;
    
    var folders = this._entityManager.getCollectiblesByType("folder");
    this._collectiblesManager.randomizeFolderColors(folders);
  }
};
boxy.GameHud = class {
  constructor() {
    this._sizes = ['mb', 'gb', 'tb', 'pb'];
  }
  
  set playerState(state) {
    this._playerState = state;
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }

  draw() {
    this._scoreText = this._spriteFactory.createText("");
    this._scoreText.x = boxy.game.w - 10;
    this._scoreText.y = 50;
    this._scoreText.textAlign = "right";

    this._diskUsageText = this._spriteFactory.createText("");
    this._diskUsageText.x = boxy.game.w / 2;
    this._diskUsageText.y = 50;
    this._diskUsageText.textAlign = "right";
    this._diskDivider = this._spriteFactory.createText("/");
    this._diskDivider.x = boxy.game.w / 2;
    this._diskDivider.y = 50;
    this._diskCapacityText = this._spriteFactory.createText("");
    this._diskCapacityText.x = boxy.game.w / 2 + 30;
    this._diskCapacityText.y = 50;
    this._diskCapacityText.textAlign = "left";
  }

  update() {
    this._scoreText.text = this._playerState.score;
    this._diskUsageText.text = this._formatDiskUsage(this._playerState.diskUsage);
    this._diskCapacityText.text = this._formatDiskUsage(this._playerState.diskCapacity);
  }

  _formatDiskUsage(bytes) {
    if (bytes == 0) return '0b';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return Math.round(bytes / Math.pow(1000, i), 2) + this._sizes[i];
  }

};
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
        
        boxy.game.eventHandler.collectionCompleted(collection);
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
};
boxy.indexOfPair = function(array, pair) {
  for (var i = 0; i < array.length; i++) {
    var aPair = array[i];
    if (aPair[0] == pair[0] && aPair[1] == pair[1]) {
      return i;
    }
  }
  return -1;
}

boxy.calculateMoveDelta = function(speed) {
  return boxy.game.tick.delta / 1000 * speed;
}

boxy.isString = function(value) {
  return typeof value === 'string' || value instanceof String;
}

boxy.arrayDifference = function(a1, a2) {
  var result = [];
  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }
  }
  return result;
};
boxy.defaults = {
  idle_time: 40,
  grid_size: 70,
  map_file: "test.json",
  initial_capacity: 10000,
  map_offset_y : 60,
  map_offset_x : 5,
  collectibles : {
    folder : {
      score : 5,
      disk : 1,
      respawnDistance : 3,
      respawnTime : 10000
    },
    collection : {
      score : 100,
      disk : 1,
      respawnDistance : 5,
      respawnTime : 40000
    },
    disk : {
      score : 50,
      disk : 0,
      capacity : 20000,
      respawnDistance : 5,
      respawnTime : 40000
    },
    ghost : {
      score : 20
    }
  }
};

boxy.game = (function () {
  var KEYCODE_DOWN = 40;
  var KEYCODE_UP = 38;
  var KEYCODE_LEFT = 37;
  var KEYCODE_RIGHT = 39;
  var KEYCODE_W = 87;
  var KEYCODE_A = 65;
  var KEYCODE_D = 68;
  var KEYCODE_S = 83;

  var KEYCODE_SPACE = 32;

  var stage, w, h;
  var loader;

  var spriteFactory;
  var entityFactory;
  
  var entityManager;
  var collectiblesManager;
  
  var gameHud;

  var stageMap;
  var levelState;
  var playerState;

  var mobileEntities;
  var playerEntity;

  document.onkeydown = handleKeyDown;

  var game = {};
  game.settings = boxy.defaults;

  game.init = function() {
    this.stage = new createjs.Stage("boxyCanvas", false, false);
    this.w = this.stage.canvas.width;
    this.h = this.stage.canvas.height;

    manifest = [
        {src : "boxy_spritesheet.png", id : "boxy_sprite"},
        {src : "ghost_spritesheet.png", id : "ghost_sprite"},
        {src : "map_spritesheet.png", id : "map_sprite"},
        {src : "collectibles_spritesheet.png", id : "collectibles_sprite"},
        {src : "slkscr.ttf", id : "font_ttf"}
    ];
    mapsManifest = [
      {src : "test.json", id : "test_map"}
    ];
    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "art/");
    loader.loadManifest(mapsManifest, true, "maps/");
  }

  function handleComplete(eventx) {
    background = new createjs.Shape();
    background.graphics.beginFill("#1a3149").drawRect(0, 0, game.w, game.h);
    game.stage.addChild(background);

    spriteFactory = new boxy.SpriteFactory(loader, game.stage);
    spriteFactory.init();
    entityManager = new boxy.MapEntityManager(game.stage);
    entityFactory = new boxy.MapEntityFactory(entityManager, spriteFactory, game.stage);
    
    // Setup map manager
    mapData = {};
    loader.getItems(true).forEach(function(loaded){
      if (loaded.item.path == "maps/") {
        mapData[loaded.item.id] = loaded.result;
      }
    });
    game.stageMap = new boxy.StageMap(mapData, spriteFactory, game.settings.grid_size,
      game.settings.map_offset_x, game.settings.map_offset_y);
    game.stageMap.selectMap("test_map").renderMap();
    
    levelState = new boxy.LevelState(0);
    playerState = new boxy.PlayerState(game.settings.initial_capacity);

    // Initialize the event handler
    game.eventHandler = new boxy.EventHandler();

    // Initialize mobile game objects
    game.mobileEntities = [];
    game.playerEntity = entityFactory.addBoxy([1, 1], 250);
    entityFactory.addGhost([1, 10], 0);
    entityFactory.addGhost([1, 8], 1);
    entityFactory.addGhost([1, 6], 2);
    entityFactory.addGhost([1, 4], 3);

    // initialize collectible items
    collectiblesManager = new boxy.CollectiblesManager(game.stageMap, entityFactory);
    collectiblesManager.folderColors = levelState.activeColors;
    collectiblesManager.spawnAll();
    
    game.eventHandler.collectiblesManager = collectiblesManager;
    game.eventHandler.levelState = levelState;
    game.eventHandler.entityManager = entityManager;
    game.eventHandler.playerState = playerState;

    gameHud = new boxy.GameHud();
    gameHud.spriteFactory = spriteFactory;
    gameHud.playerState = playerState;
    gameHud.draw();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
  }

  function tick(event) {
    game.tick = event;
    
    playerState.update();
    
    entityManager.update();

    gameHud.update();
    
    collectiblesManager.update();

    game.stage.update(event);
  }

  function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
      var e = window.event;
    }
    switch (e.keyCode) {
      case KEYCODE_SPACE:
        game.eventHandler.sprintRequested();
        e.preventDefault();
        e.stopPropagation();
        return false;
      case KEYCODE_A:
      case KEYCODE_LEFT:
        game.playerEntity.nextDirection = 3;
        return false;
      case KEYCODE_D:
      case KEYCODE_RIGHT:
        game.playerEntity.nextDirection = 1;
        return false;
      case KEYCODE_W:
      case KEYCODE_UP:
        game.playerEntity.nextDirection = 0;
        return false;
      case KEYCODE_S:
      case KEYCODE_DOWN:
        game.playerEntity.nextDirection = 2;
        return false;
    }
  }

  return game;
})();