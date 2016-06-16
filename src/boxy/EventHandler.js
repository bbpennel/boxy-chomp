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
          console.log("Ate a folder!!!!");
        }
      }
    }
  }
}