var boxy = boxy || {};;
boxy.MapEntity = class {
  constructor(row, column, sprite) {
    this._rc = [row, column];
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

  _snapToGrid() {
    this._xy = boxy.game.stageMap.gridToCoordinate(this._rc);
  }

  _addToGame() {
    game.stage
  }

  update() {
    this.updateDisplay();
  }

  updateDisplay() {
  }
};
boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(row, column, itemType, sprite) {
    super(row, column, sprite);
    this._itemType = itemType;
    this._stateChange = true;
  }

  get itemType() {
    return this._itemType;
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
;
boxy.MobileEntity = class extends boxy.MapEntity {
  constructor(row, column, speed, sprite) {
    super(row, column, sprite);
    this._speed = speed;
    this._stopTimer = 0;
    this._idle = false;
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

  update() {
    this.updatePosition();
    this.updateDisplay();

    // If not moving, wait a bit then start to idle
    if (this.currentDirection == null) {
      this._stopTimer++;
    }
    if (this._stopTimer == boxy.game.settings.idle_time) {
      this._idle = true;
      this._animationChange = true;
    }
  }

  movementStopped() {
    this.currentDirection = null;
    this.movementChange = true;
    this._stopTimer = 0;
  }

  _directionChanged() {
    this.currentDirection = this.nextDirection;
    this.nextDirection = null;
    this.movementChange = true;
    this._idle = false;
  }

  updatePosition() {
    if (this.currentDirection == null) {
      if (this.nextDirection != null) {
        this._directionChanged();
      }
      return this;
    }
    var newX = this._xy[0], newY = this._xy[1];
    var newGrid;

    switch (this.currentDirection) {
      case 0:
        newY -= this.speed;
        newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
        break;
      case 1:
        newX += this.speed;
        newGrid = boxy.game.stageMap.coordinateToGrid([newX + boxy.game.settings.grid_size, newY]);
        break;
      case 2:
        newY += this.speed;
        newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY + boxy.game.settings.grid_size]);
        break;
      case 3:
        newX -= this.speed;
        newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
        break;
    }

    // Grid location has changed
    if (newGrid[0] != this._rc[0] || newGrid[1] != this._rc[1]) {
      if (this.nextDirection != null) {
        // Direct change is queued, try to see if we can change now
        var dirs = boxy.game.stageMap.allowedDirections(this._rc);
        if (dirs.indexOf(this.nextDirection) != -1) {
          this._directionChanged();
          this._snapToGrid();
        }
      }

      // Check to see if the new grid location would be a barrier
      if (!this.movementChange && boxy.game.stageMap.isBlocked(newGrid)) {
        // hit a wall, no new directions, so stop and snap to position
        this.movementStopped();
        this._snapToGrid();
      }
    }

    // Movement continues, update position info
    if (!this.movementChange) {
      this._xy = [newX, newY];
      this._rc = newGrid;
    }
  }

  updateDisplay() {
    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];

    if (this._animationChange) {
      if (this._idle) {
        this._sprite.gotoAndPlay("idle");
      }
      this._animationChange = false;
    }

    if (this.movementChange) {
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
        this._sprite.gotoAndPlay("move_" + dirName);
      }

      this.movementChange = false;
    }
    return this;
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

    this._mapTilesSheet = new createjs.SpriteSheet({
        framerate: 0,
        "images": [this._loader.getResult("map_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 16, "regY": 0, "width": boxy.game.settings.grid_size}
      });
    this._mapTilesContainer = new createjs.SpriteContainer(this._mapTilesSheet);

    this._collectiblesSheet = new createjs.SpriteSheet({
        framerate: 0,
        "images": [this._loader.getResult("collectibles_sprite")],
        "frames": {"regX": 0, "height": boxy.game.settings.grid_size, "count": 16, "regY": 0, "width": boxy.game.settings.grid_size}
      });
    this._collectiblesContainer = new createjs.SpriteContainer(this._collectiblesSheet);

    this._textContainer = new createjs.Container();

    // Add containers to the stage in render order
    this._stage.addChild(this._mapTilesContainer, this._textContainer,
      this._collectiblesContainer, this._boxyContainer);
  }

  createBoxySprite() {
    var sprite = new createjs.Sprite(this._boxySheet, "move_down");
    this._boxyContainer.addChild(sprite);
    return sprite;
  }

  createMapTileSprite(tileValue) {
    var sprite = new createjs.Sprite(this._mapTilesSheet, tileValue);
    this._mapTilesContainer.addChild(sprite);
    sprite.stop();
    return sprite;
  }

  createFolderSprite(color) {
    var sprite = new createjs.Sprite(this._collectiblesSheet, color);
    this._collectiblesContainer.addChild(sprite);
    sprite.stop();
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

  addBoxy(row, column, speed) {
    var sprite = this._spriteFactory.createBoxySprite();
    var entity = new boxy.MobileEntity(row, column, speed, sprite);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }

  addFolder(row, column, color) {
    var sprite = this._spriteFactory.createFolderSprite(color);
    var entity = new boxy.CollectibleEntity(row, column, 0, sprite);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
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
};
boxy.EventHandler = class {
  constructor(entityManager) {
    this._entityManager = entityManager;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        if (collidee.itemType == 0) {
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.bonus.folder);
        }
      }
    }
  }

  _adjustStats(stats) {
    if (stats.score) {
      boxy.game.stats.score += stats.score;
    }
    if (stats.disk) {
      boxy.game.stats.diskUsage += stats.disk;
    }
    if (stats.capacity) {
      boxy.game.stats.diskCapacity += stats.capacity;
    }
  }
};
boxy.GameHud = class {
  constructor(spriteFactory) {
    this._sizes = ['mb', 'gb', 'tb', 'pb'];
    this._spriteFactory = spriteFactory;
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
    this._scoreText.text = boxy.game.stats.score;
    this._diskUsageText.text = this._formatDiskUsage(boxy.game.stats.diskUsage);
    this._diskCapacityText.text = this._formatDiskUsage(boxy.game.stats.diskCapacity);
  }

  _formatDiskUsage(bytes) {
    if (bytes == 0) return '0b';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return Math.round(bytes / Math.pow(1000, i), 2) + this._sizes[i];
  }

};
boxy.defaults = {
  idle_time: 40,
  grid_size: 70,
  map_file: "test.json",
  initial_capacity: 10000,
  map_offset_y : 60,
  map_offset_x : 5,
  bonus : {
    folder : {
      score : 5,
      disk : 1
    },
    hard_drive : {
      score : 5,
      disk : 0,
      capacity : 20000
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

  var mobileEntities;
  var playerEntity;

  document.onkeydown = handleKeyDown;

  var game = {};
  game.settings = boxy.defaults;

  game.stats = {
    level : 0,
    score : 0,
    bonus : 0,
    numberOfFiles : 0,
    numberOfFolders : 0,
    diskUsage : 0,
    diskCapacity : game.settings.initial_capacity
  };

  game.init = function() {
    this.stage = new createjs.Stage("boxyCanvas", false, false);
    this.w = this.stage.canvas.width;
    this.h = this.stage.canvas.height;

    manifest = [
        {src : "boxy_spritesheet.png", id : "boxy_sprite"},
        {src : "map_spritesheet.png", id : "map_sprite"},
        {src : "collectibles_spritesheet.png", id : "collectibles_sprite"},
        {src : "slkscr.ttf", id : "font_ttf"}
    ];
    mapsManifest = [
        {src : "test.json", id : "test_map"},
        {src : "test.json", id : "map2"}
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

    // Initialize the event handler
    game.eventHandler = new boxy.EventHandler(entityManager);

    // Initialize mobile game objects
    game.mobileEntities = [];
    game.playerEntity = entityFactory.addBoxy(1, 1, 5);

    game.mobileEntities.push(game.playerEntity);

    // initialize collectible items
    collectiblesManager = new boxy.CollectiblesManager(game.stageMap, entityFactory);
    collectiblesManager.spawnAll();

    gameHud = new boxy.GameHud(spriteFactory);
    gameHud.draw();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
  }

  function tick(event) {
    entityManager.update();

    gameHud.update();

    game.stage.update(event);
  }

  function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
      var e = window.event;
    }
    switch (e.keyCode) {
      case KEYCODE_SPACE:
        shootHeld = true;
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