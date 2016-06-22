boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(rc, itemType, format, color, sprite) {
    super(rc, sprite);
    this._itemType = itemType;
    this._format = format;
    this._color = color;
    this._stateChange = true;
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

  updateDisplay() {
    if (!this._stateChange) {
      return;
    }

    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];
  }
}