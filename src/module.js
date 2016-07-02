var boxy = boxy || {};

// 1 = folder, color assignable
boxy.FOLDER_ID = 1;
// 2 = collection, random location, alternate folder
boxy.COLLECTION_ID = 2;
// 3 = hard drive spawn location, random, alternate folder
boxy.DISK_ID = 3;
// 4 = random bonus, occasionally spawns here
boxy.RANDOM_BONUS_ID = 4;

boxy.COLLECTIBLE_NAMES = ["none", "folder", "collection", "disk", "bonus"];
boxy.COLLECTIBLE_COLORS = ["plain", "blue", "pink", "green", "red"];
boxy.COLLECTIBLE_FORMATS = ["text", "image", "audio", "data"];

boxy.COLLECTIBLE_TYPES = {
  folder : {
    respawnDistance : 3,
    respawnTime : 10000
  },
  collection : {
    respawnDistance : 5,
    respawnTime : 20000
  },
  disk : {
    respawnDistance : 5,
    respawnTime : 25000
  },
};

boxy.STAT_VALUES = {
  folder : {
    score : 5,
    disk : 1,
    files : 10
  },
  folder_text : {
    score : 5,
    disk : 50,
    files : 50
  },
  folder_image : {
    score : 40,
    disk : 500,
    files : 30
  },
  folder_audio : {
    score : 100,
    disk : 4000,
    files : 10
  },
  folder_data : {
    score: 250,
    disk : 15000,
    files : 3
  },
  collection : {
    score : 100,
    disk : 1
  },
  disk : {
    score : 100,
    capacity : 10000
  },
  ghost : {
    score : 50
  }
};

boxy.DIFFICULTY_LEVELS = {
  0 : {
    damageCost : 5,
    invincibleDuration : 4000,
    freezeDuration : 500
  },
  1 : {
    damageCost : 10,
    invincibleDuration: 4000,
    freezeDuration : 500
  },
  2 : {
    damageCost : 15,
    invincibleDuration: 2000,
    freezeDuration : 800
  }
};

boxy.STAGE_LEVELS = [
  {
    collectionGoal : 2,
    itemsPerCollection : {
      text : 15,
      image : 10,
      audio : 5,
      data : 3
    },
    "spawnInfo" : {
      "collectionMaxConcurrent" : 2,
      "collectionCount" : 3,
      "collectionStart" : 2,
      "collectionTypes" : ["text", "image"],
      "collectionSpawnChance" : 0.50,
      "diskStart" : 0,
      "diskMaxConcurrent" : 1,
      "collectionSpawnChance" : 0.20
    },
    sprintPar : 10,
    sprintMaxScore : 1000,
    timePar : 90,
    timeMaxScore : 1000
  },
  {
    collectionGoal : 3,
    itemsPerCollection : {
      text : 15,
      image : 10,
      audio : 5,
      data : 3
    }
  },
  {
    collectionGoal : 4,
    itemsPerCollection : {
      text : 18,
      image : 12,
      audio : 7,
      data : 4
    }
  }
];

boxy.SPRINT_COOLDOWN = 8000;
boxy.SPRINT_DURATION = 2000;
boxy.SPRINT_SPEED_MULTIPLIER = 2;

boxy.BLINK_ENTITY_RATE = 200;

boxy.GHOST_EATEN_TIME = 5000;

boxy.KEYCODE_DOWN = 40;
boxy.KEYCODE_UP = 38;
boxy.KEYCODE_LEFT = 37;
boxy.KEYCODE_RIGHT = 39;
boxy.KEYCODE_W = 87;
boxy.KEYCODE_A = 65;
boxy.KEYCODE_D = 68;
boxy.KEYCODE_S = 83;
boxy.KEYCODE_SPACE = 32;

boxy.FILE_SIZE_SUFFIXES = ['mb', 'gb', 'tb', 'pb'];

boxy.SCORE_DISK_USAGE_MULTIPLIER = 0.02;