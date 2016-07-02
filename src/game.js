boxy.defaults = {
  idle_time: 40,
  grid_size: 70,
  map_file: "maps.json",
  initial_capacity: 10000,
  map_offset_top : 60,
  map_offset_bottom : 60,
  map_offset_x : 5
};

boxy.game = (function () {
  var stage, w, h;
  var loader;

  var spriteFactory;
  var mapsData, levelsData;
  
  var mode;

  document.onkeydown = handleKeyDown;

  var game = {};
  game.settings = boxy.defaults;

  game.init = function() {
    stage = new createjs.Stage("boxyCanvas", false, false);
    this.w = stage.canvas.width;
    this.h = stage.canvas.height;

    manifest = [
        {src : "boxy_spritesheet.png", id : "boxy_sprite"},
        {src : "ghost_spritesheet.png", id : "ghost_sprite"},
        {src : "map_spritesheet.png", id : "map_sprite"},
        {src : "collectibles_spritesheet.png", id : "collectibles_sprite"},
        {src : "slkscr.ttf", id : "font_ttf"}
    ];
    dataManifest = [
      {src : "maps.json", id : "mapsData"},
      {src : "levels.json", id : "levelsData"}
    ];
    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "art/");
    loader.loadManifest(dataManifest, true, "data/");
  };
  
  game.switchToSummaryMode = function(playerState, levelState, eventTracker) {
    spriteFactory.resetAll();
    
    mode = new boxy.LevelSummaryMode();
    mode.spriteFactory = spriteFactory;
    mode.stage = stage;
    mode.playerState = playerState;
    mode.levelState = levelState;
    mode.eventTracker = eventTracker;
    
    mode.init().draw();
  };

  function handleComplete(event) {
    mapsData = loader.getResult("mapsData");
    levelsData = loader.getResult("levelsData");
    
    spriteFactory = new boxy.SpriteFactory(loader, stage);
    spriteFactory.init();
    
    mode = new boxy.GameMode(game.settings);
    mode.spriteFactory = spriteFactory;
    mode.stage = stage;
    mode.loader = loader;
    mode.mapsData = mapsData;
    mode.levelsData = levelsData;
    mode.levelNumber = 0;
    
    mode.init();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
    
    boxy.game.eventHandler.startLevel();
  }

  function tick(event) {
    game.tick = event;
    
    mode.tick(event);
    
    stage.update(event);
  }

  function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
      var e = window.event;
    }
    
    return mode.handleKeyDown(e);
  }

  return game;
})();