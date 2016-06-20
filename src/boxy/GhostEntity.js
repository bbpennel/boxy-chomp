boxy.GhostEntity = class extends boxy.MobileEntity {
  constructor(row, column, speed, sprite, spritePrefix) {
    super(row, column, speed, sprite, spritePrefix);
  }

  get nextDirection() {
    if (this._nextDirection != null || !this._positionChanged) {
      return this._nextDirection;
    }

    var dirs = boxy.game.stageMap.allowedDirections(this._rc);

    if (this._currentDirection == null) {
      var randomDir = Math.floor(Math.random() * dirs.length);
      this._nextDirection = dirs[randomDir];
      return this._nextDirection;
    }

    // Prevent reversal if there are any other options
    if (dirs.length > 1) {
      var reverse = (this._currentDirection + 2) % 4;
      var reverseIndex = dirs.indexOf(reverse);
      if (reverseIndex != -1) {
        dirs.splice(reverseIndex, 1);
      }
    }

    var randomDir = Math.floor(Math.random() * dirs.length);
    this._nextDirection = dirs[randomDir];

    // console.log("Picked new direction", this._nextDirection, "from options", dirs, 
    //   "at position", this._rc, "previous dir", this._currentDirection);
    return this._nextDirection;
  }
}