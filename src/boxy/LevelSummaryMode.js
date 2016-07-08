boxy.LevelSummaryMode = class {
  constructor() {
    this._baseOffsetX = 10;
    this._baseOffsetY = 5;
    this._currentLine = 0;
    this._lineHeight = 60;
    this._currentLineX = 0;
    this._labelColor = "#BBE0F0";
    this._scoreColor = "#BBFFBB";
    this._labelOffsetX = 300;
    this._entities = [];
  }
  
  set spriteFactory(factory) {
    this._spriteFactory = factory;
  }
  
  set stage(stage) {
    this._stage = stage;
  }
  
  set playerState(playerState) {
    this._playerState = playerState;
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }
  
  set eventTracker(eventTracker) {
    this._eventTracker = eventTracker;
  }
  
  init() {
    return this;
  }
  
  draw() {
    var diskUsage = boxy.formatDiskUsage(this._playerState.diskUsage);
    var diskScore = Math.floor(this._playerState.diskUsage * boxy.SCORE_DISK_USAGE_MULTIPLIER);
    
    var diskCapacity = boxy.formatDiskUsage(this._playerState.diskCapacity);
    
    var levelTime = Math.floor(this._levelState.levelTime / 1000);
    var timeMinutes = Math.floor(levelTime / 60);
    var timeSeconds = levelTime % 60;
    if (timeSeconds < 10) {
      timeSeconds = "0" + timeSeconds;
    }
    
    var timeScore = this._levelState.getTimeScore(levelTime);
    var sprintScore = this._levelState.getSprintScore(this._eventTracker.sprintCount);
    
    // Modify score for post game bonuses
    var levelScore = this._playerState.score;
    var bonuses = timeScore + sprintScore + diskScore;
    this._playerState.addToScore(bonuses);
    
    this.newLine()
      .text("Level Complete!", "#FFCF40", "66").newLine()
      .label("Time").text(timeMinutes + ":" + timeSeconds).scoreIncrease(timeScore).newLine()
      .label("Sprints").text(this._eventTracker.sprintCount).scoreIncrease(sprintScore).newLine()
      .label("Disk").text(diskUsage + " / " + diskCapacity).scoreIncrease(diskScore).newLine()
      .label("Files").text(this._playerState.numberOfFiles).newLine()
      .label("Completed")
      .renderCollectionFormats(this._summarizeCollections(this._levelState.completedCollections)).newLine()
      .label("Danger").text("Hit " + this._eventTracker.ghostHits + " times (" 
        + this._eventTracker.itemsLost + " items lost)").newLine()
      .text("-----------------------------", "#FFCF40").newLine()
      .label("Score").text(levelScore).scoreIncrease(bonuses).text(" = ").text(this._playerState.score).newLine();
    
    this._continuePrompts();
    return this;
  }
  
  _continuePrompts() {
    var text = this._spriteFactory.createText("Space to continue, Q to quit", "#FFCF40");
    text.x = boxy.game.dimensions[0] - 10;
    text.y = boxy.game.dimensions[1] - 30;
    text.textAlign = "right";
  }
  
  get _lineOffset() {
    return this._currentLine * this._lineHeight + this._baseOffsetY;
  }
  
  label(label) {
    var labelText = this._spriteFactory.createText(label, null, 38);
    labelText.x = this._labelOffsetX;
    labelText.y = this._lineOffset;
    labelText.color = this._labelColor;
    labelText.textAlign = "right";
    this._currentLineX = labelText.x + 20;
    this._entities.push(labelText);
    return this;
  }
  
  text(textValue, color, size = 38) {
    var text = this._spriteFactory.createText(textValue, color, size);
    text.x = this._currentLineX;
    text.y = this._lineOffset;
    this._entities.push(text);
    this._currentLineX += text.getBounds().width;
    return this;
  }
  
  scoreIncrease(value) {
    if (value == 0) {
      return this;
    }
    this._currentLineX += 20;
    this.text("+" + value, this._scoreColor);
    return this;
  }
  
  newLine() {
    this._currentLineX = this._baseOffsetX;
    this._currentLine++;
    return this;
  }
  
  collectionSprite(format, color) {
    var sprite = this._spriteFactory.createCollectionSprite(
        [this._currentLineX, this._lineOffset - boxy.game.settings.grid_size * 0.75], format, color);
    this._currentLineX += boxy.game.settings.grid_size / 2;
    return this;
  }
  
  spacing(value) {
    this._currentLineX += value;
    return this;
  }
  
  _summarizeCollections(collections) {
    var formats = {};
    
    for (var i = 0; i < collections.length; i++) {
      var collection = collections[i];
      var format = collection.collObj.format;
      if (format in formats) {
        formats[format] += 1;
      } else {
        formats[format] = 1;
      }
    }
    
    return formats;
  }
  
  renderCollectionFormats(formatMap) {
    for (var format in formatMap) {
      var value = formatMap[format];
      this.collectionSprite(format, "blue").spacing(20).text(" x " + value).spacing(25);
    }
    return this;
  }
  
  tick(e) {
    
  }
  
  handleKeyDown(e) {
    if (!e) {
      var e = window.event;
    }
    switch (e.keyCode) {
      case boxy.KEYCODE_SPACE:
        boxy.game.eventHandler.goToNextLevel();
        return false;
    }
  }
}