/*
  global
  MOClassDescription
  NSClassFromString
  NSCompositeSourceAtop
  NSObject
  NSProcessInfo
  NSRectFillUsingOperation
  NSSelectorFromString
  NSString
  NSTemporaryDirectory
  NSSearchPathForDirectoriesInDomains
  NSApplicationSupportDirectory
  NSUserDomainMask
  NSUUID
  NSUserDefaults
  NSMakeRect
  NSMutableDictionary
  coscript
  log
  MSDocument
  NSBundle
*/

const $ = require('./collection-helpers');

const DEBUG = NSUserDefaults.standardUserDefaults().boolForKey('BrandAIDebug');
const LEGACY_CACHE_PATH = NSTemporaryDirectory();

function debug(msg) {
  if (DEBUG) {
    log(msg);
  }
}

function getTempFilePath(name, ext, ignoreUnique, useLegacyPath, logErrors) {
  var fileName = name;

  if (!ignoreUnique) {
    var unique = NSProcessInfo.processInfo().globallyUniqueString();
    fileName = name + '__' + unique;
  }
  if (ext) {
    fileName += '.' + ext;
  }

  const basePath = useLegacyPath ? LEGACY_CACHE_PATH : getTempFilesBaseDirectory(logErrors);

  return basePath.stringByAppendingPathComponent(fileName);
}

function getTempFilesBaseDirectory(logErrors) {
  let applicationSupportDirectory;

  try {
    applicationSupportDirectory = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, true);
  } catch (e) {
    if (logErrors) {
      // eslint-disable-next-line no-undef
      logMessage('info', { message: 'call to NSSearchPathForDirectoriesInDomains failed, falling back to the temp directory', error: e.toString()});
    }
    return LEGACY_CACHE_PATH;
  }

  // We don't expect this scenario to ever happen, but adding a fallback just in case..
  if (applicationSupportDirectory.length === 0) {
    if (logErrors) {
      // eslint-disable-next-line no-undef
      logMessage('info', { message: 'could not find the application support folder, falling back to the temp directory'});
    }
    return LEGACY_CACHE_PATH;
  }

  // Taking the Sketch folder name, while making sure we don't get the beta specific folder
  // (The released version uses folder 'com.bohemiancoding.sketch3' while beta uses: 'com.bohemiancoding.sketch3.beta')
  const sketchFolderName = NSBundle.mainBundle().bundleIdentifier().replace(/.beta$/, '');

  const cacheDirectoryPath = sketchFolderName + '/DSM/Cache';

  return applicationSupportDirectory[0].stringByAppendingPathComponent(cacheDirectoryPath);
}

function getDefaultsKey(name) {
  return 'com.invision.dsm.' + name;
}

function dataURLFromData(data, type) {
  return NSString.stringWithFormat(
    'data:%@;base64,%@',
    type,
    data.base64EncodedStringWithOptions(0)
  );
}

function mimeTypeForExt(extension) {
  switch(extension) {
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'eps':
    case 'ai':
      return 'application/postscript';
    default:
      return 'application/x-skla';
  }
}

function defer(func) {
  coscript.scheduleWithInterval_jsFunction(0, func);
}

function createCocoaObject(methods, superclass) {
  var uniqueClassName = 'com.invision.dsm_dynamic_class_' + NSUUID.UUID().UUIDString();
  var classDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(uniqueClassName, superclass || NSObject);
  classDesc.registerClass();
  for (var selectorString in methods) {
    var selector = NSSelectorFromString(selectorString);
    classDesc.addInstanceMethodWithSelector_function(selector, methods[selectorString]);
  }
  return NSClassFromString(uniqueClassName).new();
}

// Get all symbols master for specific document.
function getSymbolsMastersByID(document) {
  const symbols = document.documentData().allSymbols();
  return $.mapObject(symbols, function(symbol) {
    return [symbol.symbolID(), symbol];
  });
}

function applyTintToTemplateImage(image, color) {
  if (!image.isTemplate()) {
    return image;
  }

  const size = image.size();
  const bounds = NSMakeRect(0, 0, size.width, size.height);

  const imageCopy = image.copy();
  imageCopy.lockFocus();
  color.set();
  NSRectFillUsingOperation(bounds, NSCompositeSourceAtop);
  imageCopy.unlockFocus();

  imageCopy.setTemplate(false);

  return imageCopy;
}

function sortObjectArrayByStringKey(array, key) {
  return array.sort((item1, item2) => {
    return (item1[key] || '').localeCompare(item2[key]);
  });
}

function getDocumentUserInfoForDSM(context, key, document) {
  const IDENTIFIER = context.command.pluginBundle().identifier();
  const currentDocument = document || MSDocument.currentDocument();
  const dsmIdentifierUserInfo = currentDocument && ((currentDocument.documentData().userInfo() || {})[IDENTIFIER] || {});
  const obj = dsmIdentifierUserInfo[key] || {};
  return NSMutableDictionary.dictionaryWithDictionary(obj);
}

function updateDocumentUserInfoForDSM(context, key, data, document) {
  const IDENTIFIER = context.command.pluginBundle().identifier();
  const currentDocument = document || MSDocument.currentDocument();
  context.command.setValue_forKey_onDocument_forPluginIdentifier(data, key, currentDocument.documentData(), IDENTIFIER);
}

function getLayerUserInfoForDSM(context, key, layer) {
  const IDENTIFIER = context.command.pluginBundle().identifier();
  const command = context.command;
  return command.valueForKey_onLayer_forPluginIdentifier(key, layer, IDENTIFIER) || {};
}

function updateLayerUserInfoForDSM(context, key, data, layer) {
  const IDENTIFIER = context.command.pluginBundle().identifier();
  const command = context.command;
  command.setValue_forKey_onLayer_forPluginIdentifier(data, key, layer, IDENTIFIER);
}

function getDSMEnvironemntVariables() {
  const env = NSProcessInfo.processInfo().environment();
  return {
    PUSHER_APP_KEY: env.PUSHER_APP_KEY,
    LAUNCHDARKLY_API_KEY: env.LAUNCHDARKLY_API_KEY,
    ENV_BASE_URL: env.ENV_BASE_URL,
    CRAFT_SYNC_AUTH_API_URL: env.CRAFT_SYNC_AUTH_API_URL
  };
}

exports.debug = debug;
exports.getTempFilePath = getTempFilePath;
exports.getDefaultsKey = getDefaultsKey;
exports.dataURLFromData = dataURLFromData;
exports.mimeTypeForExt = mimeTypeForExt;
exports.defer = defer;
exports.createCocoaObject = createCocoaObject;
exports.getSymbolsMastersByID = getSymbolsMastersByID;
exports.applyTintToTemplateImage = applyTintToTemplateImage;
exports.sortObjectArrayByStringKey = sortObjectArrayByStringKey;
exports.getDocumentUserInfoForDSM = getDocumentUserInfoForDSM;
exports.updateDocumentUserInfoForDSM = updateDocumentUserInfoForDSM;
exports.getLayerUserInfoForDSM = getLayerUserInfoForDSM;
exports.updateLayerUserInfoForDSM = updateLayerUserInfoForDSM;
exports.getDSMEnvironemntVariables = getDSMEnvironemntVariables;
