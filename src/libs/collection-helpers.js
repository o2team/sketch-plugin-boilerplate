const $ = {
  forEach: function(collection, iterator) {
    for (var i = 0; i < collection.count(); i++) {
      const item = collection.objectAtIndex(i);
      const returnValue = iterator(item, i, collection);
      if (returnValue === false) {
        break;
      }
    }
  },

  map: function(collection, transform) {
    const result = [];
    $.forEach(collection, function(item, i, collection) {
      result.push(transform(item, i, collection));
    });
    return result;
  },

  mapObject: function(collection, transform) {
    const results = {};
    $.forEach(collection, function(item, i, collection) {
      const result = transform(item, i, collection);
      const key = result[0];
      const value = result[1];
      results[key] = value;
    });
    return results;
  },

  find: function(collection, predicate) {
    var result;
    $.forEach(collection, function(item, i, collection) {
      if (predicate(item, i, collection)) {
        result = item;
        return false;
      }
    });
    return result;
  },

  filter: function(collection, predicate) {
    const result = [];
    $.forEach(collection, function(item, i, collection) {
      if (predicate(item, i, collection)) {
        result.push(item);
      }
    });
    return result;
  }
};

module.exports = $;
