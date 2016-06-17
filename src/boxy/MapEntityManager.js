boxy.MapEntityManager = class {
  constructor(stage) {
    this._stage = stage;
    this._entities = [];
    this._nextId = 0;
    this._mobileEntities = [];
  }

  _generateId() {
    return ++this._nextId;
  }

  update() {
    this._entities.forEach(function(entity) {
      entity.update();
    });

    this.detectCollisions();
  }

  // Register a MapEntity 
  register(entity) {
    if (!(entity instanceof boxy.MapEntity)) {
      throw "Attempted to register non-entity object " + entity;
    }
    entity.id = this._generateId();
    this._entities.push(entity);
    if (entity instanceof boxy.MobileEntity) {
      this._mobileEntities.push(entity);
    }

    return this;
  }

  destroy(entity) {
    var eIndex = this._entities.indexOf(entity);
    var mIndex = this._mobileEntities.indexOf(entity);

    entity.sprite.parent.removeChild(entity.sprite);

    if (eIndex != -1) {
      this._entities.splice(eIndex, 1);
    }

    if (mIndex != -1) {
      this._mobileEntities.splice(mIndex, 1);
    }
  }

  // Return the entity with the given id
  findEntityById(id) {
    for (var i = 0; i < this._entities.length; i++) {
      var entity = this._entities[i];
      if (entity && entity.id == id) {
        return this._entities[i];
      }
    }
  }

  // Finds all entities within the same grid location or any of the 4 adjacent locations
  // as seekEntity
  findNeighbors(seekEntity) {
    var neighbors = [];
    var row = seekEntity.rc[0];
    var col = seekEntity.rc[1];

    for (var i = 0; i < this._entities.length; i++) {
      var entity = this._entities[i];
      if (!entity) continue;
      // Determine how far away this entity is
      var rDist = Math.abs(row - entity.rc[0]);
      var cDist = Math.abs(col - entity.rc[1]);
      // If the combined row and col distance is <= 1, then it is adjacent or overlapping
      // But is not the entity being calculated for
      if ((rDist + cDist) < 2 && entity !== seekEntity) {
        neighbors.push(entity);
      }
    }

    return neighbors;
  }

  detectCollisions() {
    for (var i = 0; i < this._mobileEntities.length; i++) {
      var entity = this._mobileEntities[i];
      if (!entity) continue;
      var neighbors = this.findNeighbors(entity);

      for (var j = 0; j < neighbors.length; j++) {
        var neighbor = neighbors[j];
        if (entity.isCollidingWith(neighbor)) {
          boxy.game.eventHandler.collisionEvent({
            collider : entity,
            collidee : neighbor
          });
        }
      }
    }
  }
}