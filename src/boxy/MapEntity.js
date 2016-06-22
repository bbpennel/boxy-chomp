boxy.MapEntity = class {
  constructor(rc, sprite) {
    this._rc = [rc[0], rc[1]];
    this._snapToGrid();
    this._sprite = sprite;
    this.collisionRadiusRatio = 0.5;
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
     if (this._invincibleTime) {
       this._invincibleTime -= boxy.game.tick.delta;
     }
  }

  updateDisplay() {
  }
}