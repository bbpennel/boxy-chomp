boxy.EventHandler = class {
  constructor(entityManager) {
    this._entityManager = entityManager;
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        switch (collidee.itemType) {
        case "folder" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.bonus.folder);
          break;
        case "collection" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.bonus.collection);
          this._levelState.registerCollection(collidee);
          break;
        case "disk" :
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.bonus.disk);
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