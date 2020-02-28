// You may be wondering what is up with the similarly-named
// shared-styles-helpers.cocoascript file. This file is intended to be for
// functions that work on both layer styles and text styles. “Shared styles”
// used to be synonymous with layer styles only, but our terminology now takes
// it to mean layer styles *and* text styles (which are both “shared”).

function getSharedStyleID(layer) {
  if (layer.sharedStyleID) {
    // Sketch 52
    return layer.sharedStyleID();
  }

  return layer.style().sharedObjectID();
}

function setSharedStyleID(layer, objectID) {
  if (layer.setSharedStyleID) {
    // Sketch 52
    layer.setSharedStyleID(objectID);
  } else {
    layer.style().setSharedObjectID(objectID);
  }
}

exports.getSharedStyleID = getSharedStyleID;
exports.setSharedStyleID = setSharedStyleID;
