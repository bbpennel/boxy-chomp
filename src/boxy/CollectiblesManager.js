boxy.CollectiblesManager = class {
  constructor(stageMap, entityFactory) {
    this._spawnMap = stageMap.spawnMap;
    this._spawnInfo = stageMap.spawnInfo;
    this._stageMap = stageMap;
    this._entityFactory = entityFactory;
    this._consumedQueue = [];
    this._respawnQueue = [];
    this._collectionFormatIndex = 0;
    this._typeCountTotal = [];
    this._typeCountCurrent = [];
    for (var i = 0; i < boxy.COLLECTIBLE_NAMES.length; i++) {
      this._typeCountTotal.push(0);
      this._typeCountCurrent.push(0);
    }
  }

  spawnAll() {
    this._collectionLocations = this._determineStartingLocations(boxy.COLLECTION_ID, this._spawnInfo.collectionStart);
    this._diskLocations = this._determineStartingLocations(boxy.DISK_ID, 1);//this._spawnInfo.diskStart);

    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow.length; j++) {
        var spawnType = spawnRow[j];

        if (this._locationSpawnable(i, j)) {
          this.spawnEntity([i, j], spawnType);
        }
      }
    }
  }
  
  update() {
    var delta = boxy.game.tick.delta;
    var i = 0;
    while (i < this._respawnQueue.length) {
      var info = this._respawnQueue[i];
      info.timeToRespawn -= delta;
      // If the respawn time is up and boxy is not too close, then respawn
      if (info.timeToRespawn <= 0 && !boxy.game.playerEntity.gridDistanceLessThan(info.rc, info.respawnDistance)) {
        this._respawnEntity(info.rc, info.spawnType);
        this._respawnQueue.splice(i, 1);
      } else {
        i++;
      }
    }
  }
  
  ejectConsumed(count) {
    var length = this._consumedQueue.length;
    if (length < count) {
      return this._consumedQueue.splice(0, length);
    }
    
    return this._consumedQueue.splice(length - count, count);
  }
  
  consume(collectible) {
    this._consumedQueue.push(collectible);
    this._markForRespawn(collectible);
  }
  
  // Register that the collectible at the given location has been removed, and queue it for respawn
  _markForRespawn(entity) {
    // The type of the object in a location may not match the spawn type of the tile
    var instanceTypeId = boxy.COLLECTIBLE_NAMES.indexOf(entity.itemType);
    this._typeCountCurrent[instanceTypeId]--;
    
    var rc = entity.rc;
    
    var spawnType = this._spawnMap[rc[0]][rc[1]];
    var typeName = boxy.COLLECTIBLE_NAMES[spawnType];
    var typeInfo = boxy.COLLECTIBLE_TYPES[typeName];
    
    this._respawnQueue.push({
      timeToRespawn : typeInfo.respawnTime + ((Math.random() - 0.5) * 0.4 * typeInfo.respawnTime),
      respawnDistance : typeInfo.respawnDistance,
      rc : rc,
      spawnType : spawnType
    });
  }

  _determineStartingLocations(typeValue, startCount) {
    if (startCount == 0) {
      return;
    }

    var candidateLocations = [];

    for (var i = 0; i < this._spawnMap.length; i++) {
      var spawnRow = this._spawnMap[i];

      for (var j = 0; j < spawnRow.length; j++) {
        if (spawnRow[j] == typeValue) {
          candidateLocations.push([i,j]);
        }
      }
    }

    var result = [];
    for (var i = 0; i < startCount; i++) {
      var index = Math.floor(Math.random() * candidateLocations.length);
      result.push(candidateLocations[index]);
      candidateLocations.splice(index, 1);
    }

    return result;
  }

  _locationSpawnable(row, column) {
    if (this._stageMap.isBlocked([row, column])) {
      return false;
    }

    var playerLoc = boxy.game.playerEntity.rc;
    return !(playerLoc[0] == row && playerLoc[1] == column);
  }

  spawnEntity(rc, spawnType) {
    switch (spawnType) {
      case boxy.FOLDER_ID:
        return this._spawn(rc, spawnType);
      case boxy.COLLECTION_ID:
        if (boxy.indexOfPair(this._collectionLocations, rc) != -1) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
      case boxy.DISK_ID:
        if (boxy.indexOfPair(this._diskLocations, rc) != -1) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
    }
  }
  
  _respawnEntity(rc, spawnType) {
    switch (spawnType) {
      case boxy.FOLDER_ID:
        return this._spawn(rc, spawnType);
      case boxy.COLLECTION_ID:
        if (this._respawnOkay(spawnType)) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
      case boxy.DISK_ID:
        if (this._respawnOkay(spawnType)) {
          return this._spawn(rc, spawnType);
        } else {
          return this._spawn(rc, boxy.FOLDER_ID);
        }
    }
  }
  
  _spawn(rc, spawnType) {
    this._typeCountCurrent[spawnType]++;
    this._typeCountTotal[spawnType]++;
    
    switch (spawnType) {
      case boxy.FOLDER_ID:
        var color = this._folderColors[Math.floor(Math.random() * this._folderColors.length)];
        return this._entityFactory.addFolder(rc, color);
      case boxy.COLLECTION_ID:
        var color = "plain";
        // get the available collection colors, set difference all colors against active
        var availColors = boxy.arrayDifference(boxy.COLLECTIBLE_COLORS, this._folderColors);
        // Randomly pick one of the remaining colors, or generic color if none left
        if (availColors.length > 0) {
          color = availColors[Math.floor(Math.random() * availColors.length)];
        }

        // pick format from the set of formats allowed by the level
        var format = this._spawnInfo.collectionTypes[this._collectionFormatIndex];
        this._collectionFormatIndex = ++this._collectionFormatIndex % this._spawnInfo.collectionTypes.length;
        
        return this._entityFactory.addCollection(rc, format, color);
      case boxy.DISK_ID:
        return this._entityFactory.addDisk(rc);
    }
  }
  
  _respawnOkay(spawnType) {
    var typeName = boxy.COLLECTIBLE_NAMES[spawnType];
    var spawnChance = this._spawnInfo[typeName + "SpawnChance"];
    var totalLimit = this._spawnInfo[typeName + "Count"];
    var maxConcur = this._spawnInfo[typeName + "MaxConcurrent"];

    return (maxConcur === undefined || maxConcur > this._typeCountCurrent[spawnType])
        && (totalLimit === undefined || totalLimit > this._typeCountTotal[spawnType])
        && (spawnChance === undefined || spawnChance < 0 || Math.random() < spawnChance);
  }
  
  set folderColors(colors) {
    this._folderColors = colors;
  }
  
  get folderColors() {
    return this._folderColors;
  }
  
  randomizeFolderColors(folderEntities) {
    for (var i = 0; i < folderEntities.length; i++) {
      var folder = folderEntities[i];
      var newColor = this._folderColors[Math.floor(Math.random() * this._folderColors.length)];
      
      folder.color = newColor;
    }
  }
}
