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
}