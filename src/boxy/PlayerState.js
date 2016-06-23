boxy.PlayerState = class {
  constructor(startingCapacity) {
    this._sprintTime = 0;
    this._score = 0;
    this._diskUsage = 0;
    this._diskCapacity = startingCapacity;
  }
  
  get sprintReady() {
    return this._spriteTime == 0;
  }
  
  set sprintTime(time) {
    this._sprintTime = time;
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

  adjustStats(stats, subtract) {
    if (boxy.isString(stats)) {
      stats = boxy.game.settings.collectibles[stats];
    }
    
    if (stats.score) {
      this._score += (subtract? -1 : 1) * stats.score;
      boxy.game.stats.score += (subtract? -1 : 1) * stats.score;
    }
    if (stats.disk) {
      this._diskUsage += (subtract? -1 : 1) * stats.disk;
    }
    if (stats.capacity) {
      this._diskCapacity += (subtract? -1 : 1) * stats.capacity;
    }
  }
}