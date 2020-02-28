/* global NSFont NSFontManager NSItalicFontMask NSFontDescriptor */

const constants = require('../shared/constants');
const $ = require('./collection-helpers');
const coerceString = require('./coerce').coerceString;

/*
 * See Documentation:
 * https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSFontManager_Class/#//apple_ref/occ/instm/NSFontManager/convertWeight:ofFont:
 *
 * And implementation in WebKit at
 * https://github.com/WebKit/webkit/blob/66e68cd8d7bf4ea1cf52f31ed9cb242f83ea5b57/Source/WebCore/platform/graphics/mac/FontCacheMac.mm#L160
 */
function CSSWeightFromAppleWeight(weight) {
  if (weight == 1)
    return 1;
  if (weight == 2)
    return 2;
  if (weight <= 4)
    return 3;
  if (weight == 5)
    return 4;
  if (weight == 6)
    return 5;
  if (weight <= 8)
    return 6;
  if (weight == 9)
    return 7;
  if (weight <= 11)
    return 8;
  return 9;
}

/*
 * See Documentation:
 * https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSFontManager_Class/#//apple_ref/occ/instm/NSFontManager/convertWeight:ofFont:
 * */
function appleWeightFromFVDWeight(weight) {
  return [
    0,  // 0 index; not used
    2,  // W1. ultralight
    3,  // W2. extralight
    4,  // W3. light
    5,  // W4. semilight
    6,  // W5. medium
    8,  // W6. semibold
    9,  // W7. bold
    10, // W8. extrabold
    12  // W9. ultrabold
  ][weight];
}

function namedWeightFromFVDWeight(weight) {
  return [
    '',             // 0 index; not used
    'Thin',         // 1
    'Extra-Light',  // 2
    'Light',        // 3
    'Regular',      // 4
    'Medium',       // 5
    'Semi-Bold',    // 6
    'Bold',         // 7
    'Extra-Bold',   // 8
    'Ultra-Bold'    // 9
  ][weight];
}

// Special cases for known issues with fonts.
function overrideAppleFontWeight(psName) {
  switch (coerceString(psName)) {
    case 'HelveticaNeue-Thin':
    case 'HelveticaNeueLTPro-Th':
    case 'Oswald-ExtraLight':
    case 'Optimist-ExtraLight':
    case 'Optimist-ExtraLightItalic':
    case 'Mallory-ExtraLight':
    case 'Mallory-ExtraLightItalic':
      return 2;
  }

  if (psName.indexOf('-Book') > 0) {
    return 5;
  }
}

function fontVariantFromNSFont(font) {
  var appleWeight = NSFontManager.sharedFontManager().weightOfFont(font);
  const traits = font.fontDescriptor().symbolicTraits();
  return fontVariantFromFamilyMemberData(font.fontName(), appleWeight, traits);
}

function fontVariantFromFamilyMember(member) {
  return fontVariantFromFamilyMemberData(
    member.objectAtIndex(constants.INDEX.fontPSName),
    member.objectAtIndex(constants.INDEX.fontWeight),
    member.objectAtIndex(constants.INDEX.fontTraits)
  );
}

function fontVariantFromFamilyMemberData(psName, appleWeight, fontTraits) {
  appleWeight = overrideAppleFontWeight(psName) || appleWeight;
  const cssWeight = CSSWeightFromAppleWeight(appleWeight);
  const isItalic = isFontFaceItalic(fontTraits, psName);
  return (isItalic ? 'i' : 'n') + cssWeight;
}

function fontVariantsInFontFamily(family) {
  const fontManager = NSFontManager.sharedFontManager();

  // Note: availableMembersOfFontFamily will return null if there are no matches.
  const members = fontManager.availableMembersOfFontFamily(family);
  const variants = {};
  if (members) {
    $.forEach(members, function(member) {
      const variant = fontVariantFromFamilyMember(member);
      variants[variant] = true;
    });
  }
  return Object.keys(variants);
}

function isFontFaceItalic(fontTraits, faceName) {
  // Cocoa does not set the italic traits for HelveticaLightItalic and maybe
  // others. See Mozilla bug 611855. So we check the face name endings as
  // well as the trait.
  return (fontTraits & NSItalicFontMask) ||
    faceName.hasSuffix('Italic') ||
    faceName.hasSuffix('Oblique');
}

function NSFontFromPostScriptName(psName, size) {
  // Look up font using PostScript name (which can only be done using a
  // NSFontDescriptor.
  const fontDescriptor = NSFontDescriptor.fontDescriptorWithFontAttributes({
    NSFontNameAttribute: psName
  });
  const result = fontDescriptor.matchingFontDescriptorWithMandatoryKeys(null);
  return NSFont.fontWithDescriptor_size(result, size);
}

function getPrimaryFontFamily(fontStack) {
  fontStack = fontStack.replace(new RegExp('(^\\s+|\\s+$)', 'g'));

  var match = (new RegExp('^"((\\\\"|[^"])+)"')).exec(fontStack);
  if (match) {
    return match[1].replace(new RegExp('\\\\"', 'g'), '"');
  }

  match = (new RegExp("^'((\\\\'|[^'])+)'")).exec(fontStack); // eslint-disable-line quotes
  if (match) {
    return match[1].replace(new RegExp("\\\\'", 'g'), "'"); // eslint-disable-line quotes
  }

  match = (new RegExp('^(\\\\,|[^,])+')).exec(fontStack);
  if (match) {
    return match[0];
  }
}

// 'Frutiger Neue LT Pro' => 'frutigerneueltpro'
// 'FrutigerNeueLTPro'    => 'frutigerneueltpro'
// 'museo-sans'           => 'museosans'
// 'Museo Sans'           => 'museosans'
function simplifyFontFamilyName(fontFamily) {
  return fontFamily.replace(new RegExp('[- ]', 'g'), '').toLowerCase();
}

function getAvailableMembersOfFontFamily(fontStack) {
  const fontManager = NSFontManager.sharedFontManager();

  // TODO: Go through the list of families in the stack?
  var family = getPrimaryFontFamily(fontStack);

  // Note: availableMembersOfFontFamily will return null if there are no matches.
  var members = fontManager.availableMembersOfFontFamily(family);

  if (!members) {
    const installedFamilies = fontManager.availableFontFamilies();
    const installedFamiliesKeyedBySimplifiedName = {};
    $.forEach(installedFamilies, function(family) {
      const simplifiedName = simplifyFontFamilyName(coerceString(family));
      installedFamiliesKeyedBySimplifiedName[simplifiedName] = family;
    });

    const simplifiedTargetName = simplifyFontFamilyName(family);
    const simplifiedMatch = installedFamiliesKeyedBySimplifiedName[simplifiedTargetName];
    if (simplifiedMatch) {
      members = fontManager.availableMembersOfFontFamily(simplifiedMatch);
      family = simplifiedMatch;
    }

    if (!members) {
      // Match families with a trailing single letter, e.g. 'Gotham A' which
      // are created by Typography.com.
      const modFamilyName = family.replace(new RegExp(' [A-Za-z]$'), '');
      const modSimplifiedTargetName = simplifyFontFamilyName(modFamilyName);
      const modSimplifiedMatch = installedFamiliesKeyedBySimplifiedName[modSimplifiedTargetName];
      if (modSimplifiedMatch) {
        members = fontManager.availableMembersOfFontFamily(modSimplifiedMatch);
        family = modSimplifiedMatch;
      }
    }
  }

  return {
    members: members,
    familyName: family
  };
}

exports.fontVariantsInFontFamily = fontVariantsInFontFamily;
exports.fontVariantFromNSFont = fontVariantFromNSFont;
exports.appleWeightFromFVDWeight = appleWeightFromFVDWeight;
exports.namedWeightFromFVDWeight = namedWeightFromFVDWeight;
exports.isFontFaceItalic = isFontFaceItalic;
exports.NSFontFromPostScriptName = NSFontFromPostScriptName;
exports.fontVariantFromFamilyMemberData = fontVariantFromFamilyMemberData;
exports.getAvailableMembersOfFontFamily = getAvailableMembersOfFontFamily;
