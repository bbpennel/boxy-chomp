boxy.EventTracker = class {
  constructor() {
    this._collectedCounts ={};
    this._ghostHits = 0;
    this._ghostsEaten = 0;
    this._sprintCount = 0;
    this._itemsLost = 0;
  }
  
  incrementCollected(collType) {
    if (collType in this._collectedCounts) {
      this._collectedCounts[collType] += 1;
    } else {
      this._collectedCounts[collType] = 1;
    }
  }
  
  get collectedCounts() {
    return this._collectedCounts;
  }
  
  incrementSprints() {
    this._sprintCount++;
  }
  
  get sprintCount() {
    return this._sprintCount;
  }
  
  incrementGhostHits() {
    this._ghostHits++;
  }
  
  get ghostHits() {
    return this._ghostHits;
  }
  
  incrementItemsLost(number) {
    this._itemsLost += number;
  }
  
  get itemsLost() {
    return this._itemsLost;
  }
  
  incrementGhostsEaten() {
    this._ghostsEaten++;
  }
  
  get ghostsEaten() {
    return this._ghostsEaten;
  }
}