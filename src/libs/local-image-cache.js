/* global NSURL NSFileManager NSData NSUserDefaults */

const util = require('./util');
const debug = util.debug;

const LOCAL_CACHE_STATUSES = {
  NEW: 'Local image cache directory created',
  EMPTY: 'Local image cache exists but empty',
  POPULATED: 'Local image cache exists and populated with files'
};

/*
 Currently the path is taken only based on the file name. We assume the file name is unique because we upload an new copy each time with different random key
 */
function getImagePath(image, useLegacyCachePath) {
  if (!image.assetKey) {
    return null;
  }
  var path = image.assetKey;

  //find the part that is the name of the file within the url, without the directories on the way
  var lastSperator = path.lastIndexOf('/');
  path = path.substring(lastSperator + 1);

  //remove possible query params, like expiration
  path = path.split('?')[0];

  if (!path) {
    return null;
  }

  const filePath = getImageCachePath(useLegacyCachePath) + '/' + path;
  return filePath;
}

function getImageCachePath(useLegacyCachePath, logErrors) {
  return util.getTempFilePath('brand-ai-image-cache', null, true, useLegacyCachePath, logErrors);
}

function createImageCacheDirectory() {
  //prepare the image cache directory at temp path if it does not exist
  const defaultFileManager = NSFileManager.defaultManager();
  const imageFilesCachePath = getImageCachePath(false, true);
  const localImageCacheStatus = {};
  if (!defaultFileManager.fileExistsAtPath(imageFilesCachePath)) {
    debug('Created image cache directory: ' + imageFilesCachePath);
    localImageCacheStatus.status = LOCAL_CACHE_STATUSES.NEW;
    defaultFileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(imageFilesCachePath, true, null, null);
  } else {

    const imageFilesCachePathEnumerator = defaultFileManager.enumeratorAtPath(imageFilesCachePath);
    const firstFile = imageFilesCachePathEnumerator.nextObject();
    if (!firstFile) {
      localImageCacheStatus.status = LOCAL_CACHE_STATUSES.EMPTY;
      debug('Local image cache exist but empty');
    } else {
      localImageCacheStatus.status = LOCAL_CACHE_STATUSES.POPULATED;
    }
  }

  return localImageCacheStatus;
}

//defaults write com.bohemiancoding.sketch3 com.invision.dsm.localImageCacheDisabled 1

var isCahceDisabledDefaultsValue;
const userDefaultsKey = 'com.invision.dsm.localImageCacheDisabled';

function isCacheDisabled() {
  if (isCahceDisabledDefaultsValue == undefined) {
    isCahceDisabledDefaultsValue = NSUserDefaults.standardUserDefaults().boolForKey(userDefaultsKey) || false;
    debug('Is local image cache disabled: ' + isCahceDisabledDefaultsValue);
  }
  return isCahceDisabledDefaultsValue;
}

function writeDataToFile(payload) {
  if (isCacheDisabled()) {
    return;
  }

  var filePath = getImagePath(payload);
  var dataURL = payload.dataURL;
  if (!filePath || !dataURL) {
    debug('You must provide valid file data and the intended data to write: ');
    debug(payload);
    return;
  }

  var fileManager = NSFileManager.defaultManager();
  var url = NSURL.URLWithString(dataURL);
  var imageData = NSData.dataWithContentsOfURL(url);

  fileManager.createFileAtPath_contents_attributes(filePath, imageData, null);
}

function readDataFromFile(image) {
  //todo: decide if turn off this in read as well, for example if some data exist we could potentially use while not storing new data
  if (isCacheDisabled()) {
    return;
  }

  if (!image) {
    return;
  }

  var imagePath = getImagePath(image);
  var imageData = NSData.dataWithContentsOfFile(imagePath);
  if (!imageData) {

    // Check if we can find this image in the old cache directory, if we do, copy it to the new directory
    var legacyImagePath = getImagePath(image, true);
    imageData = NSData.dataWithContentsOfFile(legacyImagePath);

    if (!imageData) {
      return null;
    } else {
      var fileManager = NSFileManager.defaultManager();
      fileManager.createFileAtPath_contents_attributes(imagePath, imageData, null);
    }
  }

  const contentType = util.mimeTypeForExt(image.extension);
  return util.dataURLFromData(imageData, contentType);
}

module.exports = {
  createImageCacheDirectory: createImageCacheDirectory,
  readDataFromFile: readDataFromFile,
  writeDataToFile: writeDataToFile
};
