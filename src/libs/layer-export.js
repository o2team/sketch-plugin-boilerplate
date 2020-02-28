/*
  global
  MSDocument
  MSExportRequest
  MSExporter
  MSShapeGroup
  MSSliceLayer
  NSMakeRect
  NSMutableSet
*/

const util = require('./util');
const archive = require('./archive');
const constants = require('../shared/constants');
const coerce = require('./coerce');
const sketchLibraryHelpers = require('./sketch-library-helpers');

function exportLayerInFormatsForType(document, layer, entityType, options) {
  const results = [];
  const alreadyExported = NSMutableSet.new();

  ['formatsToUpload', 'previewsToUpload'].forEach(function(exportOptionsKey) {
    return constants.IMAGE_CATS[entityType][exportOptionsKey].forEach(function(exportOptions) {

      const exportOptionsObject = coerce.coerceJS(exportOptions);
      const exported = exportLayer(document, layer, Object.assign(exportOptionsObject, options));
      // Do not return two or more exports that are exactly
      // the same size and format as one another. This will
      // happen for example when two or more PNG previews
      // are requested that are the same size or larger than
      // the layer. When using maxLongEdge, the previews
      // will not be upscaled to larger than the layer
      // itself, so they will in fact be the same size as
      // each other.
      if (!alreadyExported.containsObject(exported.dataURL)) {
        exported.exportOptionsKey = exportOptionsKey;
        results.push(exported);

        // Note: the comparison is using the image data
        // itself since two images of the same format and
        // size will be identical, but a check of the size
        // and format would also be sufficient if it turns
        // out this doesn’t perform well enough.
        alreadyExported.addObject(exported.dataURL);
      }
    });
  });

  return results;
}

function exportLayer(document, layer, options) {
  options = options || {};

  if (options.format === 'skla') {
    return sketchDataForLayer(document, layer, options);
  } else {
    return imageDataForLayer(layer, options);
  }
}

function sketchDataForLayer(document, layer, options) {
  options = options || {};
  const format = 'skla';

  var archiveData;
  var exportedLayerID;
  var uploadFileName;
  var width;
  var height;

  if (options.foreignSymbolIDMap) {
    layer = sketchLibraryHelpers.createLayerByReplacingSymbolIDsWithForeignSymbolIDs(layer, options.foreignSymbolIDMap);
  }

  // Actually upload a fresh instance if a master was the item to be
  // uploaded. UNLESS it’s a symbol master dependency which has to be
  // stored as a master or it’s useless.
  if (layer.className() == 'MSSymbolMaster' && !options.isSymbolMasterDependency) {
    const instance = layer.newSymbolInstance();

    // Add instance to document temporarily for the archive to come out right.
    document.currentPage().addLayers([instance]);

    archiveData = archive.archiveDataFromSketchObject(instance);
    exportedLayerID = instance.objectID();
    uploadFileName = getUploadFileName(instance, options);
    width = instance.frame().width();
    height = instance.frame().height();

    // Remove instance from document.
    document.currentPage().removeLayer(instance);

  } else {
    archiveData = archive.archiveDataFromSketchObject(layer);
    exportedLayerID = layer.objectID();
    uploadFileName = getUploadFileName(layer, options);
    width = layer.frame().width();
    height = layer.frame().height();
  }

  return {
    id: exportedLayerID,
    format: format,
    dataURL: util.dataURLFromData(archiveData, 'application/x-skla'),
    uploadFileName: uploadFileName,
    byteLength: archiveData.length(),
    width: width,
    height: height
  };
}

function imageDataForLayer(layer, options) {
  const layerW = layer.frame().width();
  const layerH = layer.frame().height();

  // Set options.
  options = options || {};
  const format = options.format || 'png';
  const scale = options.scale || 1;
  const maxW = options.maxLongEdge || options.maxWidth || layerW;
  const maxH = options.maxLongEdge || options.maxHeight || layerH;

  // Calculate maximums.
  const maxScaleW = maxW / layerW;
  const maxScaleH = maxH / layerH;

  // Use whichever is the smaller scale, never going above
  // the layer’s native size (1).
  const maxScale = Math.min(maxScaleW, maxScaleH, 1);

  // The final scale is the restricted max size based on
  // `maxWidth`, `maxHeight`, and `maxLongEdge` options,
  // multiplied by the `scale` option. Calling code can ask
  // for `maxLongEdge: 200` AND `scale: 2` to get an image
  // that fits in 400x400 (200x200@2x).
  const targetScale = maxScale * scale;

  // Export image.
  const exportRequest = MSExportRequest.exportRequestsFromExportableLayer(layer)[0];
  exportRequest.setFormat(format);
  exportRequest.setScale(targetScale);
  exportRequest.setSaveForWeb(true);

  const exporter = MSExporter.exporterForRequest_colorSpace(exportRequest, null);
  const resultWidth = exporter.bounds().size.width;
  const resultHeight = exporter.bounds().size.height;

  const imageData = exporter.data();
  const dataURL = util.dataURLFromData(imageData, util.mimeTypeForExt(format));
  const byteLength = imageData.length();

  const uploadFileName = getUploadFileName(layer, options);

  return {
    id: layer.objectID(),
    format: format,
    dataURL: dataURL,
    uploadFileName: uploadFileName,
    byteLength: byteLength,
    width: resultWidth,
    height: resultHeight
  };
}

function imagePreviewForLayerStyle(layerStyle, size) {
  const paddingSize = 4;
  const document = MSDocument.new();

  const layerRect = NSMakeRect(
    paddingSize,
    paddingSize,
    size - (paddingSize * 2),
    size - (paddingSize * 2)
  );
  const layer = MSShapeGroup.shapeWithRect(layerRect);
  layer.setStyle(layerStyle.style());

  const slice = MSSliceLayer.new();
  slice.frame().setWidth(size);
  slice.frame().setHeight(size);

  document.currentPage().addLayers([layer, slice]);

  const exportRequest = MSExportRequest.exportRequestsFromExportableLayer(slice)[0];
  exportRequest.setFormat('png');
  exportRequest.setSaveForWeb(true);
  exportRequest.setScale(2);

  const exporter = MSExporter.exporterForRequest_colorSpace(
    exportRequest,
    null
  );

  return exporter.data();
}

function getUploadFileName(layer, exportOptions) {
  const prefix = exportOptions.isSymbolMasterDependency ? 'sketch-symbols/' : '';
  const suffix = exportOptions.fileNameSuffix || '';
  var name = layer.name() + '-' + layer.objectID();
  if (layer.symbolID) {
    name = name + '--' + layer.symbolID();
  }
  const extension = exportOptions.format;

  return prefix + name + suffix + '.' + extension;
}

exports.exportLayerInFormatsForType = exportLayerInFormatsForType;
exports.exportLayer = exportLayer;
exports.imageDataForLayer = imageDataForLayer;
exports.imagePreviewForLayerStyle = imagePreviewForLayerStyle;
exports.getUploadFileName = getUploadFileName;
