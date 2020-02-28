/*
  global
  MSBitmapLayer
  MSOvalShape
  MSPolygonShape
  MSRectangleShape
  MSShapeGroup
  MSShapePathLayer
  MSStarShape
  MSTriangleShape
  NSMutableSet
  NSPredicate
*/

const $ = require('./collection-helpers');
const fonts = require('./fonts');
const typeStyles = require('./type-styles');
const coerceString = require('./coerce').coerceString;
const coerceJS = require('./coerce').coerceJS;
const traverseLayers = require('./traverse-layers');
const logMessage = require('./logger');
const sharedStyleHelpers = require('./shared-style-helpers');

// Manualy maintained list of layer classes that can have a layer style applied
// in the Sketch inspector. We filter out those without a .style() because in
// versions of Sketch prior to 52 some of these classes (MSRectangleShape,
// MSOvalShape etc.) were not something you could select on the canvas and did
// not have a .style().
const classesThatAcceptLayerStyles = [
  //MSLayerGroup, TODO: Uncomment to support groups!
  MSShapeGroup,
  MSBitmapLayer,
  MSShapePathLayer,
  MSOvalShape,
  MSPolygonShape,
  MSRectangleShape,
  MSStarShape,
  MSTriangleShape
].filter(function(c) {
  return c.new().style;
});

const acceptsLayerStylesPredicate = matchesClassesPredicate(classesThatAcceptLayerStyles);

function sharedStyleObjectsForLayer(layer, documentTextStylesMap, documentSharedStylesMap) {
  const sharedObjects = [];
  const directNestedSymbolIDs = [];
  const sharedLayerStyles = [];
  const sharedTextStyles = [];

  const children = layer.children();

  if (children) {
    $.forEach(children, function(descendant) {
      if (descendant.className() == 'MSTextLayer') {
        const sharedTextStyleID = sharedStyleHelpers.getSharedStyleID(descendant);
        const textStyle = documentTextStylesMap[sharedTextStyleID];
        //todo: can I not have the layer at this point?
        if (textStyle) {
          sharedObjects.push({ type: 'text', id: sharedTextStyleID });
          sharedTextStyles.push(textStyle);
        }
      } else if (doesAcceptLayerStyles(descendant) && descendant.style) {
        const sharedLayerStyleID = sharedStyleHelpers.getSharedStyleID(descendant);
        const layerStyle = documentSharedStylesMap[sharedLayerStyleID];
        if (layerStyle) {
          sharedObjects.push({ type: 'layerStyle', id: sharedLayerStyleID });
          sharedLayerStyles.push(layerStyle);
        }
      } else if (descendant.className() == 'MSSymbolInstance' || descendant.className() == 'MSSymbolMaster') {
        if (!layer.symbolID || descendant.symbolID() !== layer.symbolID()) {
          //is it enough to have only symbol ids or do we want the layer ids as well?
          directNestedSymbolIDs.push(descendant.symbolID());
        }

        const overrides = descendant.overrides && descendant.overrides();
        if (overrides) {
          getOverridesSharedObjectIds(
            overrides,
            documentSharedStylesMap,
            documentTextStylesMap,
            sharedObjects,
            sharedLayerStyles,
            sharedTextStyles
          );
        }
      }
    });
  }

  return {
    sharedObjects: sharedObjects,
    directNestedSymbolIDs: directNestedSymbolIDs,
    sharedLayerStyles: sharedLayerStyles,
    sharedTextStyles: sharedTextStyles
  };
}

function getOverridesSharedObjectIds(
  overrides,
  documentSharedStylesMap,
  documentTextStylesMap,
  sharedObjects,
  sharedLayerStyles,
  sharedTypeStyles
) {
  Object.keys(overrides).forEach(function(key) {
    const value = coerceJS(overrides[key]);
    if (typeof value === 'object') {
      getOverridesSharedObjectIds(
        value,
        documentSharedStylesMap,
        documentTextStylesMap,
        sharedObjects,
        sharedLayerStyles,
        sharedTypeStyles
      );
    } else {
      let layerCandidate = documentSharedStylesMap[value];
      let textCandidate = documentTextStylesMap[value];
      if (layerCandidate) {
        sharedObjects.push({ type: 'layerStyle', id: value });
        sharedLayerStyles.push(layerCandidate);
      } else if (textCandidate) {
        sharedObjects.push({ type: 'text', id: value });
        sharedTypeStyles.push(textCandidate);
      }
    }
  });
}

function styleDependenciesForLayers(
  styleData,
  layerToUpload,
  brandAITypeStyleIDsByTextStyleID,
  brandAISharedStyleIDsByLayerStyleID
) {
  const sharedLayerStyleDependencies = NSMutableSet.new();
  const sharedTextStyleDepencendies = NSMutableSet.new();

  //create single flat set for the dependant styles of each upload candidate
  layerToUpload.forEach(function(value) {
    const origLayer = value;

    origLayer.sharedTextStyles.forEach(function(sharedObject) {
      sharedTextStyleDepencendies.addObject(sharedObject);
    });
    delete origLayer.sharedTextStyles; //no need for this list anymore, deleting to avoid unnecessary serialization

    origLayer.sharedLayerStyles.forEach(function(sharedObject) {
      sharedLayerStyleDependencies.addObject(sharedObject);
    });
    delete origLayer.sharedLayerStyles; //no need for this list anymore, deleting to avoid unnecessary serialization
  });

  //get parent libraries styles to prevent uploading them to children
  const parentLibraryBrandAISharedStyleIDs = NSMutableSet.new();
  styleData.globalAssets.sharedStyles.forEach(function(style) {
    if (style.styleguideId != styleData.styleguide._id) {
      parentLibraryBrandAISharedStyleIDs.addObject(style._id);
    }
  });
  const parentLibraryBrandAITypeStyleIDs = NSMutableSet.new();
  styleData.globalAssets.typeStyles.forEach(function(style) {
    if (style.styleguideId != styleData.styleguide._id) {
      parentLibraryBrandAITypeStyleIDs.addObject(style._id);
    }
  });

  //create data needed to upload each shared style
  const sharedLayerStylesToUpload = [];

  $.forEach(sharedLayerStyleDependencies.allObjects(), function(layerStyle) {
    const uploadData = {
      objectID: coerceString(layerStyle.objectID()),
      name: coerceString(layerStyle.name())
    };
    const brandAIID = brandAISharedStyleIDsByLayerStyleID[layerStyle.objectID()];
    if (!brandAIID || !parentLibraryBrandAISharedStyleIDs.containsObject(brandAIID)) {
      if (brandAIID) {
        uploadData._id = coerceString(brandAIID);
      }
      sharedLayerStylesToUpload.push(uploadData);
    }
  });

  //create data needed to upload each text style including font families
  const fontVariantsToUpload = {};
  const sharedTypeStylesToUpload = [];

  $.forEach(sharedTextStyleDepencendies.allObjects(), function(textStyle) {
    const typeStyle = typeStyles.brandAITypeStyleFromSketchSharedStyle(textStyle);
    const brandAIID = brandAITypeStyleIDsByTextStyleID[textStyle.objectID()];
    if (!brandAIID || !parentLibraryBrandAITypeStyleIDs.containsObject(brandAIID)) {
      if (brandAIID) {
        typeStyle._id = coerceString(brandAIID);
      }
      if (!fontVariantsToUpload[typeStyle.fontFamily]) {
        fontVariantsToUpload[typeStyle.fontFamily] = fonts.fontVariantsInFontFamily(typeStyle.fontFamily);
      }
      sharedTypeStylesToUpload.push(typeStyle);
    }
  });

  return {
    sharedTypeStylesToUpload: sharedTypeStylesToUpload,
    sharedLayerStylesToUpload: sharedLayerStylesToUpload,
    fontVariantsToUpload: fontVariantsToUpload
  };
}

function doesAcceptLayerStyles(layer) {
  return acceptsLayerStylesPredicate.evaluateWithObject(layer);
}

function matchesClassesPredicate(classes) {
  const predicateString = classes
    .map(function(c) {
      return 'className == "' + c.className() + '"';
    })
    .join(' OR ');
  return NSPredicate.predicateWithFormat(predicateString);
}

// TODO: support symbol masters from libraries here
function symbolMasterDependenciesForLayers(document, layers) {
  const allSymbolMastersBySize = symbolMastersBySizeInDocument(document);
  const symbolMasterDependenciesBySymbolId = {};
  const symbolMasterDependenciesByLayerId = {};
  var duplicationsFound = false;

  var processLayerTree = function(layer) {
    traverseLayers.traverseLayerTree(
      layer,
      function(layer, isInsideSymbol) {
        // Any symbol found in the layer tree is a dependency.

        if (layer.className() == 'MSSymbolMaster') {
          symbolMasterDependenciesBySymbolId[layer.symbolID()] = layer;
          symbolMasterDependenciesByLayerId[layer.objectID()] = layer.symbolID();

          // Also treat as a dependency any symbol that is
          // the same size as a symbol found inside a symbol
          // (not just inside a layer that the user wants to
          // upload). Layers of the same size as symbol master nested in a
          // symbol are shown by Sketch as potential overrides
          // so they should be included as dependencies.
          if (isInsideSymbol) {
            updateSameSizeCandidates(layer);
          }
        } else if (layer.className() == 'MSSymbolInstance') {
          // Also treat as a dependency any symbol that is
          // the same size as a symbol instance found inside a symbol
          // (not just inside a layer that the user wants to
          // upload). Layers of the same size nested in a
          // symbol are shown by Sketch as potential overrides
          // so they should be included as dependencies.
          updateSameSizeCandidates(layer);
        }
      },
      logMessage
    );
  };

  var updateSameSizeCandidates = function(layer) {
    const sizeOfSymbol = sizeKeyForLayer(layer);
    const symbolsOfSameSize = allSymbolMastersBySize[sizeOfSymbol];
    if (symbolsOfSameSize) {
      symbolsOfSameSize.forEach(function(symbol) {
        const sameSizeSymbolObjectId = symbol.objectID();
        const sameSizeSymbolSymbolID = symbol.symbolID();

        //symbolID we already found for this layerID
        const foundSymbolIDForLayerID = symbolMasterDependenciesByLayerId[sameSizeSymbolObjectId];

        //if the symbolID was not explored yet add it as a dependency
        //Using this validation we will not add same-size symbols that have different symbolIDs but the same layerID
        if (!foundSymbolIDForLayerID) {
          symbolMasterDependenciesBySymbolId[sameSizeSymbolSymbolID] = symbol;
          symbolMasterDependenciesByLayerId[sameSizeSymbolObjectId] = sameSizeSymbolSymbolID;
          processLayerTree(symbol);
        } else {
          //if layers for some reason have the same layerId and different symbol ids are considered as duplicates
          if (!sameSizeSymbolSymbolID.isEqualToString(foundSymbolIDForLayerID)) {
            duplicationsFound = true;
          }
        }
      });
    }
  };

  layers.forEach(function(layer) {
    processLayerTree(layer);
  });

  if (duplicationsFound) {
    //if duplication were found report an error
    var allSymbolsMasters = $.map(document.documentData().allSymbols(), function(symbol) {
      return {
        symbolId: coerceString(symbol.symbolID()),
        layerId: coerceString(symbol.objectID()),
        name: coerceString(symbol.name())
      };
    });
    logMessage('info', {
      message: 'Same size duplicate elements were found and ignored in uploadLayers',
      currentMasterSymbols: allSymbolsMasters
    });
  }

  // Return just an array of the values.
  return Object.keys(symbolMasterDependenciesBySymbolId).map(function(symbolID) {
    return symbolMasterDependenciesBySymbolId[symbolID];
  });
}

function symbolMastersBySizeInDocument(document) {
  const symbols = document.documentData().allSymbols();
  const bySize = {};
  $.forEach(symbols, function(symbol) {
    const size = sizeKeyForLayer(symbol);
    bySize[size] = bySize[size] || [];
    bySize[size].push(symbol);
  });
  return bySize;
}

function sizeKeyForLayer(layer) {
  return layer.bounds().size.width + 'X' + layer.bounds().size.height;
}

exports.sharedStyleObjectsForLayer = sharedStyleObjectsForLayer;
exports.styleDependenciesForLayers = styleDependenciesForLayers;
exports.acceptsLayerStylesPredicate = acceptsLayerStylesPredicate;
exports.doesAcceptLayerStyles = doesAcceptLayerStyles;
exports.matchesClassesPredicate = matchesClassesPredicate;
exports.symbolMasterDependenciesForLayers = symbolMasterDependenciesForLayers;
