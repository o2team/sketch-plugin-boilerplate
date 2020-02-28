/* global NSImage MSBitmapLayer */

// Provide same API as built in Sketch importers for SVG, EPS, etc.
function BitmapImporter() {}

BitmapImporter.prototype.prepareToImportFromData = function(imageData) {
  this.imageData = imageData;
};

BitmapImporter.prototype.importAsLayer = function() {
  var image = NSImage.alloc().initWithData(this.imageData);
  return MSBitmapLayer.bitmapLayerFromImage_withSizeScaledDownByFactor(image, 1);
};
