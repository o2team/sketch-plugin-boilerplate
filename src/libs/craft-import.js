/* global NSData NSFileManager NSString NSUTF8StringEncoding MOPointer NSImage MSColor MSPluginManager NSURL NSSelectorFromString */

const $ = require('./collection-helpers');
const util = require('./util');
const archive = require('./archive');
const layerExport = require('./layer-export');
const coerceJS = require('./coerce').coerceJS;
const typeStyles = require('./type-styles');
const fonts = require('./fonts');
const colors = require('./colors');

const transparentPNGData = NSData.dataWithContentsOfURL(
  NSURL.URLWithString(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQ' + 'AAAC1HAwCAAAAC0lEQVQIHWNgYAAAAAMAAU9ICq8AAAAASUVORK5CYII='
  )
);
const transparentPNGImg = NSImage.alloc().initWithData(transparentPNGData);

function listOfLibraries() {
  const craftLibrarySettingsPath = MSPluginManager.mainPluginsFolderURL()
    .URLByDeletingLastPathComponent() // Remove 'Plugins'
    .URLByAppendingPathComponent('Panels/.settings/com.invisionlabs.library');

  const craftLibrarySettingsString = NSString.stringWithContentsOfFile_encoding_error(
    craftLibrarySettingsPath,
    NSUTF8StringEncoding,
    null
  );
  const craftLibrarySettings = JSON.parse(craftLibrarySettingsString);

  return craftLibrarySettings.history;
}

function readLibrary(libraryURL, onStartCallback, onProgressCallback) {
  const structure = readStructure(libraryURL);

  if (onStartCallback) {
    onStartCallback(structure.itemCount);
  }

  const components = readComponents(libraryURL, structure, onProgressCallback);
  const type = readTypeStyles(libraryURL, onProgressCallback);
  const colors = readColors(libraryURL, structure, onProgressCallback);

  const importProblems = components.importProblems; // TODO concat the others here too!

  return {
    importProblems: importProblems,
    library: {
      name: structure.name,
      componentGroups: components.groups,
      sketchSymbols: components.symbols,
      colorGroups: colors,
      typeStyles: type.typeStyles,
      fontVariants: type.fontVariants
    }
  };
}

function readComponents(libraryURL, structure, onProgressCallback) {
  var resultGroups = [];
  const resultSymbols = [];

  const importedGroupsByCraftCategoryId = {};
  structure.categories.forEach(function(category) {
    if (category.type === 'layer') {
      const componentGroup = {
        name: category.name,
        components: [],
        _sortLevel1: category.index // Index within the library.
      };

      importedGroupsByCraftCategoryId[category.id] = componentGroup;
      resultGroups.push(componentGroup);
    }
  });

  const files = listFilesInDirectory(libraryURL);

  const usedSymbolsByID = {};
  const importProblems = [];

  // Read layers.
  $.forEach(files, function(file) {
    if (file.hasSuffix('.layer')) {
      try {
        const containerURL = libraryURL.URLByAppendingPathComponent(file);

        const symbolID = idFromFileName(file);

        var itemDesc = 'Layer with ID ' + symbolID;
        const layerMeta = readMeta(containerURL, libraryURL, itemDesc);
        itemDesc = 'Layer “' + layerMeta.name + '”';
        const previewData = readData(containerURL.URLByAppendingPathComponent('preview.png'), libraryURL, itemDesc);

        const previewImg = NSImage.alloc().initWithData(previewData);
        if (!previewImg) {
          throw new CraftLibReadError('Couldn’t read thumbnail image', {
            itemDesc: itemDesc,
            libraryPath: libraryURL.path(),
            filePath: file
          });
        }

        const symbolURL = structure.symbolURLsByID[symbolID];
        if (!symbolURL) {
          throw new CraftLibReadError('Couldn’t import symbol with ID ' + symbolID + ' because it is missing from the library', {
            itemDesc: 'Layer “' + layerMeta.name + '”',
            libraryPath: libraryURL.path(),
            filePath: file
          });
        }

        // TODO: Throw an error if reading file or unarchiving fails!
        const symbolData = NSData.dataWithContentsOfURL(symbolURL);
        const symbol = archive.sketchObjectFromArchiveData(symbolData);

        // Keep track of which symbols are actually used by layers.
        layerMeta.symbols.forEach(function(symbolID) {
          usedSymbolsByID[symbolID] = usedSymbolsByID[symbolID] || [];
          usedSymbolsByID[symbolID].push(itemDesc);
        });

        const instance = symbol.newMutableCounterpart().newSymbolInstance();
        const instanceArchiveData = archive.archiveDataFromSketchObject(instance);

        const group = structure.groupsById[layerMeta.parentId];
        const category = group // Category is…
          ? structure.categoriesById[group.parentId] // …the group’s parent, if there is a group,
          : structure.categoriesById[layerMeta.parentId]; // …or the layer’s parent, if there is not.

        importedGroupsByCraftCategoryId[category.id].components.push(
          coerceJS({
            id: instance.objectID(),
            name: layerMeta.name,
            symbolID: symbolID,
            width: previewImg.size().width,
            height: previewImg.size().height,
            entityType: 'components',
            exportedData: [
              {
                id: instance.objectID(),
                format: 'skla',
                dataURL: util.dataURLFromData(instanceArchiveData, 'application/x-skla'),
                uploadFileName: layerExport.getUploadFileName(instance, {
                  format: 'skla'
                }),
                exportOptionsKey: 'formatsToUpload',
                byteLength: instanceArchiveData.length(),
                width: instance.frame().width(),
                height: instance.frame().height()
              },
              {
                id: instance.objectID(),
                format: 'png',
                dataURL: util.dataURLFromData(previewData, 'image/png'),
                uploadFileName: layerExport.getUploadFileName(instance, {
                  format: 'png'
                }),
                exportOptionsKey: 'formatsToUpload',
                byteLength: previewData.length(),
                width: previewImg.size().width,
                height: previewImg.size().height
              }
            ],
            _sortLevel1: group ? group.index : layerMeta.index, // Index within category.
            _sortLevel2: group ? layerMeta.index : 0 // Index within group.
          })
        );
      } catch (err) {
        if (err instanceof CraftLibReadError) {
          importProblems.push(err);
        } else {
          throw err;
        }
      }

      if (onProgressCallback) {
        onProgressCallback();
      }
    }
  });

  // Read symbols.
  const symbolIDs = Object.keys(usedSymbolsByID);
  symbolIDs.forEach(function(symbolID) {
    // TODO: make a function out of this along with the above use that looks the same and memoize it?
    try {
      const symbolURL = structure.symbolURLsByID[symbolID];
      // TODO: Get the list of all the layers that use this id?
      const dependencies = usedSymbolsByID[symbolID];
      const itemDesc = dependencies.join(', ');
      if (!symbolURL) {
        throw new CraftLibReadError('Couldn’t import symbol with ID ' + symbolID + ' because it is missing from the library', {
          itemDesc: itemDesc,
          libraryPath: libraryURL.path()
        });
      }
      const symbolData = readData(symbolURL, libraryURL, itemDesc);
      const symbol = archive.sketchObjectFromArchiveData(symbolData);

      resultSymbols.push(
        coerceJS({
          id: symbol.objectID(),
          name: symbol.name(),
          symbolID: symbolID,
          isSymbolMasterDependency: true,
          exportedData: [
            {
              id: symbol.objectID(),
              format: 'skla',
              dataURL: util.dataURLFromData(symbolData, 'application/x-skla'),
              uploadFileName: layerExport.getUploadFileName(symbol, {
                isSymbolMasterDependency: true,
                format: 'skla'
              }),
              exportOptionsKey: 'formatsToUpload',
              byteLength: symbolData.length(),
              width: symbol.frame().width(),
              height: symbol.frame().height()
            },
            {
              id: symbol.objectID(),
              format: 'png',
              dataURL: util.dataURLFromData(transparentPNGData, 'image/png'),
              uploadFileName: layerExport.getUploadFileName(symbol, {
                isSymbolMasterDependency: true,
                format: 'png'
              }),
              exportOptionsKey: 'formatsToUpload',
              byteLength: transparentPNGData.length(),
              width: transparentPNGImg.size().width,
              height: transparentPNGImg.size().height
            }
          ]
        })
      );
    } catch (err) {
      if (err instanceof CraftLibReadError) {
        importProblems.push(err);
      } else {
        throw err;
      }
    }
  });

  // Remove empty group.
  resultGroups = resultGroups.filter(function(group) {
    if (group.components.length === 0) {
      importProblems.push(
        new CraftLibReadError('Category or group is empty and will not be imported', {
          itemDesc: 'Category or group “' + group.name + '”',
          libraryPath: libraryURL.path()
        })
      );
      return false;
    } else {
      return true;
    }
  });

  // Sort the group.
  sortItems(resultGroups);

  // Sort the layers in each group.
  resultGroups.forEach(function(group) {
    sortItems(group.components);
  });

  return {
    importProblems: importProblems,
    groups: resultGroups,
    symbols: resultSymbols
  };
}

function readTypeStyles(libraryURL, onProgressCallback) {
  const files = listFilesInDirectory(libraryURL);

  const resultTypeStyles = [];

  $.forEach(files, function(file) {
    if (file.hasSuffix('.textstyle')) {
      const containerURL = libraryURL.URLByAppendingPathComponent(file);
      const textStyleMeta = readMeta(containerURL, libraryURL);
      const itemDesc = 'Text style “' + textStyleMeta.name + '”';
      const textStyleData = readData(containerURL.URLByAppendingPathComponent('data'), libraryURL, itemDesc);
      const immutableSharedStyle = archive.sketchObjectFromArchiveData(textStyleData);
      if (!immutableSharedStyle) {
        throw new CraftLibReadError('Text style data did not unarchive correctly', {
          itemDesc: itemDesc,
          libraryPath: libraryURL.path(),
          filePath: file
        });
      }
      const typeStyle = typeStyles.brandAITypeStyleFromSketchSharedStyle(immutableSharedStyle.newMutableCounterpart());
      typeStyle.name = textStyleMeta.name;
      resultTypeStyles.push(typeStyle);
      if (onProgressCallback) {
        onProgressCallback();
      }
    }
  });

  const resultFontVariants = {};

  resultTypeStyles.forEach(function(typeStyle) {
    const family = typeStyle.fontFamily;
    if (!resultFontVariants[family]) {
      resultFontVariants[family] = fonts.fontVariantsInFontFamily(family);
    }
  });

  return {
    typeStyles: resultTypeStyles,
    fontVariants: resultFontVariants
  };
}

function readColors(libraryURL, structure, onProgressCallback) {
  const files = listFilesInDirectory(libraryURL);
  var importedGroups = [];

  const importedGroupsByCraftCategoryId = {};
  structure.categories.forEach(function(category) {
    if (category.type === 'color') {
      const colorGroup = {
        name: category.name,
        colors: [],
        _sortLevel1: category.index // Index within library.
      };

      importedGroupsByCraftCategoryId[category.id] = colorGroup;
      importedGroups.push(colorGroup);
    }
  });

  $.forEach(files, function(file) {
    if (file.hasSuffix('.color')) {
      const colorURL = libraryURL.URLByAppendingPathComponent(file);
      const colorMeta = readMeta(colorURL, libraryURL);
      const color = MSColor.colorWithRed_green_blue_alpha(
        colorMeta.color.r,
        colorMeta.color.g,
        colorMeta.color.b,
        colorMeta.color.a
      );
      const group = structure.groupsById[colorMeta.parentId];
      const category = group // Category is…
        ? structure.categoriesById[group.parentId] // …the group’s parent, if there is a group,
        : structure.categoriesById[colorMeta.parentId]; // …or the layer’s parent, if there is not.

      importedGroupsByCraftCategoryId[category.id].colors.push({
        name: colorMeta.name,
        value: colors.stringFromMSColor(color),
        _sortLevel1: group ? group.index : colorMeta.index, // Index within category.
        _sortLevel2: group ? colorMeta.index : 0 // Index within group.
      });
      if (onProgressCallback) {
        onProgressCallback();
      }
    }
  });

  // Don’t report empty color groups to the user, just silently remove them.
  // There are empty color, text, and symbol sections by default, but this one
  // is more commonly left empty and more reliable to import correctly. So if
  // there is an empty group here don’t bother to show the user an error.
  importedGroups = importedGroups.filter(function(group) {
    return group.colors.length > 0;
  });

  // Sort the groups.
  sortItems(importedGroups);

  // Sort the colors in each groups.
  importedGroups.forEach(function(group) {
    sortItems(group.colors);
  });

  return importedGroups;
}

// Sort array of objects with _sortLevelX attrs, then
// remove the _sortLevelX attrs. Sorts the array in place.
function sortItems(items) {
  items.sort(function(a, b) {
    const aLevel1 = a._sortLevel1 || 0;
    const aLevel2 = a._sortLevel2 || 0;
    const bLevel1 = b._sortLevel1 || 0;
    const bLevel2 = b._sortLevel2 || 0;
    return (aLevel1 - bLevel1) * 1000000 + (aLevel2 - bLevel2);
  });
  items.forEach(function(item) {
    delete item._sortLevel1;
    delete item._sortLevel2;
  });
}

function readMeta(containerURL, libraryURL, itemDesc) {
  const metaPath = containerURL.URLByAppendingPathComponent('metadata.json').path();
  const metaReadErrPtr = MOPointer.new();
  const metaString = NSString.stringWithContentsOfFile_encoding_error(metaPath, NSUTF8StringEncoding, metaReadErrPtr);
  if (metaReadErrPtr.value()) {
    throw new CraftLibReadError('Couldn’t read metadata', {
      itemDesc: itemDesc,
      libraryPath: libraryURL.path(),
      filePath: metaPath,
      triggeringError: metaReadErrPtr.value()
    });
  }
  var metaData;
  try {
    metaData = JSON.parse(metaString);
  } catch (err) {
    throw new CraftLibReadError('Invalid JSON metadata', {
      itemDesc: itemDesc,
      libraryPath: libraryURL.path(),
      filePath: metaPath,
      triggeringError: err
    });
  }
  metaData.id = containerURL
    .lastPathComponent()
    .stringByDeletingPathExtension()
    .toLowerCase();

  return metaData;
}

function readData(fileURL, libraryURL, itemDesc) {
  const readErrPtr = MOPointer.new();
  const data = NSData.dataWithContentsOfURL_options_error(fileURL, 0, readErrPtr);
  if (readErrPtr.value()) {
    throw new CraftLibReadError('Couldn’t read data file', {
      itemDesc: itemDesc,
      libraryPath: libraryURL.path(),
      filePath: fileURL.path(),
      triggeringError: readErrPtr.value()
    });
  }
  return data;
}

function readStructure(libraryURL) {
  const structure = readMeta(libraryURL, libraryURL, 'The Library');

  // Index groups by id.
  structure.groupsById = {};
  (structure.groups || []).forEach(function(group) {
    structure.groupsById[group.id] = group;
  });

  // Index categories by id.
  structure.categoriesById = {};
  structure.categories.forEach(function(category) {
    structure.categoriesById[category.id] = category;
  });

  // Index symbols by id.
  structure.symbolURLsByID = {};

  // Note: It’s okay if the symbols directory is not
  // present. Some libraries contain no symbols.
  const symbolsURL = libraryURL.URLByAppendingPathComponent('symbols');
  const symbolFiles = listFilesInDirectory(symbolsURL);

  if (symbolFiles) {
    $.forEach(symbolFiles, function(file) {
      if (file.hasSuffix('.symbol')) {
        const url = symbolsURL.URLByAppendingPathComponent(file);
        structure.symbolURLsByID[idFromFileName(file)] = url;
      }
    });
  }

  // Count how many non-symbol items there are to import.
  structure.itemCount = 0;

  const errReadingContentsPtr = MOPointer.new();
  const filesInLibrary = listFilesInDirectory(libraryURL);
  if (errReadingContentsPtr.value()) {
    throw new CraftLibReadError('Error reading contents of library', libraryURL, null, errReadingContentsPtr.value());
  }
  $.forEach(filesInLibrary, function(file) {
    if (file.hasSuffix('.layer') || file.hasSuffix('.color') || file.hasSuffix('.textstyle')) {
      structure.itemCount += 1;
    }
  });

  return structure;
}

function listFilesInDirectory(url) {
  // Sorting the files because apparently depending on your version of macOS (or
  // some other variable?) you can get a different order. The order probably
  // doesn’t matter but it was failing tests and we might as well be consistent.
  const directoryList = NSFileManager.defaultManager().contentsOfDirectoryAtPath_error(url.path(), null);

  if (directoryList) {
    return directoryList.sortedArrayUsingSelector(NSSelectorFromString('localizedCaseInsensitiveCompare:'));
  }
}

function idFromFileName(fileName) {
  return /[0-9A-Z-]+/.exec(fileName.split('.')[0])[0];
}

/**
 * Custom error for problems while reading a Craft Library
 * @param {string} message - Human readable reason for error.
 * @param {object} info - Additional structured info about error.
 * @param {string|NSString} info.libraryURL - The URL of the library being imported.
 * @param {string|NSString} info.itemDesc - Identifying information about the item (e.g. "Layer “Star”") that was being processed when the error occurred.
 * @param {string|NSString} [info.filePath] - Path to the specific file where the problem was, if any.
 * @param {NSError} [info.triggeringError] - The root cause error, if any.
 */
function CraftLibReadError(message, info) {
  const instance = new Error(message);
  instance.libraryPath = info.libraryPath;
  instance.filePath = info.filePath;
  instance.itemDesc = info.itemDesc;
  if (info.triggeringError) {
    if (info.triggeringError.localizedDescription) {
      instance.triggeringError = info.triggeringError.localizedDescription();
    } else {
      instance.triggeringError = info.triggeringError.message;
    }
  }
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  return instance;
}

CraftLibReadError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

CraftLibReadError.prototype.toString = function() {
  var str = 'Craft Library Read Error: ' + this.message + '\n  Library: ' + this.libraryPath;

  if (this.itemDesc) {
    str += '\n  File: ' + this.itemDesc;
  }

  if (this.filePath) {
    str += '\n  File: ' + this.filePath;
  }

  if (this.triggeringError) {
    str += '\n  Triggering Error: ' + this.triggeringError;
  }

  return str;
};

CraftLibReadError.prototype.toUIString = function() {
  var context;

  if (this.itemDesc) {
    // First choice is to use the item description for the context.
    context = this.itemDesc;
  } else if (this.filePath) {
    // If there is a file path, use the file name as the context.
    context = NSString.stringWithString(this.filePath).lastPathComponent();
  } else {
    // Last resort.
    context = 'Unknown item';
  }

  return context + ': ' + this.message;
};

Object.setPrototypeOf(CraftLibReadError, Error);

exports.listOfLibraries = listOfLibraries;
exports.readLibrary = readLibrary;
exports.CraftLibReadError = CraftLibReadError;

// eslint-disable-next-line no-undef
if (typeof EXPORT_FOR_TESTS !== 'undefined' && EXPORT_FOR_TESTS) {
  exports.readStructure = readStructure;
}
