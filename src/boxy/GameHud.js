boxy.GameHud = class {
  constructor(spriteFactory) {
    this._sizes = ['mb', 'gb', 'tb', 'pb'];
    this._spriteFactory = spriteFactory;
  }

  draw() {
    this._scoreText = this._spriteFactory.createText("");
    this._scoreText.x = boxy.game.w - 10;
    this._scoreText.y = 50;
    this._scoreText.textAlign = "right";

    this._diskUsageText = this._spriteFactory.createText("");
    this._diskUsageText.x = boxy.game.w / 2;
    this._diskUsageText.y = 50;
    this._diskUsageText.textAlign = "right";
    this._diskDivider = this._spriteFactory.createText("/");
    this._diskDivider.x = boxy.game.w / 2;
    this._diskDivider.y = 50;
    this._diskCapacityText = this._spriteFactory.createText("");
    this._diskCapacityText.x = boxy.game.w / 2 + 30;
    this._diskCapacityText.y = 50;
    this._diskCapacityText.textAlign = "left";
  }

  update() {
    this._scoreText.text = boxy.game.stats.score;
    this._diskUsageText.text = this._formatDiskUsage(boxy.game.stats.diskUsage);
    this._diskCapacityText.text = this._formatDiskUsage(boxy.game.stats.diskCapacity);
  }

  _formatDiskUsage(bytes) {
    if (bytes == 0) return '0b';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return Math.round(bytes / Math.pow(1000, i), 2) + this._sizes[i];
  }

}