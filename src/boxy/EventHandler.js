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
      this._playerState.adjustStats("folder");
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
      console.log("Turn the beat around");
      collider.reverseDirection();
    } else {
      //console.log("Turn the other cheek");
    }
    
    //collidee.reverseDirection();
  }
  
  _collideGhostAndPlayer(ghost, player) {
    if (player.isInvincible) {
      return;
    }
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
    player.freezeTime = difficulty.freezeDuration;
    
    console.log("Boxy lost the following items", ejected);
  }
}