boxy.GameMode = class {
  constructor(settings) {
    this._settings = settings;
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }
  
  set stage(stage) {
    this._stage = stage;
  }
  
  set loader(loader) {
    this._loader = loader;
  }
  
  init() {
    this._entityManager = new boxy.MapEntityManager(this._stage);
    var entityFactory = new boxy.MapEntityFactory();
    
    // Setup map manager
    var mapData = {};
    this._loader.getItems(true).forEach(function(loaded){
      if (loaded.item.path == "maps/") {
        mapData[loaded.item.id] = loaded.result;
      }
    });
    var stageMap = new boxy.StageMap(mapData, this._spriteFactory, this._settings.grid_size,
      this._settings.map_offset_x, this._settings.map_offset_top, this._settings.map_offset_bottom);
    stageMap.selectMap("test_map").renderMap();
    
    // Rescale content to match ratio of the canvas
    var mapDimensions = stageMap.mapDimensions;
    var ratio = mapDimensions[0] / mapDimensions[1];
    var windowRatio = boxy.game.w / boxy.game.h;
    var scale = boxy.game.w / mapDimensions[0];
    if (windowRatio > ratio) {
        scale = boxy.game.h / mapDimensions[1];
    }
    this._stage.scaleX = this._stage.scaleY = scale;
    
    this._levelState = new boxy.LevelState(0, 0);
    this._playerState = new boxy.PlayerState(this._settings.initial_capacity);

    // Initialize the event handler
    boxy.game.eventHandler = new boxy.EventHandler();

    // initialize collectible items
    this._collectiblesManager = new boxy.CollectiblesManager(stageMap, this._levelState.spawnInfo, entityFactory);
    this._collectiblesManager.folderColors = this._levelState.activeColors;
    
    this._gameHud = new boxy.GameHud();
    
    // Inject dependencies
    boxy.game.eventHandler.collectiblesManager = this._collectiblesManager;
    boxy.game.eventHandler.levelState = this._levelState;
    boxy.game.eventHandler.entityManager = this._entityManager;
    boxy.game.eventHandler.playerState = this._playerState;
    boxy.game.eventHandler.gameHud = this._gameHud;
    boxy.game.eventHandler.spriteFactory = this._spriteFactory;
    boxy.game.eventHandler.gameMode = this;
    
    entityFactory.stage = this._stage;
    entityFactory.stageMap = stageMap;
    entityFactory.entityManager = this._entityManager;
    entityFactory.spriteFactory = this._spriteFactory;

    this._gameHud.spriteFactory = this._spriteFactory;
    this._gameHud.playerState = this._playerState;
    this._gameHud.levelState = this._levelState;
    this._gameHud.wh = mapDimensions;
    console.log("dims", mapDimensions);
    this._gameHud.draw();
    
    boxy.game.dimensions = mapDimensions;
    
    // Setup game objects
    // Initialize mobile game objects
    var playerEntity = entityFactory.addBoxy([1, 1], 250);
    entityFactory.addGhost([1, 10], 0);
    entityFactory.addGhost([1, 8], 1);
    entityFactory.addGhost([1, 6], 2);
    entityFactory.addGhost([1, 4], 3);
    
    this._playerState.playerEntity = playerEntity;
    
    this._collectiblesManager.playerState = this._playerState;
    this._collectiblesManager.spawnAll();
  }
  
  tick(e) {
    if (this._paused) {
      return;
    }
    
    this._playerState.update();
    
    this._entityManager.update();

    this._gameHud.update();
    
    this._collectiblesManager.update();
  }
  
  pause() {
    this._paused = true;
    return this;
  }
  
  unpause() {
    this._paused = false;
    return this;
  }
  
  handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
      var e = window.event;
    }
    switch (e.keyCode) {
      case boxy.KEYCODE_SPACE:
        boxy.game.eventHandler.sprintRequested();
        return false;
      case boxy.KEYCODE_A:
      case boxy.KEYCODE_LEFT:
        this._playerState._playerEntity.nextDirection = 3;
        return false;
      case boxy.KEYCODE_D:
      case boxy.KEYCODE_RIGHT:
        this._playerState._playerEntity.nextDirection = 1;
        return false;
      case boxy.KEYCODE_W:
      case boxy.KEYCODE_UP:
        this._playerState._playerEntity.nextDirection = 0;
        return false;
      case boxy.KEYCODE_S:
      case boxy.KEYCODE_DOWN:
        this._playerState._playerEntity.nextDirection = 2;
        return false;
    }
  }
}