boxy.MobileEntity = class extends boxy.MapEntity {
  constructor(row, column, speed, sprite) {
    super(row, column, sprite);
    this._speed = speed;
    this._stopTimer = 0;
    this._idle = false;
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
  }

  movementStopped() {
    this.currentDirection = null;
    this.movementChange = true;
    this._stopTimer = 0;
  }

  _directionChanged() {
    this.currentDirection = this.nextDirection;
    this.nextDirection = null;
    this.movementChange = true;
    this._idle = false;
  }

  updatePosition() {
    if (this.currentDirection == null) {
      if (this.nextDirection != null) {
        this._directionChanged();
      }
      return this;
    }
    var newX = this._xy[0], newY = this._xy[1];
    var newGrid;

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

    // Grid location has changed
    if (newGrid[0] != this._rc[0] || newGrid[1] != this._rc[1]) {
      if (this.nextDirection != null) {
        // Direct change is queued, try to see if we can change now
        var dirs = boxy.game.stageMap.allowedDirections(this._rc);
        if (dirs.indexOf(this.nextDirection) != -1) {
          this._directionChanged();
          this._snapToGrid();
        }
      }

      // Check to see if the new grid location would be a barrier
      if (!this.movementChange && boxy.game.stageMap.isBlocked(newGrid)) {
        // hit a wall, no new directions, so stop and snap to position
        this.movementStopped();
        this._snapToGrid();
      }
    }

    // Movement continues, update position info
    if (!this.movementChange) {
      this._xy = [newX, newY];
      this._rc = newGrid;
    }
  }

  updateDisplay() {
    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];

    if (this._animationChange) {
      if (this._idle) {
        this._sprite.gotoAndPlay("idle");
      }
      this._animationChange = false;
    }

    if (this.movementChange) {
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
        this._sprite.gotoAndPlay("move_" + dirName);
      }

      this.movementChange = false;
    }
    return this;
  }
}