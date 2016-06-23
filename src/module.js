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

boxy.DIFFICULTY_LEVELS = {
  0 : {
    damageCost : 3,
    invincibleDuration : 4000,
    freezeDuration : 500
  },
  1 : {
    damageCost : 5,
    invincibleDuration: 4000,
    freezeDuration : 500
  },
  2 : {
    damageCost : 10,
    invincibleDuration: 2000,
    freezeDuration : 800
  }
};

boxy.SPRINT_COOLDOWN = 8000;
boxy.SPRINT_DURATION = 2000;
boxy.SPRINT_SPEED_MULTIPLIER = 2;

boxy.GHOST_EATEN_TIME = 5000;