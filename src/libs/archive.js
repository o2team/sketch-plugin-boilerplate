/*
  Sketch 对象数据存档相关的方法
  Archive Data 是 Sketch 用于存储的元数据
  globals
  MSImmutableLayer
  MSJSONDataArchiver
  MSJSONDataUnarchiver
  MSKeyedUnarchiver
  NSData
  NSString
  NSUTF8StringEncoding
*/
const SKETCH_47_JSON_FORMAT_VERSION = 95;


/**
 * Sketch Object to ArchiveData
 * @param object Sketch 对象
 */
function archiveDataFromSketchObject(object) {
  const immutableObject = object.immutableModelObject();
  const archiver = MSJSONDataArchiver.new();
  archiver.setArchiveObjectIDs(true);
  const archiveData = archiver.archivedDataWithRootObject_error(immutableObject, null);

  return wrapArchiveDataInHeader(archiveData);
}


/**
 * ArchiveData to Sketch Object
 * @param archiveData 元数据
 */
function sketchObjectFromArchiveData(archiveData) {
  if (archiveData && archiveData.class().isSubclassOfClass(NSData)) {
    const jsonString = stringFromData(archiveData);

    // The default format version to use is the one exported
    // by Sketch 47. This is the last version for which we
    // did not store the format version so we would know
    // what to use when unarchiving. This is not exact
    // because of course customers do not always upgrade at
    // the same time, but because of backwards compatibility
    // going back several format versions, it is fine.
    var formatVersion = SKETCH_47_JSON_FORMAT_VERSION;

    var jsData;
    try {
      jsData = JSON.parse(jsonString);
    } catch (err) {
      jsData = null; // No-op.
    }

    if (!jsData) {
      // Format is not JSON, use the keyed unarchiver.
      const unarchivedObject = MSKeyedUnarchiver.unarchiveObjectWithData_asVersion_corruptionDetected_error(
        archiveData,
        formatVersion,
        null,
        null
      );

      // Some data created by Craft Library can have archive headers even when
      // using the keyed archiver. Even though not created by DSM, it can end
      // up in a library via Craft import.
      if (unarchivedObject.class() == 'MSArchiveHeader') {
        return unarchivedObject.root();
      } else {
        return unarchivedObject;
      }
    }

    if (jsData._class === 'MSArchiveHeader') {
      // If there is a wrapping header, take the format
      // version from it.
      formatVersion = jsData.version;

      // Also unwrap the archive data from the header
      // because the header throws Sketch off even though it
      // contains the correct version information.
      jsData = jsData.root;
    }

    return sketchObjectFromArchiveJSONUsingFormatVersion(
      JSON.stringify(jsData),
      formatVersion
    );

  } else {
    // Object has already been unarchived.
    return archiveData;
  }
}


/**
 * 封装元数据
 * @param archiveData NSData
 */
function wrapArchiveDataInHeader(archiveData) {
  const archiveJSONString = stringFromData(archiveData);
  const archiveJSData = JSON.parse(archiveJSONString);

  const headerJSData = createArchiveHeaderJSData();
  headerJSData.root = archiveJSData;

  const archiveWithHeaderJSONString = JSON.stringify(headerJSData);
  return dataFromString(archiveWithHeaderJSONString);
}


/**
 * 创建 JS Data 类型的数据
 * @returns NSData
 */
function createArchiveHeaderJSData() {
  // Creating a header directly with MSArchiveHeader.new()
  // results in a header with no properties --- not what we
  // want. Instead, export a stub object and use the header
  // from that.
  const object = MSImmutableLayer.new();
  const archiveWithHeaderData = MSJSONDataArchiver.archivedDataWithHeaderAndRootObject(object);
  const archiveWithHeaderJSONString = stringFromData(archiveWithHeaderData);
  const archiveWithHeaderJSData = JSON.parse(archiveWithHeaderJSONString);
  delete archiveWithHeaderJSData.root;
  return archiveWithHeaderJSData;
}


/**
 * 解档元数据 Unarchive with a known version of the JSON format.
 * @param jsonStr JSON字符串数据
 * @param formatVersion Sketch版本号
 */
function sketchObjectFromArchiveJSONUsingFormatVersion(jsonString, formatVersion) {
  return MSJSONDataUnarchiver.unarchiveObjectWithString_asVersion_corruptionDetected_error(
    jsonString,
    formatVersion,
    null,
    null
  );
}

/**
 * 将原生对象序列化为 String
 * @param data 原生对象
 */
function stringFromData(data) {
  return NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding);
}


/**
 * 将 String 转为原生的 NSString 对象
 * @param str 对象字符串
 */
function dataFromString(string) {
  return NSString.stringWithString(string).dataUsingEncoding(NSUTF8StringEncoding);
}


function mutableSketchObject (immutableSketchObject) {
  if (immutableSketchObject && immutableSketchObject.class) {
    const immutableClass = immutableSketchObject.class()
    if (immutableClass.mutableClass) {
      const mutableClass = immutableClass.mutableClass()
      return mutableClass.new().initWithImmutableModelObject(immutableSketchObject)
    }
  }
}


module.exports = {
  archiveDataFromSketchObject: archiveDataFromSketchObject,
  sketchObjectFromArchiveData: sketchObjectFromArchiveData
};
