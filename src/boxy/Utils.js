boxy.indexOfPair = function(array, pair) {
  for (var i = 0; i < array.length; i++) {
    var aPair = array[i];
    if (aPair[0] == pair[0] && aPair[1] == pair[1]) {
      return i;
    }
  }
  return -1;
}

boxy.calculateMoveDelta = function(speed) {
  return boxy.game.tick.delta / 1000 * speed;
}