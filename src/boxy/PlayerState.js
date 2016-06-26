boxy.PlayerState = class {
  constructor(startingCapacity) {
    this._score = 0;
    this._diskUsage = 0;
    this._diskCapacity = startingCapacity;
    this._sprintCooldown = 0;
    this._sprintTime = 0;
  }
  
  get sprintReady() {
    return this._sprintCooldown <= 0 && this._sprintTime <= 0;
  }
  
  set sprintCooldown(time) {
    this._sprintCooldown = time;
  }
  
  get isSprinting() {
    return this._sprintTime > 0;
  }
  
  set sprintTime(time) {
    this._sprintTime = time;
    this._sprintInitialTime = time;
  }
  
  get sprintPercentRemaining() {
    return this._sprintTime / this._sprintInitialTime;
  }
  
  get score() {
    return this._score;
  }
  
  get diskUsage() {
    return this._diskUsage;
  }
  
  get diskCapacity() {
    return this._diskCapacity;
  }
  
  update() {
    if (!this.sprintReady) {
      this._sprintCooldown -= boxy.game.tick.delta;
      if (this._sprintCooldown < 0) {
        boxy.game.eventHandler.sprintEvent("ready");
        this._sprintCooldown = 0;
      }
    }
    
    if (this.isSprinting) {
      this._sprintTime -= boxy.game.tick.delta;
      if (this._sprintTime <= 0) {
        boxy.game.eventHandler.sprintEvent("end");
      }
    }
  }

  adjustStats(stats, subtract) {
    if (boxy.isString(stats)) {
      stats = boxy.STAT_VALUES[stats];
    }
    
    if (stats.score) {
      this._score += (subtract? -1 : 1) * stats.score;
    }
    if (stats.disk) {
      this._diskUsage += (subtract? -1 : 1) * stats.disk;
    }
    if (stats.capacity) {
      this._diskCapacity += (subtract? -1 : 1) * stats.capacity;
    }
  }
}