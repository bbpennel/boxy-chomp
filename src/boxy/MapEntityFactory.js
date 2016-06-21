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

  addFolder(row, column, format, color) {
    var sprite = this._spriteFactory.createFolderSprite(format, color);
    var entity = new boxy.CollectibleEntity(row, column, "folder", format, color, sprite);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
    return entity;
  }

  addCollection(row, column, format, color) {
    var sprite = this._spriteFactory.createCollectionSprite(format, color);
    var entity = new boxy.CollectibleEntity(row, column, "collection", format, color, sprite);
    entity.collisionRadiusRatio = 0.6;
    this._entityManager.register(entity);
    return entity;
  }
  
  addDisk(row, column) {
    var sprite = this._spriteFactory.createDiskSprite();
    var entity = new boxy.CollectibleEntity(row, column, "disk", null, null, sprite);
    entity.collisionRadiusRatio = 0.7;
    this._entityManager.register(entity);
    return entity;
  }
  
  addGhost(row, column, ghostIdentity) {
    var sprite = this._spriteFactory.createGhostSprite();
    var speed = 5;
    var prefix;
    if (ghostIdentity == 0) {
      prefix = "i_";
    }
    var entity = new boxy.GhostEntity(row, column, speed, sprite, prefix);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }
}