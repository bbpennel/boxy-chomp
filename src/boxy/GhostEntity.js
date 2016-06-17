boxy.GhostEntity = class extends boxy.MobileEntity {
  constructor(row, column, speed, sprite, spritePrefix) {
    super(row, column, speed, sprite, spritePrefix);
  }
  
  update() {
    super.update();
    this._chooseDirection();
  }
  
  _chooseDirection() {
    if (!this._positionChanged) {
      return;
    }
    
    var dirs = boxy.game.stageMap.allowedDirections(this._rc);
    if (this._currentDirection != null) {
      var reverse = (this._currentDirection + 2) % 4;
      dirs.splice(dirs.indexOf(this._currentDirection, 1);
      var reverseIndex = dirs.indexOf(reverse)
      if (reverseIndex != -1) {
        dirs.splice(reverseIndex, 1);
      }
    }
    
    var allowUp = dirs.indexOf(0) != -1;
    var allowDown = dirs.indexOf(2) != -1;
    var allowLeft = dirs.indexOf(3) != -1;
    var allowRight = dirs.indexOf(1) != -1;
    
    if (dirs.length == 1 ) {
      this._nextDirection = dirs[0];
    } else if (this._currentDirection !== null && dirs.length == 2 && (allowLeft && allowRight) || (allowUp && allowDown)) {
      this._nextDirection = null;
    } else {
      var randomDir = Math.floor(Math.random() * dirs.length);
      this._nextDirection = dirs[randomDir];
    }
    console.log(this._nextDirection);
  }
}