/* global NSColor MSColor MSImmutableColor */

function MSColorFromString(string) {
  if (/^(#|rgb\b)/.test(string)) {
    // Handle hex and rgb() formats.
    return MSImmutableColor.colorWithSVGString(string).newMutableCounterpart();

  } else if (/[0-9a-f]{6}/i.test(string)) {
    // Handle hex colors without a leading # mark.
    return MSImmutableColor.colorWithSVGString('#' + string).newMutableCounterpart();

  } else {
    // Handle rgba() format, which is surprisingly not
    // supported by Sketch’s MSColor colorWithSVGString:
    var whitespace = '\\s*';
    var number = '(\\d+(\\.\\d+)?)'; // Note: surrounded by capture group.
    var comma = ',';
    var pattern = [
      'rgba\\(',
      whitespace, number, comma,
      whitespace, number, comma,
      whitespace, number, comma,
      whitespace, number, whitespace,
      '\\)'
    ].join('');
    var match = (new RegExp(pattern)).exec(string);
    if (match) {
      var red   = parseFloat(match[1]) / 255;
      var green = parseFloat(match[3]) / 255;
      var blue  = parseFloat(match[5]) / 255;
      var alpha = parseFloat(match[7]);
      return MSColor.colorWithRed_green_blue_alpha(red, green, blue, alpha);
    }
  }
  // Fall back on black.
  return MSColor.colorWithRed_green_blue_alpha(0, 0, 0, 1);
}

function NSColorFromString(s) {
  return NSColorFromMSColor(MSColorFromString(s));
}

function NSColorFromMSColor(msColor) {
  const r = msColor.red();
  const g = msColor.green();
  const b = msColor.blue();
  const a = msColor.alpha();

  return NSColor.colorWithRed_green_blue_alpha(r, g, b, a);
}

function hashFromMSColor(msColor) {
  msColor = msColor.immutableModelObject();
  var hash = msColor.hexValue();
  if (msColor.alpha() != 1) {
    var alphaString = Math.floor(msColor.alpha() * 255).toString(16).toUpperCase();
    if (alphaString.length === 1) {
      alphaString = '0' + alphaString;
    }
    hash = hash + alphaString;
  }
  return hash;
}

function stringFromMSColor(msColor) {
  msColor = msColor.immutableModelObject();
  if (msColor.color){
    msColor = msColor.color();
  }

  var valuesString = [
    Math.round(msColor.red() * 255),
    Math.round(msColor.green() * 255),
    Math.round(msColor.blue() * 255)
  ].join(', ');

  if (msColor.alpha() != 1) {
    return 'rgba(' + valuesString + ', ' + msColor.alpha().toString().substr(0, 5) + ')';
  } else {
    return 'rgb(' + valuesString + ')';
  }
}

exports.MSColorFromString = MSColorFromString;
exports.NSColorFromString = NSColorFromString;
exports.hashFromMSColor = hashFromMSColor;
exports.stringFromMSColor = stringFromMSColor;
