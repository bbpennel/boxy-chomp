boxy.EventHandler = class {
  constructor(entityManager) {
    this._entityManager = entityManager;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        if (collidee.itemType == 0) {
          this._entityManager.destroy(collidee);
          this._adjustStats(boxy.game.settings.bonus.folder);
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