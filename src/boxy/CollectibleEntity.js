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
}