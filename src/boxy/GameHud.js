boxy.GameHud = class {
  constructor() {
    this._sizes = ['mb', 'gb', 'tb', 'pb'];
  }
  
  set playerState(state) {
    this._playerState = state;
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }
  
  set wh(wh) {
    this._wh = wh;
  }

  draw() {
    this._scoreText = this._spriteFactory.createText("");
    this._scoreText.x = this._wh[0] - 10;
    this._scoreText.y = 50;
    this._scoreText.textAlign = "right";

    this._diskUsageText = this._spriteFactory.createText("");
    this._diskUsageText.x = this._wh[0] / 2;
    this._diskUsageText.y = 50;
    this._diskUsageText.textAlign = "right";
    this._diskDivider = this._spriteFactory.createText("/");
    this._diskDivider.x = this._wh[0] / 2;
    this._diskDivider.y = 50;
    this._diskCapacityText = this._spriteFactory.createText("");
    this._diskCapacityText.x = this._wh[0] / 2 + 30;
    this._diskCapacityText.y = 50;
    this._diskCapacityText.textAlign = "left";
  }

  update() {
    this._scoreText.text = this._playerState.score;
    this._diskUsageText.text = this._formatDiskUsage(this._playerState.diskUsage);
    this._diskCapacityText.text = this._formatDiskUsage(this._playerState.diskCapacity);
  }

  _formatDiskUsage(bytes) {
    if (bytes == 0) return '0b';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return Math.round(bytes / Math.pow(1000, i), 2) + this._sizes[i];
  }

}