boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(row, column, itemType, spritesheet) {
    super(row, column, spritesheet);
    this._itemType = itemType;
  }

  draw() {
    switch (this._itemType) {
      case 1:
          this._sprite = new createjs.Sprite(this._spriteSheet, 0);
          break;
      case 2:
          this._sprite = new createjs.Sprite(this._spriteSheet, 1);
          break;
    }
    this._addToGame();
  }

  updateDisplay() {

  }
}