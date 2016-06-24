boxy.GameHud = class {
  constructor() {
    this._sizes = ['mb', 'gb', 'tb', 'pb'];
    this._collectionProgress = [];
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
    
    for (var i = 0; i < this._collectionProgress.length; i++) {
      var progress = this._collectionProgress[i];
      
      progress.progressText.text = progress.progressData.progress;
    }
  }
  
  addCollectionProgress(progress) {
    var offsetX = this._collectionProgress.length * 280;
    var offsetY = this._wh[1] - 20;
    console.log("Offset", offsetX, offsetY);
    
    var collIcon = this._spriteFactory.createCollectionSprite(
        [offsetX, offsetY - 50], progress.collObj.format, progress.collObj.color);
    
    offsetX += boxy.game.settings.grid_size * 1.8;
    var progressText = this._spriteFactory.createText("");
    progressText.x = offsetX;
    progressText.y = offsetY;
    progressText.textAlign = "right";
    
    offsetX += 0;
    var divider = this._spriteFactory.createText("/");
    divider.x = offsetX;
    divider.y = offsetY;
    
    offsetX += 30;
    var goalText = this._spriteFactory.createText(progress.goal);
    goalText.x = offsetX;
    goalText.y = offsetY;
    goalText.textAlign = "left";
    
    this._collectionProgress.push({
      icon : collIcon,
      progressText : progressText,
      divider : divider,
      goalText : goalText,
      progressData : progress
    });
  }
  
  removeCollectionProgress(progress) {
    var index;
    for (var i = 0; i < this._collectionProgress.length; i++) {
      if (this._collectionProgress[i].progress === progress) {
        index = i;
        break;
      }
    }
    
    
    var hudProgress = this._collectionProgress.splice(index, 1)[0];
    console.log("Removing collection", hudProgress, index);
    hudProgress.icon.parent.removeChild(hudProgress.icon);
    hudProgress.progressText.parent.removeChild(hudProgress.progressText);
    hudProgress.divider.parent.removeChild(hudProgress.divider);
    hudProgress.goalText.parent.removeChild(hudProgress.goalText);
  }

  _formatDiskUsage(bytes) {
    if (bytes == 0) return '0b';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return Math.round(bytes / Math.pow(1000, i), 2) + this._sizes[i];
  }

}