boxy.MapEntityFactory = class {
  constructor(entityManager, spriteFactory, stage) {
    this._entityManager = entityManager;
    this._spriteFactory = spriteFactory;
    this._stage = stage;
  }

  addBoxy(rc, speed) {
    var sprite = this._spriteFactory.createBoxySprite();
    var entity = new boxy.MobileEntity(rc, speed, sprite);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }

  addFolder(rc, color) {
    var sprite = this._spriteFactory.createFolderSprite(color);
    var entity = new boxy.CollectibleEntity(rc, "folder", null, color, sprite);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
    return entity;
  }

  addCollection(rc, format, color) {
    var sprite = this._spriteFactory.createCollectionSprite(format, color);
    var entity = new boxy.CollectibleEntity(rc, "collection", format, color, sprite);
    entity.collisionRadiusRatio = 0.6;
    this._entityManager.register(entity);
    return entity;
  }
  
  addDisk(rc) {
    var sprite = this._spriteFactory.createDiskSprite();
    var entity = new boxy.CollectibleEntity(rc, "disk", null, null, sprite);
    entity.collisionRadiusRatio = 0.7;
    this._entityManager.register(entity);
    return entity;
  }
  
  addGhost(rc, ghostIdentity) {
    var sprite = this._spriteFactory.createGhostSprite();
    var speed = 200;
    var prefix;
    switch (ghostIdentity) {
      case 0:
        prefix = "i_";
        break;
      case 1:
        prefix = "cw_";
        break;
      case 2:
        prefix = "hat_";
        break;
      case 3:
        prefix = "mol_";
        break;
    }
    if (ghostIdentity == 0) {
      prefix = "i_";
    }
    var entity = new boxy.GhostEntity(rc, speed, sprite, prefix);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }
}