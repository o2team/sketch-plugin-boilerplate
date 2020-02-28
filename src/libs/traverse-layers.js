/*
  global
  MSLayer
  NSMutableSet
*/

const $ = require('./collection-helpers');
const coerceString = require('./coerce').coerceString;

// since this flow is invoked several times from upload process we wouldn't want
// to report the error from each, so just choosing to invoke it from here.
function traverseLayerTree(layer, func, reportError) {
  const visitedLayers = NSMutableSet.new();

  function visitLayer(layer, isInsideSymbol, isRoot) {
    if (visitedLayers.containsObject(layer)) {
      // Skip layers already visited. This can happen when a layer contains
      // multiple instances of the same symbol.
      return;
    }
    visitedLayers.addObject(layer);

    // Look inside symbols.
    if (layer.className() == 'MSSymbolInstance') {
      var symbolInstance = layer;
      layer = layer.symbolMaster();
      isInsideSymbol = !isRoot;

      if (!layer) {
        if (reportError) {
          reportError('error', {
            message: 'Skipping layer without symbol master',
            layerInstance: coerceString(symbolInstance.name())
          });
        }
        return;
      }
    }

    if (layer) {
      $.forEach(layer.children(), function(child) {
        if (child.className() == 'MSSymbolInstance') {
          // Recurse on symbol instances.
          visitLayer(child, isInsideSymbol, false);
        }
        // For all layers, call the user provided function.
        func(child, !!isInsideSymbol);
      });
    }
  }

  visitLayer(layer, false, true);
}

function getParentLayer(layer, parentClass) {
  // Default to any MSLayer.
  parentClass = parentClass || MSLayer;

  return $.find(
    layer
      .ancestors()
      .reverseObjectEnumerator()
      .allObjects(),
    function(ancestor) {
      // Some versions of Sketch return ancestors() with the layer itself in the
      // list of ancestors, so we have to check that the ancestor is not the
      // input layer.
      return ancestor.class().isSubclassOfClass(parentClass) && ancestor !== layer;
    }
  );
}

exports.traverseLayerTree = traverseLayerTree;
exports.getParentLayer = getParentLayer;
