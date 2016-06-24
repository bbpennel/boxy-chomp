boxy.MapEntity = class {
  constructor(rc, sprite) {
    this._rc = [rc[0], rc[1]];
    this._snapToGrid();
    this._sprite = sprite;
    this.collisionRadiusRatio = 0.5;
    this._invincibleTime = 0;
    this._blinkVisible = true;
    this._blinkTime = 0;
    this._blinkCycle = 0;
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
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

  get sprite() {
    return this._sprite;
  }
  
  set invincibleTime(time) {
    this._invincibleTime = time;
  }
  
  get isInvincible() {
    return this._invincibleTime != null && this._invincibleTime > 0;
  }
  
  set blinkTime(time) {
    this._blinkTime = time;
    this._blinkCycle = boxy.BLINK_ENTITY_RATE;
    this._blinkVisible = false;
  }

  center() {
    var offset = boxy.game.settings.grid_size / 2;
    return [this._xy[0] + offset, this._xy[1] + offset];
  }

  get collisionRadius() {
    return this._collisionRadius;
  }

  // Determines the size of this entities collision box, relative to the size of a grid node.
  // Ratio should be a number > 0 but less than 1
  set collisionRadiusRatio(ratio) {
    this._collisionRadius = boxy.game.settings.grid_size * (ratio / 2);
  }

  isCollidingWith(entity) {
    var thisCenter = this.center();
    var entityCenter = entity.center();
    var distX = Math.abs(thisCenter[0] - entityCenter[0]);
    var distY = Math.abs(thisCenter[1] - entityCenter[1]);
    var collideDist = this.collisionRadius + entity.collisionRadius;

    // Two grid objects are colliding if their collision boxes are overlapping, 
    // determined by the sum of their collision radiuses exceeding the distance between centers
    return distX <= collideDist && distY <= collideDist;
  }
  
  gridDistanceLessThan(rc, distance) {
    var distR = Math.abs(this.rc[0] - rc[0]);
    var distC = Math.abs(this.rc[1] - rc[1]);
    
    return distR < distance && distC < distance;
  }

  _snapToGrid() {
    this._xy = boxy.game.stageMap.gridToCoordinate(this._rc);
  }

  _addToGame() {
    game.stage
  }

  update() {
    this.updateDisplay();
    this.updateState();
  }
  
  updateState() {
     if (this._invincibleTime > 0) {
       this._invincibleTime -= boxy.game.tick.delta;
     }
     
     // If blinking has been activated, then manage blink cycling until it is over
     if (this._blinkTime > 0) {
       this._blinkTime -= boxy.game.tick.delta;
       this._blinkCycle -= boxy.game.tick.delta;
       
       if (this._blinkTime <= 0) {
         this._blinkVisible = null;
         this._blinkDone = true;
       } else if (this._blinkCycle <= 0) {
         this._blinkVisible = !this._blinkVisible;
         this._blinkCycle = boxy.BLINK_ENTITY_RATE;
       }
     }
  }

  updateDisplay() {
    if (this._blinkVisible !== null) {
      this._sprite.visible = this._blinkVisible;
    } else if (this._blinkDone) {
      // Blinking has finished, make sure the sprite is visible in the end
      this._sprite.visible = true;
      this._blinkDone = false;
    }
  }
}