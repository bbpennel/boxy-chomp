boxy.MapEntityFactory = class {
  constructor() {
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }
  
  set stage(stage) {
    this._stage = stage;
  }
  
  set stageMap(stageMap) {
    this._stageMap = stageMap;
  }
  
  set entityManager(manager) {
    this._entityManager = manager;
  }

  addBoxy(rc, speed) {
    var xy = this._stageMap.gridToCoordinate(rc);
    var sprite = this._spriteFactory.createBoxySprite(xy);
    var entity = new boxy.MobileEntity(rc, speed, sprite, null, this._stageMap);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }

  addFolder(rc, color) {
    var xy = this._stageMap.gridToCoordinate(rc);
    var sprite = this._spriteFactory.createFolderSprite(xy, color);
    var entity = new boxy.CollectibleEntity(rc, "folder", null, color, sprite, this._stageMap);
    entity.collisionRadiusRatio = 0.1;
    this._entityManager.register(entity);
    return entity;
  }

  addCollection(rc, format, color) {
    var xy = this._stageMap.gridToCoordinate(rc);
    var sprite = this._spriteFactory.createCollectionSprite(xy, format, color);
    var entity = new boxy.CollectibleEntity(rc, "collection", format, color, sprite, this._stageMap);
    entity.collisionRadiusRatio = 0.6;
    this._entityManager.register(entity);
    return entity;
  }
  
  addDisk(rc) {
    var xy = this._stageMap.gridToCoordinate(rc);
    var sprite = this._spriteFactory.createDiskSprite(xy);
    var entity = new boxy.CollectibleEntity(rc, "disk", null, null, sprite, this._stageMap);
    entity.collisionRadiusRatio = 0.7;
    this._entityManager.register(entity);
    return entity;
  }
  
  addGhost(rc, ghostIdentity) {
    var xy = this._stageMap.gridToCoordinate(rc);
    var sprite = this._spriteFactory.createGhostSprite(xy);
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
    var entity = new boxy.GhostEntity(rc, speed, sprite, prefix, this._stageMap);
    this._entityManager.register(entity);
    entity.collisionRadiusRatio = 0.9;
    return entity;
  }
}