/* global NSString NSDictionary NSArray NSNumber */

const $ = require('./collection-helpers');

function coerceJS(value) {
  if (value) {

    if (value.class &&
        value.class.toString &&
        value.class.toString() === '[object MOFunction]') {

      const cls = value.class();

      if (cls.isSubclassOfClass(NSString)) {
        return coerceString(value);

      } else if (cls.isSubclassOfClass(NSDictionary)) {
        return coerceObject(value);

      } else if (cls.isSubclassOfClass(NSArray)) {
        return coerceArray(value);

      } else if (cls.isSubclassOfClass(NSNumber)) {
        return coerceNumber(value);

      } else {
        return value;
      }

    } else if (Array.isArray(value)) {
      return value.map(coerceJS);

    } else if (typeof value === 'object') {
      const newObj = {};
      for (var key in value) {
        newObj[key] = coerceJS(value[key]);
      }
      return newObj;

    } else {
      return value;
    }

  } else {
    return value;
  }
}


function coerceString(str) {
  if (str) {
    return '' + str;
  } else {
    return null;
  }
}

function coerceNumber(number) {
  return number + 0;
}

function coerceBool(number) {
  return !!(number + 0);
}

function coerceArray(array) {
  var result = [];
  $.forEach(array, function(item) {
    result.push(coerceJS(item));
  });
  return result;
}

function coerceObject(dict) {
  var result = {};
  $.forEach(dict.allKeys(), function(key) {
    result[key] = coerceJS(dict[key]);
  });
  return result;
}

exports.coerceJS = coerceJS;
exports.coerceString = coerceString;
exports.coerceNumber = coerceNumber;
exports.coerceBool = coerceBool;
exports.coerceArray = coerceArray;
exports.coerceObject = coerceObject;
