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