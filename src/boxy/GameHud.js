boxy.GameHud = class {
  constructor() {
    this._collectionProgress = [];
  }
  
  set playerState(state) {
    this._playerState = state;
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }
  
  set wh(wh) {
    this._wh = wh;
  }

  draw() {
    // Render the players score
    this._scoreText = this._spriteFactory.createText("");
    this._scoreText.x = this._wh[0] - 10;
    this._scoreText.y = 50;
    this._scoreText.textAlign = "right";

    // Draw the disk usage, disk cap display
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
    
    // Draw the total collection completion goal for the level
    var goalOffset = 5;
    this._levelGoalIcon = this._spriteFactory.createCollectionSprite([goalOffset, 0], null, "plain");
    goalOffset += boxy.game.settings.grid_size * 1.5 + 10;
    this._levelGoalProgressText = this._spriteFactory.createText("0");
    this._levelGoalProgressText.x = goalOffset;
    this._levelGoalProgressText.y = 50;
    this._levelGoalProgressText.textAlign = "right"; 
    this._levelGoalDivider = this._spriteFactory.createText("/");
    this._levelGoalDivider.x = goalOffset;
    this._levelGoalDivider.y = 50;
    goalOffset += 30;
    this._levelGoalTargetText = this._spriteFactory.createText(this._levelState.collectionGoal);
    this._levelGoalTargetText.x = goalOffset;
    this._levelGoalTargetText.y = 50;
    this._levelGoalTargetText.textAlign = "left";
    
    this._sprintIndicatorText = this._spriteFactory.createText("");
    this._sprintIndicatorText.x = this._wh[0] - 5;
    this._sprintIndicatorText.y = this._wh[1] - 20;
    this._sprintIndicatorText.textAlign = "right";
  }

  update() {
    this._scoreText.text = this._playerState.score;
    this._diskUsageText.text = boxy.formatDiskUsage(this._playerState.diskUsage);
    this._diskCapacityText.text = boxy.formatDiskUsage(this._playerState.diskCapacity);
    this._levelGoalProgressText.text = this._levelState.completedCollectionsCount;
    
    if (this._playerState.isSprinting) {
      var remaining = this._playerState.sprintPercentRemaining;
      remaining = Math.floor(remaining * 10);
      var dots = "";
      for (var i = 0; i < remaining; i++) {
        dots += ".";
      }
      this._sprintIndicatorText.text = dots;
    }
    
    for (var i = 0; i < this._collectionProgress.length; i++) {
      var progress = this._collectionProgress[i];
      
      progress.progressText.text = progress.progressData.progress;
    }
  }
  
  changeSprintState(state) {
    if (state == "ready") {
      this._sprintIndicatorText.text = "Sprint ready!";
      this._sprintIndicatorText.color = "#FFFFFF";
      createjs.Tween.get(this._sprintIndicatorText).to({ scaleX : 1.1, scaleY : 1.1 }, 100, createjs.Ease.getPowInOut(4))
          .to({ scaleX : 1, scaleY : 1 }, 100, createjs.Ease.getPowInOut(4));
    } else if (state == "start") {
      
    } else if (state == "end") {
      this._sprintIndicatorText.text = "recharging...";
      this._sprintIndicatorText.color = "#7789E5";
    }
  }
  
  addCollectionProgress(progress) {
    var offsetX = this._collectionProgress.length * 280;
    var offsetY = this._wh[1] - 20;
    
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
    hudProgress.icon.parent.removeChild(hudProgress.icon);
    hudProgress.progressText.parent.removeChild(hudProgress.progressText);
    hudProgress.divider.parent.removeChild(hudProgress.divider);
    hudProgress.goalText.parent.removeChild(hudProgress.goalText);
  }



}