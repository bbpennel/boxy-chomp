boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(rc, itemType, category, color, sprite) {
    super(rc, sprite);
    this._itemType = itemType;
    this._category = category;
    this._color = color;
    this._stateChange = true;
  }

  get itemType() {
    return this._itemType;
  }
  
  get category() {
    return this._category;
  }
  
  get color() {
    return this._color;
  }

  updateDisplay() {
    if (!this._stateChange) {
      return;
    }

    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];
  }
}