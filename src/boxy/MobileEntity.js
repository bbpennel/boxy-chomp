boxy.MobileEntity = class extends boxy.MapEntity {
  constructor(rc, speed, sprite, spritePrefix, stageMap) {
    super(rc, sprite, stageMap);
    this._speed = speed;
    this._computedSpeed = speed;
    this._stopTimer = 0;
    this._idle = false;
    this._spritePrefix = spritePrefix || "";
    this._positionChanged = true;
    this._freezeTime = 0;
  }

  set nextDirection(dir) {
    if (dir == this._currentDirection) {
      this._nextDirection = null;
      return this;
    }
    this._nextDirection = dir;
    return this;
  }

  get nextDirection() {
    return this._nextDirection;
  }
  
  reverseDirection() {
    if (this._currentDirection != null) {
      this._nextDirection = (this._currentDirection + 2) % 4;
    }
  }
  
  set freezeTime(time) {
    this._freezeTime = time;
  }
  
  get isFrozen() {
    return this._freezeTime > 0;
  }
  
  // Get the row/column position in the current 
  nextRc() {
    var row = this._rc[0], column = this._rc[1];
    switch (this._currentDirection) {
    case 0:
      return [row - 1, column];
    case 1:
      return [row, column + 1];
    case 2:
      return [row + 1, column];
    case 3:
      return [row, column - 1];
    }
    return this._rc;
  }

  get currentDirection() {
    return this._currentDirection;
  }

  set currentDirection(dir) {
    this._currentDirection = dir;
  }

  get speed() {
    return this._speed;
  }

  set speed(speed) {
    this._speed = speed;
  }
  
  boostSpeed(multiplier) {
    this._computedSpeed = this._speed * multiplier;
  }
  
  resetSpeed() {
    this._computedSpeed = this._speed;
  }
  
  changeAnimation(animation) {
    this._sprite.gotoAndPlay(this._spritePrefix + animation);
    return this;
  }

  update() {
    this.updatePosition();
    this.updateDisplay();

    this.updateState();
  }
  
  updateState() {
    super.updateState();
    
    if (this._freezeTime) {
      this._freezeTime -= boxy.game.tick.delta;
      if (this._freezeTime < 0) {
        this._freezeTime = 0;
      }
    }
    
    // If not moving, wait a bit then start to idle
    if (this.currentDirection == null) {
      this._stopTimer++;
    }
    if (this._stopTimer == boxy.game.settings.idle_time) {
      this._idle = true;
      this._animationChange = true;
    }

    this._clearMovementFlags();
  }

  _movementStopped() {
    this._currentDirection = null;
    this._nextDirection = null;
    this._movementChange = true;
    this._stopTimer = 0;
    this._nextDirection = null;
    this._directionChanged = false;
  }

  _changeDirection(direction) {
    this.currentDirection = this._nextDirection;
    this._nextDirection = null;
    this._movementChange = true;
    this._idle = false;
    this._directionChanged = true;
  }

  _clearMovementFlags() {
    this._positionChanged = false;
    this._movementChange = false;
  }

  updatePosition() {
    if (this.isFrozen) {
      return;
    }
    
    var newX = this._xy[0], newY = this._xy[1];
    var newGrid = this._rc;

    if (this._currentDirection != null) {
      var speed = boxy.calculateMoveDelta(this._computedSpeed);
      switch (this.currentDirection) {
        case 0:
          newY -= speed;
          newGrid = this._stageMap.coordinateToGrid([newX, newY]);
          break;
        case 1:
          newX += speed;
          newGrid = this._stageMap.coordinateToGrid([newX + boxy.game.settings.grid_size, newY]);
          break;
        case 2:
          newY += speed;
          newGrid = this._stageMap.coordinateToGrid([newX, newY + boxy.game.settings.grid_size]);
          break;
        case 3:
          newX -= speed;
          newGrid = this._stageMap.coordinateToGrid([newX, newY]);
          break;
      }

      this._positionChanged = newGrid[0] != this._rc[0] || newGrid[1] != this._rc[1];
    }

    if (!this._directionChanged && (this._positionChanged || this._currentDirection == null)) {
      // Retrieve or compute the next direction if one is provided
      var nextDirection = this.nextDirection;

      var dirs = this._stageMap.allowedDirections(this._rc);
      if (nextDirection != null) {
        // make sure that the selected direction is allowed
        if (dirs.indexOf(nextDirection) != -1) {
          this._snapToGrid();
          this._changeDirection(nextDirection);
          return;
        }
      }
      // Can't go any further in the selected direction, and no further direction given
      if (this._currentDirection != null && dirs.indexOf(this._currentDirection) == -1) {
        this._snapToGrid();
        this._movementStopped();
        return;
      }
    }

    // Continue movement in the current direction
    this._xy = [newX, newY];
    this._rc = newGrid;
    this._directionChanged = false;

    return;
  }

  updateDisplay() {
    super.updateDisplay();
    
    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];

    if (this._animationChange) {
      if (this._idle) {
        this.changeAnimation("idle");
      }
      this._animationChange = false;
    }

    if (this._movementChange) {
      var dirName, stopMove;
      switch (this.currentDirection) {
        case 0:
          dirName = "up";
          break;
        case 1:
          dirName = "right";
          break;
        case 2:
          dirName = "down";
          break;
        case 3:
          dirName = "left";
          break;
        case null:
          stopMove = true;
          break;
      }
      if (stopMove) {
        this._sprite.stop();
      } else {
        this.changeAnimation("move_" + dirName);
      }
    }
    return this;
  }
}