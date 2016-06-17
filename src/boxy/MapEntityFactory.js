boxy.MapEntityFactory = class {
  constructor(entityManager, spriteFactory, stage) {
    this._entityManager = entityManager;
    this._spriteFactory = spriteFactory;
    this._stage = stage;
  }

  addBoxy(row, column, speed) {
    var sprite = this._spriteFactory.createBoxySprite();
    var entity = new boxy.MobileEntity(row, column, speed, sprite);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }

  addFolder(row, column, color) {
    var sprite = this._spriteFactory.createFolderSprite(color);
    var entity = new boxy.CollectibleEntity(row, column, 0, sprite);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
    return entity;
  }
}