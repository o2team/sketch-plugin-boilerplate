/*
  global
  MSSharedStyle
  NSBundle
  MSStyledLayer
  NSUserDefaults
*/

/**
 * Copy/Paste listeners are utilised for two different needs:
 * 1. Inspect integration: when pasting items from one document to another, we are adding library metadata's libraries from the source to the destination document
 * 2. ID fix on paste - since Sketch 52, when pasting a symbol / shared style from a document to another, Sketch would change their IDs, which detaches DSM related items from
 * their libraries. We use custom code in the copy/paste actions to keep the original symbol / shared style ID the same.
 */

const persist = require('./persistence');
const {
  getDocumentUserInfoForDSM,
  updateDocumentUserInfoForDSM,
  debug,
  getLayerUserInfoForDSM,
  updateLayerUserInfoForDSM,
  getSymbolsMastersByID,
  getDefaultsKey
} = require('./util');
const { DSM_LIBRARY_METADATA_KEY } = require('../shared/constants');
const traverseLayers = require('./traverse-layers');
const { getSharedStyleID, setSharedStyleID } = require('./shared-style-helpers');
const logMessage = require('./logger');

const SKETCH_VERSION = getSketchVersionNumber();
const MINIMAL_SKETCH_VERSION_TO_ACTIVATE_ID_FIX = 52;
const IDS_FIX_ON_PASTE_IS_REQUIRED = SKETCH_VERSION >= MINIMAL_SKETCH_VERSION_TO_ACTIVATE_ID_FIX;
const DEFAULTS_KEY_FOR_ID_FIX_FEATURE_FLAG_VALUE = getDefaultsKey('enableFixIdsOnPaste');

function isIDsFixOnPasteEnabled() {
  return (
    // to check this defaults value you can run this in terminal (if true it prints 1, otherwise it says that it doesn't exist):
    // defaults read com.bohemiancoding.sketch3 com.invision.dsm.enableFixIdsOnPaste
    IDS_FIX_ON_PASTE_IS_REQUIRED && NSUserDefaults.standardUserDefaults().boolForKey(DEFAULTS_KEY_FOR_ID_FIX_FEATURE_FLAG_VALUE)
  );
}

/**
 * PASTE actions - context.actionContext.document = destination document
 */

/*
  This flow will update libraryMetadata from copied document to destination document, preserving the existing document libraryMetadata .
  This is needed as it assumed that copy paste to a document is a common flow and we would not want to miss the reference
  to DSM libraries for this case.

  Possible in-accuracies might happen in this flow, for example the copied item might not belong to the library,
  or we will copy all the libraries even if the item is coming only from one of them.
 */
function updateDestinationDocumentLibraryMetadata(context, refToOriginDocument) {
  const destinationDocument = context.actionContext.document;
  if (destinationDocument !== refToOriginDocument) {
    const originDocumentLibrariesMetadata = getDocumentUserInfoForDSM(context, DSM_LIBRARY_METADATA_KEY, refToOriginDocument);
    const destinationDocumentLibrariesMetadata = getDocumentUserInfoForDSM(
      context,
      DSM_LIBRARY_METADATA_KEY,
      destinationDocument
    );

    if (originDocumentLibrariesMetadata.allValues().length > 0) {
      originDocumentLibrariesMetadata.allValues().forEach(function(libraryMetadata) {
        destinationDocumentLibrariesMetadata[libraryMetadata.styleguideId] = libraryMetadata;
      });
      updateDocumentUserInfoForDSM(
        context,
        DSM_LIBRARY_METADATA_KEY,
        destinationDocumentLibrariesMetadata,
        context.actionContext.document
      );
    }
  }
}

function handleSharedStylePaste(layer, context, documentLayerStylesById, documentTextStylesById) {
  if (!isStyled(layer)) {
    return;
  }
  const currentSharedStyleID = getSharedStyleID(layer);
  if (currentSharedStyleID) {
    const originalSharedStyleID = getLayerUserInfoForDSM(context, 'originalSharedStyleID', layer);
    if (originalSharedStyleID) {
      // if original is already in the document's shared styles then we assume sketch will use it
      // (unless it was modified? we can know that sketch is not going to use the existing by checking original===current - but then, what can we do? for now in this case we'll not intervene and
      // let sketch create a new style with a new id and use it)
      if (documentLayerStylesById[originalSharedStyleID] || documentTextStylesById[originalSharedStyleID]) {
        return;
      }

      const resultFromLayerStyles = documentLayerStylesById[currentSharedStyleID];
      const resultFromTextStyles = documentTextStylesById[currentSharedStyleID];
      const currentSharedStyle = resultFromLayerStyles || resultFromTextStyles;
      const isTextStyle = !!resultFromTextStyles;
      if (currentSharedStyle) {
        // create a new sharedStyle based on currentSharedStyle but with the ID of originalSharedStyleID
        const newStyle = currentSharedStyle.style().copy(); //MSStyle.alloc().init();
        const newSharedStyle = MSSharedStyle.new();
        newSharedStyle.setValue(newStyle);
        newSharedStyle.setName(currentSharedStyle.name());
        newSharedStyle.setObjectID(originalSharedStyleID);
        if (newSharedStyle.style().setSharedObjectID) {
          // before 52.0
          newSharedStyle.style().setSharedObjectID(originalSharedStyleID);
        }

        const document = context.actionContext.document;
        const data = document.documentData();
        const sketchSharedStylesRelevantContainer = isTextStyle ? data.layerTextStyles() : data.layerStyles();
        const addedLayerStyle = replaceSharedStyleInContainer(
          sketchSharedStylesRelevantContainer,
          currentSharedStyle,
          newSharedStyle
        );
        setSharedStyleID(layer, originalSharedStyleID);
        layer.style().setTextStyle(addedLayerStyle.style().textStyle());
      }
    }
  }
}

function replaceSharedStyleInContainer(sharedStyleContainer, existingSharedStyle, newSharedStyle) {
  //add new sharedStyle with the added text style data
  sharedStyleContainer.addSharedObject(newSharedStyle);

  // As the addSharedObject method does not return the added style we need to find it manually.
  // Since it was added at the end we just use the length to find its place
  var allSharedStylesInContainer = sharedStyleContainer.objects();
  const addedSharedStyle = allSharedStylesInContainer[allSharedStylesInContainer.length - 1];

  // remove the sharedStyle added by Sketch
  sharedStyleContainer.removeSharedObject(existingSharedStyle);

  return addedSharedStyle;
}

// eslint-disable-next-line no-unused-vars
function onPasteFinish(context) {
  // Retrieve the reference to the document in which we performed the copy so that we can look it up later
  const refToOriginDocument = persist.get('lastCopiedDocumentRef');
  if (refToOriginDocument) {
    updateDestinationDocumentLibraryMetadata(context, refToOriginDocument);
  }

  if (!isIDsFixOnPasteEnabled()) {
    return;
  }
  debug('isIDsFixOnPasteEnabled: true');
  const document = context.actionContext.document;
  const selectedLayersFromActionContext = document.selectedLayers().layers();
  const documentLayerStylesById = getDocumentLayerStylesById(document);
  const documentTextStylesById = getDocumentTextStylesById(document);
  const symbolMastersByID = getSymbolsMastersByID(document);
  selectedLayersFromActionContext.forEach((layer) => {
    // the traverseLayerTree function doesn't run the callback for the selected symbol instance,
    // so calling its logic here explicitly before traversal begins
    handleSharedStylePaste(layer, context, documentLayerStylesById, documentTextStylesById);
    handlePasteSymbolInstance(layer, context, symbolMastersByID);

    traverseLayers.traverseLayerTree(
      layer,
      function(layer) {
        handleSharedStylePaste(layer, context, documentLayerStylesById, documentTextStylesById);
        handlePasteSymbolInstance(layer, context, symbolMastersByID);
      },
      logMessage
    );
  });
}

function handlePasteSymbolInstance(layer, context, symbolMastersByID) {
  if (layer.className() == 'MSSymbolInstance') {
    const symbolMaster = layer.symbolMaster();
    const originalSymbolID = getLayerUserInfoForDSM(context, 'originalSymbolID', layer);
    if (!originalSymbolID) {
      return;
    }
    // check if the original symbol id is already in the document, if so we assume sketch is going to use if possible (if it wasn't modified)
    // instead of creating a new one, and so we exit the flow (we could verify sketch in fact intends to use the same symbol by comparing
    // currentSymbolID === originalSymbolID but if we force in this case to use the document's version of the symbol it will change, so we need to think which one is the source of truth)
    if (symbolMastersByID[originalSymbolID]) {
      return;
    }

    // update both master symbol and the pasted layer symbol id to be the same as the original
    layer.setSymbolID(originalSymbolID);

    // this condition is to support the following:
    // if the copy selection contained multiple symbol instances of the same symbol then ONLY one of them will have a symbolMaster with value
    // but we still want to align all of them to use the new symbol id
    if (symbolMaster) {
      symbolMaster.setSymbolID(originalSymbolID);
    } else {
      debug('no symbolMaster, updating only the layer to use the new ID');
    }
  }
}

/**
 * COPY actions - context.actionContext.document = origin document
 */

// eslint-disable-next-line no-unused-vars
function onCopyFinish(context) {
  // Save the reference to the document in which we performed the copy so that we can look it up later
  persist.set('lastCopiedDocumentRef', context.actionContext.document);
}

// eslint-disable-next-line no-unused-vars
function onCopyBegin(context) {
  if (!isIDsFixOnPasteEnabled()) {
    return;
  }
  debug('isIDsFixOnPasteEnabled: true');
  const selectedLayersFromActionContext = context.actionContext.document.selectedLayers().layers();
  selectedLayersFromActionContext.forEach((layer) => {
    // the traverseLayerTree function doesn't run the callback for the selected symbol instance,
    // so calling it here explicitly before traversal begins
    handleCopyLayer(layer, context);
    traverseLayers.traverseLayerTree(
      layer,
      function(layer) {
        handleCopyLayer(layer, context);
      },
      logMessage
    );
  });
}

function handleCopyLayer(layer, context) {
  // handle shared styles
  if (isStyled(layer)) {
    const sharedStyleID = getSharedStyleID(layer);
    if (sharedStyleID) {
      updateLayerUserInfoForDSM(context, 'originalSharedStyleID', sharedStyleID, layer);
    }
  }

  // handle symbol instance copy
  if (layer.className() == 'MSSymbolInstance') {
    const originalSymbolID = layer.symbolID();
    updateLayerUserInfoForDSM(context, 'originalSymbolID', originalSymbolID, layer);
  }
}

function isStyled(layer) {
  return layer.class().isSubclassOfClass(MSStyledLayer);
}

function getSketchVersionNumber() {
  return parseFloat(
    NSBundle.mainBundle()
      .infoDictionary()
      .CFBundleShortVersionString.UTF8String()
  );
}

/**
 * Get all the layer text styles of the current document mapped by sharedObjectId
 */
function getDocumentTextStylesById(document) {
  const results = {};
  getDocumentTextStyles(document).forEach(function(sketchLayerStyle) {
    results[sketchLayerStyle.objectID()] = sketchLayerStyle;
  });

  return results;
}

/**
 * Get all the shared layer styles of the current document mapped by sharedObjectId
 */
function getDocumentLayerStylesById(document) {
  const results = {};
  getDocumentLayerStyles(document).forEach(function(sketchLayerStyle) {
    results[sketchLayerStyle.objectID()] = sketchLayerStyle;
  });

  return results;
}

/**
 * Returns all the text styles of the current document
 */
function getDocumentTextStyles(document) {
  return document
    .documentData()
    .layerTextStyles()
    .objects();
}

/**
 * Return all the shared layer styles of the current document
 */
function getDocumentLayerStyles(document) {
  return document
    .documentData()
    .layerStyles()
    .objects();
}
