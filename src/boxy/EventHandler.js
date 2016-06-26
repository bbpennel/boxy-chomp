boxy.EventHandler = class {
  constructor() {
  }
  
  set levelState(levelState) {
    this._levelState = levelState;
  }
  
  set collectiblesManager(manager) {
    this._collectiblesManager = manager;
  }
  
  set entityManager(manager) {
    this._entityManager = manager;
  }
  
  set stageMap(stageMap) {
    this._stageMap = stageMap;
  }
  
  set playerState(playerState) {
    this._playerState = playerState;
  }
  
  set gameHud(gameHud) {
    this._gameHud = gameHud;
  }

  collisionEvent(data) {
    var collider = data.collider;
    var collidee = data.collidee;

    if (collider === boxy.game.playerEntity) {
      if (collidee instanceof boxy.CollectibleEntity) {
        this._collidePlayerAndCollectible(collider, collidee);
      }
    } else if (collider instanceof boxy.GhostEntity) {
      if (collidee instanceof boxy.GhostEntity) {
        this._collideGhostAndGhost(collider, collidee);
      } else if (collidee === boxy.game.playerEntity) {
        this._collideGhostAndPlayer(collider, collidee);
      }
    }
  }
  
  // Dinner time for boxy
  _collidePlayerAndCollectible(collider, collidee) {
    switch (collidee.itemType) {
    case "folder" :
      this._entityManager.destroy(collidee);
      this._levelState.addToCollection(collidee);
      var key = "folder";
      if (collidee.format) {
        key += "_" + collidee.format
      }
      this._playerState.adjustStats(key);
      this._collectiblesManager.consume(collidee);
      break;
    case "collection" :
      this._entityManager.destroy(collidee);
      this._playerState.adjustStats("collection");
      this._levelState.registerCollection(collidee);
      this._collectiblesManager.consume(collidee);
      break;
    case "disk" :
      this._entityManager.destroy(collidee);
      this._playerState.adjustStats("disk");
      this._collectiblesManager.consume(collidee);
      break;
    }
  }
  
  _collideGhostAndGhost(collider, collidee) {
    var rc = collider.nextRc();
    // Ghost should reverse directions
    //console.log("Ghost on ghost violence", collider.rc, rc, collidee.rc);
    if (rc[0] == collidee.rc[0] && rc[1] == collidee.rc[1]) {
      //console.log("Turn the beat around");
      collider.reverseDirection();
    } else {
      //console.log("Turn the other cheek");
    }
    
    //collidee.reverseDirection();
  }
  
  _collideGhostAndPlayer(ghost, player) {
    // No collision if the player was invincible (but not sprinting), or the ghost was out of commission
    if ((player.isInvincible && !this._playerState.isSprinting) || ghost.isEaten) {
      return;
    }
    
    // Boxy is sprinting, and therefore eats the ghosts instead of being hit by them
    if (this._playerState.isSprinting) {
      ghost.eatenFor(boxy.GHOST_EATEN_TIME);
      this._playerState.adjustStats("ghost");
      return;
    }
    
    // Boxy is hit by the ghost, and therefore loses progress
    var difficulty = boxy.DIFFICULTY_LEVELS[this._levelState.difficultyLevel];
    
    // Get the last N consumed objects, based on difficulty level
    var ejected = this._collectiblesManager.ejectConsumed(difficulty.damageCost);
    // Deregister lost objects from collection progress
    this._levelState.subtractFromCollections(ejected);
    
    // Substract the value of the last N consumed items
    for (var i = 0; i < ejected.length; i++) {
      var ejEntity = ejected[i];
      this._playerState.adjustStats(ejEntity.itemType, true);
    }
    
    // Make boxy invincible for a little while after
    player.invincibleTime = difficulty.invincibleDuration;
    player.blinkTime = difficulty.invincibleDuration;
    player.freezeTime = difficulty.freezeDuration;
    
    console.log("Boxy lost the following items", ejected);
  }
  
  sprintEvent(state) {
    if (state == "start") {
      console.log("Boxy sprint!");
      this._playerState.sprintTime = boxy.SPRINT_DURATION;
      boxy.game.playerEntity.boostSpeed(boxy.SPRINT_SPEED_MULTIPLIER);
    } else if (state == "end") {
      console.log("Sprint over, boxy can relax");
      this._playerState.sprintTime = 0;
      this._playerState.sprintCooldown = boxy.SPRINT_COOLDOWN;
      boxy.game.playerEntity.resetSpeed();
    }
    this._gameHud.changeSprintState(state);
  }
  
  sprintRequested() {
    if (this._playerState.sprintReady) {
      this.sprintEvent("start");
    }
  }
  
  collectionRegistered(data) {
    var colors = this._levelState.activeColors;
    colors.push(data.color);
    this._collectiblesManager.folderColors = colors;
    
    var folders = this._entityManager.getCollectiblesByType("folder");
    this._collectiblesManager.randomizeFolderColors(folders);
    
    this._gameHud.addCollectionProgress(data);
  }
  
  collectionRemoved(data, completed) {
    var colors = this._levelState.activeColors;
    var index = colors.indexOf(data.color);
    colors.splice(index, 1);
    
    this._collectiblesManager.folderColors = colors;
    
    var folders = this._entityManager.getCollectiblesByType("folder");
    this._collectiblesManager.randomizeFolderColors(folders);
    
    this._gameHud.removeCollectionProgress(data);
    
    if (completed && this._levelState.hasReachedGoal()) {
      console.log("YOU ARE WINNER!");
    }
  }
}