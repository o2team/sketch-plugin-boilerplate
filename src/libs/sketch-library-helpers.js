/*
  global
  MSSymbolInstance
  MSSymbolMaster
*/

const $ = require('./collection-helpers');
const dependencyHelpers = require('./dependency-helpers');

/**
 * @param {MSDocument} document - The current document.
 * @returns {Object} For all the symbols in the document that are actually from
 *   a Sketch Library, maps their symbol ID in the document to their symbol ID in
 *   the Sketch Library.
 */
function foreignSymbolIDMapForDocument(document) {
  const foreignSymbols = document.documentData().foreignSymbols();
  return $.mapObject(foreignSymbols, function(foreignSymbol) {
    return [foreignSymbol.localObject().symbolID(), foreignSymbol.remoteShareID()];
  });
}

/**
 * @param {MSLayer} layer - The layer to get the symbol ID for.
 * @param {Object} foreignSymbolIDMap - Keys are document symbol IDs and values
 *   are Sketch Library symbol IDs.
 * @returns {(NSString|undefined)} For symbols that come from a Sketch library,
 *   returns the Sketch library symbol ID. For symbols that are local to the
 *   document, returns the local symbol ID. For non-symbol layers, returns
 *   undefined.
 */
function foreignSymbolIDOrLocalSymbolIDForLayer(layer, foreignSymbolIDMap) {
  var symbolID;
  if (layer.symbolID) {
    // If the layer has a .symbolID(), use that.
    symbolID = layer.symbolID();

    // If the layer comes from a Sketch library, use the ID there instead.
    const foreignSymbolID = foreignSymbolIDMap[symbolID];
    if (foreignSymbolID) {
      symbolID = foreignSymbolID;
    }
  }

  return symbolID;
}

/**
 * @param {MSLayer} layer - Any Sketch layer. This function will ignore
 *   (return) layers that do not have any IDs to replace.
 * @param {Object} foreignSymbolIDMap - Keys are document symbol IDs and values
 *   are Sketch Library symbol IDs.
 * @returns {MSLayer} Returns the same layer that was passed in, or a copy of
 *   the layer with its symbol ID and any descendant layers symbol IDs replaced
 *   according to foreignSymbolIDMap where applicable. Layers are copied so that
 *   the caller does not have to worry about the layers being mutated which could
 *   cause the Sketch document to be modified or may simply be confusing.
 */
function createLayerByReplacingSymbolIDsWithForeignSymbolIDs(layer, foreignSymbolIDMap) {

  const symbols = allSymbolMastersAndInstancesInLayer(layer);
  const hasAnyForeignSymbols = !!$.find(symbols, function(symbol) {
    return foreignSymbolIDMap[symbol.symbolID()];
  });

  if (hasAnyForeignSymbols) {
    const layerCopy = layer.copy();
    const symbolsCopy = allSymbolMastersAndInstancesInLayer(layerCopy);

    $.forEach(symbols, function(symbol, i) {
      const foreignSymbolID = foreignSymbolIDMap[symbol.symbolID()];

      // Get the corresponding layer on the copied tree, assuming that the layers
      // are in the same order.
      const symbolCopy = symbolsCopy[i];

      // Test the assumption that we have the correct corresponding layer.
      if (!symbolCopy.name().isEqualToString(symbol.name())) {
        throw new Error('Layer copy does not appear to have listed its descendants in the same order as the original.');
      }

      if (foreignSymbolID) {
        // Set the foreign symbol ID on the copied tree.
        symbolCopy.setSymbolID(foreignSymbolID);
      } else {
        // .copy() changes the symbolID; restore it here.
        symbolCopy.setSymbolID(symbol.symbolID());
      }

      if (symbolCopy.className() == 'MSSymbolInstance') {
        // If current item is a symbol instance we want to preserve its id during upload as it is the id that is used
        // as override key in places where for this instance a different override will be used
        symbolCopy.setObjectID(symbol.objectID());
        fixOverrideValues(symbolCopy, foreignSymbolIDMap);
      }
    });

    return layerCopy;

  } else {
    // This catches the case where SymbolInstance is not from a master that is found in sketch library, but from local doc.
    // Since it can still point to some inner overrides from sketch library we want to update its overrides value
    if (layer.className() == 'MSSymbolInstance') {
      const copiedLayer = layer.copy();
      const foundFixes = fixOverrideValues(copiedLayer, foreignSymbolIDMap);
      // No need to return the copied instance in case no modifications took place there
      return foundFixes ? copiedLayer : layer;
    }
  }

  return layer;
}

/* *
 *
 * Update override values in case those pointed out to symbols for which we are updating local symbolId to foreign shared id.
 * If local symbolId is found we will set to the id found in foreignSymbolsMap
 *
 * @param layer
 * @param foreignSymbolIDMap
 * @returns {boolean}
 */
function fixOverrideValues(layer, foreignSymbolIDMap){
  let foundFixes = false;
  if (layer.overrideValues) {
    const overrideValues = layer.overrideValues();
    overrideValues.forEach(function(override) {
      //The value of an override is symbolID. since we are changing symbolIds to foreign symbol ids for sketch library items
      //we need to update them in case they were referenced in overrides as well
      const overrideValue = override.value();
      const overrideValueForeignSymbolId = foreignSymbolIDMap[overrideValue];
      if (overrideValueForeignSymbolId) {
        override.value = overrideValueForeignSymbolId;
        foundFixes = true;
      }
    });
  }
  return foundFixes;
}

function allSymbolMastersAndInstancesInLayer(layer) {
  // Fast way to get all the descendant symbol instances and the root (if it is
  // a master or instance). There are several assumptions at work here:
  //   1. children() returns *all* descendants, not just children but grandchildren, etc.
  //   2. children() returns not only descendants but also the containing layer.
  return layer
    .children()
    .filteredArrayUsingPredicate(dependencyHelpers.matchesClassesPredicate([MSSymbolMaster, MSSymbolInstance]));
}

exports.foreignSymbolIDMapForDocument = foreignSymbolIDMapForDocument;
exports.foreignSymbolIDOrLocalSymbolIDForLayer = foreignSymbolIDOrLocalSymbolIDForLayer;
exports.createLayerByReplacingSymbolIDsWithForeignSymbolIDs = createLayerByReplacingSymbolIDsWithForeignSymbolIDs;
