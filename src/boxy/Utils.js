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

boxy.isString = function(value) {
  return typeof value === 'string' || value instanceof String;
}

boxy.arrayDifference = function(a1, a2) {
  var result = [];
  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }
  }
  return result;
}