boxy.MobileEntity = class extends boxy.MapEntity {
  constructor(row, column, speed, sprite, spritePrefix) {
    super(row, column, sprite);
    this._speed = speed;
    this._stopTimer = 0;
    this._idle = false;
    this._spritePrefix = spritePrefix || "";
    this._positionChanged = true;
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

  update() {
    this.updatePosition();
    this.updateDisplay();

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
    var newX = this._xy[0], newY = this._xy[1];
    var newGrid = this._rc;

    if (this._currentDirection != null) {
      switch (this.currentDirection) {
        case 0:
          newY -= this.speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
          break;
        case 1:
          newX += this.speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX + boxy.game.settings.grid_size, newY]);
          break;
        case 2:
          newY += this.speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY + boxy.game.settings.grid_size]);
          break;
        case 3:
          newX -= this.speed;
          newGrid = boxy.game.stageMap.coordinateToGrid([newX, newY]);
          break;
      }

      this._positionChanged = newGrid[0] != this._rc[0] || newGrid[1] != this._rc[1];
    }

    if (!this._directionChanged && (this._positionChanged || this._currentDirection == null)) {
      // Retrieve or compute the next direction if one is provided
      var nextDirection = this.nextDirection;

      var dirs = boxy.game.stageMap.allowedDirections(this._rc);
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
    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];

    if (this._animationChange) {
      if (this._idle) {
        this._sprite.gotoAndPlay(this._spritePrefix + "idle");
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
        this._sprite.gotoAndPlay(this._spritePrefix + "move_" + dirName);
      }
    }
    return this;
  }
}