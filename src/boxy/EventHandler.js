boxy.EventHandler = class {
  constructor() {
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }
  
  set collectiblesManager(manager) {
    this._collectiblesManager = manager;
  }
  
  set entityManager(manager) {
    this._entityManager = manager;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        switch (collidee.itemType) {
        case "folder" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.collectibles.folder);
          this._collectiblesManager.markForRespawn(collidee.rc);
          break;
        case "collection" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.collectibles.collection);
          this._levelState.registerCollection(collidee);
          this._collectiblesManager.markForRespawn(collidee.rc);
          break;
        case "disk" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.collectibles.disk);
          this._collectiblesManager.markForRespawn(collidee.rc);
          break;
        }
      }
    }
  }

  _adjustStats(stats) {
    if (stats.score) {
      boxy.game.stats.score += stats.score;
    }
    if (stats.disk) {
      boxy.game.stats.diskUsage += stats.disk;
    }
    if (stats.capacity) {
      boxy.game.stats.diskCapacity += stats.capacity;
    }
  }
}