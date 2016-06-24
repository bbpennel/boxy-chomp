boxy.CollectibleEntity = class extends boxy.MapEntity {
  constructor(rc, itemType, format, color, sprite) {
    super(rc, sprite);
    this._itemType = itemType;
    this._format = format;
    this._color = color;
    this._stateChange = true;
  }
  
  static buildAnimationName(itemType, format, color) {
    var animation = itemType;
    if (format != null) {
      animation += "_" + format;
    }
    if (color != null) {
      animation += "_" + color;
    }
    return animation;
  }

  get itemType() {
    return this._itemType;
  }
  
  get format() {
    return this._format;
  }
  
  get color() {
    return this._color;
  }
  
  set color(color) {
    this._color = color;
    // Update the animation for the newly set color
    var animationName = boxy.CollectibleEntity.buildAnimationName(this._itemType, this._format, this._color);
    this._sprite.gotoAndPlay(animationName);
  }

  updateDisplay() {
    super.updateDisplay();
    
    if (!this._stateChange) {
      return;
    }

    this._sprite.x = this._xy[0];
    this._sprite.y = this._xy[1];
  }
}