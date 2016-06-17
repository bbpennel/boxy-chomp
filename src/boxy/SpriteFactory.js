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
}