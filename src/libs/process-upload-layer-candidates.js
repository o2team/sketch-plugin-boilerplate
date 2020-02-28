/*
  global
  NSApplication
  NSURL
*/

const constants = require('../shared/constants');
const util = require('./util');
const debug = util.debug;
const $ = require('./collection-helpers');
const coerceJS = require('./coerce').coerceJS;
const layerExport = require('./layer-export');
const sketchLibraryHelpers = require('./sketch-library-helpers');
const persist = require('./persistence');
const logMessage = require('./logger');

const ImageReplaceResponse = {
  Skip: 1,
  Cancel: 2,
  Replace: 3,
  CreateNew: 4
};

function getCurrentItemsInTarget(globalAssets, imageType, folderId, componentContainerId) {
  const category = constants.IMAGE_CATS[imageType];
  const allImageTypeItems = globalAssets[category.itemsKey];
  const itemsInTarget = [];
  const isItemInTarget = folderId ? (item) => item.folderId === folderId : (item) => item.componentContainerId === componentContainerId;
  allImageTypeItems.forEach((item) => {
    if (isItemInTarget(item)) {
      itemsInTarget.push(item);
    }
  });
  return itemsInTarget;
}

function imageMediaTypeFromExtension(extension) {
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'svg':
      return 'image/svg+xml';
  }
}

function displayImageInWebView(webView, imageURL, backgroundColor) {
  const html =
    '<body style="background:' +
    (backgroundColor || 'white') +
    '; margin:0; padding:10px; box-sizing:border-box; justify-content:center; overflow:hidden; height:100%; display:flex; align-items:center;">' +
    '<img src="' +
    imageURL +
    '" style="max-width:100%; max-height:100%">' +
    '</body>';
  webView.mainFrame().loadHTMLString_baseURL(html, null);
}

function displayReplaceImageDialog(nib, options) {
  const app = NSApplication.sharedApplication();

  nib.replaceImageSkipButton.setHidden(!options.allowSkip);
  nib.replaceImageAcceptForAll.setHidden(!options.allowSkip);
  nib.replaceImageAcceptForAll.setState(false);

  // Skip button action.
  nib.attachTargetAndAction(nib.replaceImageSkipButton, function() {
    app.stopModalWithCode(ImageReplaceResponse.Skip);
    nib.replaceImageWindow.close();
  });

  // Cancel button action.
  nib.attachTargetAndAction(nib.replaceImageCancelButton, function() {
    app.stopModalWithCode(ImageReplaceResponse.Cancel);
    nib.replaceImageWindow.close();
  });

  // Create new button action.
  nib.attachTargetAndAction(nib.replaceImageCreateNewButton, function() {
    app.stopModalWithCode(ImageReplaceResponse.CreateNew);
    nib.replaceImageWindow.close();
  });

  // Replace buttion action.
  nib.attachTargetAndAction(nib.replaceImageReplaceButton, function() {
    app.stopModalWithCode(ImageReplaceResponse.Replace);
    nib.replaceImageWindow.close();
  });

  //accept all button
  nib.attachTargetAndAction(nib.replaceImageAcceptForAll, function() {
    if (options.acceptAllStatus) {
      options.acceptAllStatus(nib.replaceImageAcceptForAll.state());
    }
  });

  // Set window title.
  nib.replaceImageWindow.setTitle(options.itemNumber + ' of ' + options.totalItems + ' Possible Matches');

  // Show new image.
  nib.replaceImageNewItemNameLabel.setStringValue(options.newItemName || '');
  displayImageInWebView(nib.replaceImageNewItemWebView, options.newItemDisplayURL, options.backgroundColor);

  // Show old image.
  nib.replaceImageOldItemNameLabel.setStringValue(options.oldItemName || '');
  displayImageInWebView(nib.replaceImageOldItemWebView, options.oldItemDisplayURL, options.backgroundColor);

  return app.runModalForWindow(nib.replaceImageWindow);
}

function findBestPossibleMatch(layerName, layerSymbolID, items) {
  var possibleMatchingItemByName = [];
  var possibleMatchingBySymbolId = [];

  items.forEach(function(item) {
    //add all potentially matching items by name
    if (layerName == item.name) {
      possibleMatchingItemByName.push(item);
    }

    //add all potentially matching items by symbol id
    const itemSymbolID = item.metadata && item.metadata.sketchSymbolId;
    if (layerSymbolID && itemSymbolID == layerSymbolID) {
      possibleMatchingBySymbolId.push(item);
    }
  });

  var possibleMatchingItem = null;
  //if we found a single item match by name suggest it as replacement candidate, otherwise we dont want to guess
  // and will consider it as new consider as new
  if (possibleMatchingItemByName.length == 1) {
    possibleMatchingItem = possibleMatchingItemByName[0];
  }

  //if no possible match by name, comapre again if we have onle one instance match by symbol id suggest it as candidate
  //(it should cover the case where the name changed but we can recognize specific instance by sketchsymbol id)
  if (!possibleMatchingItem && possibleMatchingBySymbolId.length == 1) {
    possibleMatchingItem = possibleMatchingBySymbolId[0];
  }
  return possibleMatchingItem;
}

function processLayerCandidates(nib, payload, styleData, selectedLayers, foreignSymbolIDMap) {
  const layersChosenForUpload = [];
  const layersToUpload = [];
  const layersToUploadByID = {};

  // Look ahead to see how many layers will need user input to decide what to do
  // with them.
  var userInputNeededCount = 0;
  const firstPassLayers = $.map(selectedLayers, function(layer) {
    var userInputNeeded = false;
    var imageID;
    var matchingImageName;
    var matchingImageURL;
    var matchingImageBackgroundColor;
    var matchingImageBackgroundColorID;
    var matchingImageExtension;

    // Determine if we will need user input...
    // Look for items with the same name in the same folder.
    const symbolIDForUpload = sketchLibraryHelpers.foreignSymbolIDOrLocalSymbolIDForLayer(layer, foreignSymbolIDMap);
    const items = getCurrentItemsInTarget(styleData.globalAssets, payload.imageType, payload.folderId, payload.componentContainerId);
    if (items && items.find) {
      const possibleMatchingItem = findBestPossibleMatch(layer.name(), symbolIDForUpload, items);

      if (possibleMatchingItem) {
        userInputNeeded = true;
        userInputNeededCount += 1;
        imageID = possibleMatchingItem._id;
        matchingImageName = possibleMatchingItem.name;
        matchingImageURL = possibleMatchingItem.url;
        matchingImageExtension = possibleMatchingItem.extension;
        matchingImageBackgroundColor = possibleMatchingItem.backgroundColor;
        matchingImageBackgroundColorID = possibleMatchingItem.backgroundColorID;
      }
    }

    return {
      layer: layer,
      needsUserInput: userInputNeeded,
      imageID: imageID,
      symbolIDForUpload: symbolIDForUpload,
      matchingImageName: matchingImageName,
      matchingImageURL: matchingImageURL,
      matchingImageExtension: matchingImageExtension,
      matchingImageBackgroundColor: matchingImageBackgroundColor,
      matchingImageBackgroundColorID: matchingImageBackgroundColorID
    };
  });

  var userAnsweredCount = 0;
  var acceptedChoiceForAll = false;
  var lastUserChoice = null;
  for (var i = 0; i < firstPassLayers.length; i++) {
    const layerInfo = firstPassLayers[i];
    const layer = layerInfo.layer;
    var imageID = layerInfo.imageID;
    var backgroundColorID = layerInfo.matchingImageBackgroundColorID;

    if (layerInfo.needsUserInput) {
      var oldItemDisplayURL = layerInfo.matchingImageURL;

      // If the image is already cached, use a data URL
      // for that data instead of using a URL that will
      // have to be loaded over the network.
      const oldItemData = dataFromURL(oldItemDisplayURL);
      if (oldItemData) {
        oldItemDisplayURL = util.dataURLFromData(oldItemData, imageMediaTypeFromExtension(layerInfo.matchingImageExtension));
      }

      // For the new item, export directly from the document.
      // TODO { format: 'png', scale: 2 } might work here for retina without any other changes.
      const newItemDisplayURL = layerExport.imageDataForLayer(layer, { format: 'png' }).dataURL;

      const userChoice = acceptedChoiceForAll
        ? lastUserChoice
        : displayReplaceImageDialog(nib, {
            allowSkip: firstPassLayers.length > 1,
            totalItems: userInputNeededCount,
            itemNumber: (userAnsweredCount += 1),

            newItemName: layer.name(),
            newItemDisplayURL: newItemDisplayURL,

            oldItemName: layerInfo.matchingImageName,
            oldItemDisplayURL: oldItemDisplayURL,

            backgroundColor: layerInfo.matchingImageBackgroundColor,
            acceptAllStatus: function(enabled) {
              acceptedChoiceForAll = enabled;
            }
          });

      //remember the last user choice so the next items will use it
      lastUserChoice = userChoice;

      if (userChoice == ImageReplaceResponse.Cancel) {
        return;
      } else if (userChoice == ImageReplaceResponse.Skip) {
        continue;
      } else if (userChoice == ImageReplaceResponse.CreateNew) {
        // Clear the ID so it will be uploaded as a new image.
        imageID = void 0;
        backgroundColorID = void 0;
      }
    } else {
      // If we didn’t need user input, then ensure we are going to upload
      // as a new image. The imageID could be out of date, and might not
      // have contributed to a match, or it could be an ID from another
      // section. Either way, we don’t care. If we already determined we
      // were not going to ask the user, the behavior now should be to
      // upload a new image.
      imageID = void 0;
    }

    layersChosenForUpload.push(layer);

    layersToUploadByID[layer.objectID()] = layer;

    layersToUpload.push(
      coerceJS({
        id: layer.objectID(),
        name: layer.name(),
        entityType: payload.imageType,
        folderId: payload.folderId,
        componentContainerId: payload.componentContainerId,
        imageID: imageID,
        symbolID: layerInfo.symbolIDForUpload,
        originalSymbolID: layer.symbolID && layer.symbolID(), // Not used anywhere, just saved for possible troubleshooting.
        backgroundColorID: backgroundColorID
      })
    );
  }

  return {
    layersToUpload: layersToUpload,
    sketchLayersList: layersChosenForUpload,
    sketchLayersByObjectID: layersToUploadByID
  };
}

function dataFromURL(urlString) {
  var imgData;
  const url = NSURL.URLWithString(urlString);
  const webView = persist.get('dsmMainWebView');

  if (webView) {
    var resource = webView
      .mainFrame()
      .dataSource()
      .subresourceForURL(url);
    if (resource) {
      debug('Loading image data from web view data source (' + urlString + ')');
      imgData = resource.data();
    }
  }

  if (!imgData) {
    debug('Did not find the url in the web resource cache. url:' + urlString);
    logMessage('info', { message: 'Did not find the url in the web resource cache.', url: urlString });
  }

  return imgData;
}

module.exports = processLayerCandidates;
