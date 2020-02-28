/*
  global
  MSDocument
  NSMutableSet
*/

const $ = require('./collection-helpers');
const getParentLayer = require('./traverse-layers').getParentLayer;

// This function is partly a hold-over from the Sketch 41/42 days when they
// switched from returning NSArray to MSLayerArray. All the versions we now
// support return MSLayerArray, but it’s still useful to just get an NSArray of
// the currently selected layers and that’s what this does.
function selectedLayersInDocument(document) {
  return document.selectedLayers().containedLayers();
}

function getSelectedLayerCount() {
  const document = MSDocument.currentDocument();
  var result = 0;

  if (document) {
    result = selectedLayersInDocument(document).count();
  }
  return result;
}

function normalizeSelectedSymbols(selectedLayers) {
  const selectedLayersNormalized = NSMutableSet.new();

  $.forEach(selectedLayers, function(layer) {
    const parent = getParentLayer(layer);
    if (parent && parent.class() == 'MSSymbolMaster') {
      // If the direct parent of a selected layer is a symbol master, ignore
      // the layer and pretend the master is selected.
      selectedLayersNormalized.addObject(parent);
    } else {
      // All other layers are added (minus deduplication).
      selectedLayersNormalized.addObject(layer);
    }
  });

  return selectedLayersNormalized.allObjects();
}

exports.selectedLayersInDocument = selectedLayersInDocument;
exports.getSelectedLayerCount = getSelectedLayerCount;
exports.normalizeSelectedSymbols = normalizeSelectedSymbols;
