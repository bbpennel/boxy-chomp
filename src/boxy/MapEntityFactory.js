boxy.MapEntityFactory = class {
  constructor(spriteFactory, stage) {
    this._spriteFactory = spriteFactory;
    this._stage = stage;
  }

  addBoxy(row, column, speed) {
  	var sprite = this._spriteFactory.createBoxySprite();
  	this._stage.addChild(sprite);
  	var entity = new boxy.MobileEntity(row, column, speed, sprite);
  	return entity;
  }
}