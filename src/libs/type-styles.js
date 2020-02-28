/* global NSParagraphStyle NSTextAlignmentLeft NSTextAlignmentRight NSTextAlignmentCenter NSTextAlignmentJustified NSTextAlignmentNatural NSItalicFontMask NSFontManager NSFont NSMutableParagraphStyle NSUnderlineStyleSingle MSColor MSTextStyle */

const constants = require('../shared/constants');
const $ = require('./collection-helpers');
const coerce = require('./coerce');
const coerceString = coerce.coerceString;
const coerceNumber = coerce.coerceNumber;
const coerceBool = coerce.coerceBool;
const fonts = require('./fonts');
const colors = require('./colors');

function brandAITypeStyleFromSketchSharedStyle(sharedStyle) {

  const style = sharedStyle.style();
  const textStyle = style.textStyle();
  const textAttrs = textStyle.attributes();
  const font = textAttrs.NSFont;
  const paragraphStyle = textAttrs.NSParagraphStyle || NSParagraphStyle.new();
  const contextSettings = style.contextSettings && style.contextSettings();

  // Get the text color, which is in a different format depending on the version of Sketch.
  var color; // We want this to be an MSColor or MSImmutableColor
  if (textAttrs.MSAttributedStringColorAttribute) {
    // Sketch 48 and up.
    color = textAttrs.MSAttributedStringColorAttribute;
  } else {
    // Sketch up to 47.
    color = MSColor.colorWithNSColor(textAttrs.NSColor);
  }

  const alignmentMap = {};
  alignmentMap[NSTextAlignmentLeft]       = 'left';
  alignmentMap[NSTextAlignmentRight]      = 'right';
  alignmentMap[NSTextAlignmentCenter]     = 'center';
  alignmentMap[NSTextAlignmentJustified]  = 'justify';
  alignmentMap[NSTextAlignmentNatural]    = 'start';

  return {
    objectID:         coerceString(sharedStyle.objectID()),
    name:             coerceString(sharedStyle.name()),
    fontFamily:       coerceString(font.familyName()),
    fontVariant:      fonts.fontVariantFromNSFont(font),
    fontSize:         font.pointSize(),
    textColor:        colors.stringFromMSColor(color),
    sampleText:       'The quick brown fox jumps over the lazy dog.',
    lineHeight:       paragraphStyle.minimumLineHeight() || void 0,
    paragraphSpacing: paragraphStyle.paragraphSpacing() || void 0,
    alignment:        alignmentMap[paragraphStyle.alignment()] || 'left',
    letterSpacing:    coerceNumber(textAttrs.NSKern) || void 0,
    underline:        coerceBool(textAttrs.NSUnderline),
    strikethrough:    coerceBool(textAttrs.NSStrikethrough),
    uppercase:        textAttrs.MSAttributedStringTextTransformAttribute == 1 ? true : false,
    lowercase:        textAttrs.MSAttributedStringTextTransformAttribute == 2 ? true : false,
    opacity:          contextSettings ? coerceNumber(contextSettings.opacity()) : void 0,
    metadata:         { postScriptName: coerceString(font.fontName()) }
  };
}

function NSFontFromBrandAITypeStyle(typeStyle) {
  var result;

  // Look up font directly using PostScript name, if we have it.
  if (typeStyle.metadata && typeStyle.metadata.postScriptName) {
    result = fonts.NSFontFromPostScriptName(typeStyle.metadata.postScriptName, typeStyle.fontSize);
    // result value will be null if the font is not exist on the user machine
    if (result) {
      return result;
    }
  }

  if (!typeStyle.fontFamily) {
    return;
  }

  const fontManager = NSFontManager.sharedFontManager();
  const availableMembers = fonts.getAvailableMembersOfFontFamily(typeStyle.fontFamily);
  const fontMembers = availableMembers.members;
  const lookupFamilyName = availableMembers.familyName;

  const targetFVDWeight = parseInt((typeStyle.fontVariant || '')[1], 10) || 4;
  const targetFVDStyle = (typeStyle.fontVariant || '')[0] || 'n';
  const targetIsItalic = (targetFVDStyle == 'i');
  const targetWeightName = fonts.namedWeightFromFVDWeight(targetFVDWeight);

  if (fontMembers) {
    $.forEach(fontMembers, function(member) {
      // This is a weird API. The values arrays we index into to get font data.
      const psName      = member.objectAtIndex(constants.INDEX.fontPSName);
      const appleWeight = member.objectAtIndex(constants.INDEX.fontWeight);
      const traits      = member.objectAtIndex(constants.INDEX.fontTraits);
      const faceName    = member.objectAtIndex(constants.INDEX.fontFaceName); // E.g. 'Roman', 'Italic', etc.


      // Match with extrapolated FVD.
      const memberFVD = fonts.fontVariantFromFamilyMemberData(psName, appleWeight, traits);
      if (memberFVD == typeStyle.fontVariant) {
        result = fonts.NSFontFromPostScriptName(psName, typeStyle.fontSize);
        return false;
      }

      // Match with extrapolated weight name.
      const memberWeightName = faceName.split(' ')[0];
      const memberFaceIsItalic = fonts.isFontFaceItalic(traits, faceName);
      if (memberWeightName == targetWeightName &&
          memberFaceIsItalic == targetIsItalic) {
        result = fonts.NSFontFromPostScriptName(psName, typeStyle.fontSize);
        return false;
      }

    });

    // Last resort: Get font based on generic mapping from FVD weight.
    // We will get to this step if there are members for the font family on the user machine,
    // but we can't find similar font variant to the type style
    if (!result) {
      result = fontManager.fontWithFamily_traits_weight_size(
        lookupFamilyName,
        targetFVDStyle === 'i' ? NSItalicFontMask : 0,
        fonts.appleWeightFromFVDWeight(targetFVDWeight),
        typeStyle.fontSize
      );
    }

  }

  return result;
}

function sketchTextStyleFromBrandAITypeStyle(typeStyle) {
  var font = NSFontFromBrandAITypeStyle(typeStyle);
  if (!font) {
    // Font object will be nil if the family is not available on the system, so
    // this is a fallback.
    font = NSFont.fontWithName_size('Helvetica', typeStyle.fontSize);
  }
  const paragraphStyle = NSMutableParagraphStyle.new();
  if (typeStyle.lineHeight) {
    paragraphStyle.minimumLineHeight = typeStyle.lineHeight;
    paragraphStyle.maximumLineHeight = typeStyle.lineHeight;
  }
  if (typeStyle.paragraphSpacing) {
    paragraphStyle.paragraphSpacing = typeStyle.paragraphSpacing;
  }
  paragraphStyle.setAlignment({
    left:       NSTextAlignmentLeft,
    right:      NSTextAlignmentRight,
    center:     NSTextAlignmentCenter,
    justify:    NSTextAlignmentJustified,
    start:      NSTextAlignmentNatural
  }[typeStyle.alignment] || NSTextAlignmentNatural);

  const newStyleAttrs = {
    MSAttributedStringColorAttribute:   colors.MSColorFromString(typeStyle.textColor).immutableModelObject(),
    NSFont:                             font,
    NSParagraphStyle:                   paragraphStyle
  };
  if (typeStyle.letterSpacing) {
    newStyleAttrs.NSKern = typeStyle.letterSpacing;
  }
  if (typeStyle.underline) {
    newStyleAttrs.NSUnderline = NSUnderlineStyleSingle;
  }
  if (typeStyle.strikethrough) {
    newStyleAttrs.NSStrikethrough = NSUnderlineStyleSingle;
  }
  if (typeStyle.uppercase) {
    newStyleAttrs.MSAttributedStringTextTransformAttribute = 1;
  } else if (typeStyle.lowercase) {
    newStyleAttrs.MSAttributedStringTextTransformAttribute = 2;
  }


  return MSTextStyle.styleWithAttributes(newStyleAttrs);
}

exports.brandAITypeStyleFromSketchSharedStyle = brandAITypeStyleFromSketchSharedStyle;
exports.NSFontFromBrandAITypeStyle = NSFontFromBrandAITypeStyle;
exports.sketchTextStyleFromBrandAITypeStyle = sketchTextStyleFromBrandAITypeStyle;
