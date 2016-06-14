boxy.MapEntity = class {
  constructor(row, column, sprite) {
    this._rc = [row, column];
    this._snapToGrid();
    this._sprite = sprite;
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

  _snapToGrid() {
    this._xy = boxy.game.stageMap.gridToCoordinate(this._rc);
  }

  _addToGame() {
    game.stage
  }

  updateDisplay() {
  }
}