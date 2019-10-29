var globalThis = this;
var global = this;
function __skpm_run (key, context) {
  globalThis.context = context;
  try {

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/action.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/mocha-js-delegate/index.js":
/*!*************************************************!*\
  !*** ./node_modules/mocha-js-delegate/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* globals MOClassDescription, NSObject, NSSelectorFromString, NSClassFromString, MOPropertyDescription */

module.exports = function MochaDelegate(definition, superclass) {
  var uniqueClassName =
    'MochaJSDelegate_DynamicClass_' + NSUUID.UUID().UUIDString()

  var delegateClassDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(
    uniqueClassName,
    superclass || NSObject
  )

  // Storage
  var handlers = {}
  var ivars = {}

  // Define an instance method
  function setHandlerForSelector(selectorString, func) {
    var handlerHasBeenSet = selectorString in handlers
    var selector = NSSelectorFromString(selectorString)

    handlers[selectorString] = func

    /*
      For some reason, Mocha acts weird about arguments: https://github.com/logancollins/Mocha/issues/28
      We have to basically create a dynamic handler with a likewise dynamic number of predefined arguments.
    */
    if (!handlerHasBeenSet) {
      var args = []
      var regex = /:/g
      while (regex.exec(selectorString)) {
        args.push('arg' + args.length)
      }

      // eslint-disable-next-line no-eval
      var dynamicFunction = eval(
        '(function (' +
          args.join(', ') +
          ') { return handlers[selectorString].apply(this, arguments); })'
      )

      delegateClassDesc.addInstanceMethodWithSelector_function(
        selector,
        dynamicFunction
      )
    }
  }

  // define a property
  function setIvar(key, value) {
    var ivarHasBeenSet = key in handlers

    ivars[key] = value

    if (!ivarHasBeenSet) {
      delegateClassDesc.addInstanceVariableWithName_typeEncoding(key, '@')
      var description = MOPropertyDescription.new()
      description.name = key
      description.typeEncoding = '@'
      description.weak = true
      description.ivarName = key
      delegateClassDesc.addProperty(description)
    }
  }

  this.getClass = function() {
    return NSClassFromString(uniqueClassName)
  }

  this.getClassInstance = function(instanceVariables) {
    var instance = NSClassFromString(uniqueClassName).new()
    Object.keys(ivars).forEach(function(key) {
      instance[key] = ivars[key]
    })
    Object.keys(instanceVariables || {}).forEach(function(key) {
      instance[key] = instanceVariables[key]
    })
    return instance
  }
  // alias
  this.new = this.getClassInstance

  // Convenience
  if (typeof definition === 'object') {
    Object.keys(definition).forEach(
      function(key) {
        if (typeof definition[key] === 'function') {
          setHandlerForSelector(key, definition[key])
        } else {
          setIvar(key, definition[key])
        }
      }
    )
  }

  delegateClassDesc.registerClass()
}


/***/ }),

/***/ "./src/action.js":
/*!***********************!*\
  !*** ./src/action.js ***!
  \***********************/
/*! exports provided: onOpenDocument, onCloseDocument */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onOpenDocument", function() { return onOpenDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onCloseDocument", function() { return onCloseDocument; });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session */ "./src/session.js");
/* harmony import */ var _common_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/config */ "./src/common/config.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/utils/index.js");



var onOpenDocument = function onOpenDocument(context) {
  console.error('✅✅✅ action onOpenDocument');
  var isShow = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["getSettingForKey"])(_common_config__WEBPACK_IMPORTED_MODULE_1__["SidePanelIdentifier"]);
  console.error('✅✅✅ action isShow', isShow);

  if (isShow) {
    setTimeout(function () {
      var toggleSidePanelCommand = context.command.pluginBundle().commands()['sketch-plugin-boilerplate.my-command-identifier'];
      context.command = toggleSidePanelCommand;
      AppController.sharedInstance().runPluginCommand_fromMenu_context(toggleSidePanelCommand, false, context);
    }, 100);
  }
};
var onCloseDocument = function onCloseDocument() {
  console.error('✅✅✅action', 'onCloseDocument');
  COScript.currentCOScript().setShouldKeepAround(false);
};

/***/ }),

/***/ "./src/common/config.js":
/*!******************************!*\
  !*** ./src/common/config.js ***!
  \******************************/
/*! exports provided: IdentifierPrefix, SidePanelIdentifier, WINDOW_MOVE_INSTANCE, WINDOW_MOVE_SELECTOR, Menus */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IdentifierPrefix", function() { return IdentifierPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidePanelIdentifier", function() { return SidePanelIdentifier; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WINDOW_MOVE_INSTANCE", function() { return WINDOW_MOVE_INSTANCE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WINDOW_MOVE_SELECTOR", function() { return WINDOW_MOVE_SELECTOR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Menus", function() { return Menus; });
var IdentifierPrefix = 'sketch-plugin-boilerplate';
var SidePanelIdentifier = "".concat(IdentifierPrefix, ".side-panel-identifier");
var WINDOW_MOVE_INSTANCE = 'WINDOW_MOVE_INSTANCE';
var WINDOW_MOVE_SELECTOR = 'WINDOW_MOVE_SELECTOR';
var Menus = [{
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'artboard',
  activeIcon: 'artboard-active',
  tooltip: '上传画板',
  identifier: "".concat(IdentifierPrefix, "-menu.artboard-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.artboard-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 1,
  url: 'https://aotu.io'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'icon',
  activeIcon: 'icon-active',
  tooltip: '图标',
  identifier: "".concat(IdentifierPrefix, "-menu.icon-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.icon-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 1,
  url: 'https://docs.pfan123.com/'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'component',
  activeIcon: 'component-active',
  tooltip: '组件',
  identifier: "".concat(IdentifierPrefix, "-menu.component-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.component-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 1,
  url: 'http://m.baidu.com/'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'palette',
  activeIcon: 'palette-active',
  tooltip: '调色板',
  identifier: "".concat(IdentifierPrefix, "-menu.palette-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.palette-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 1,
  url: 'http://m.baidu.com/'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'fill',
  activeIcon: 'fill-active',
  tooltip: '填充',
  identifier: "".concat(IdentifierPrefix, "-menu.fill-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.fill-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 1,
  url: 'http://m.baidu.com/'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'help',
  activeIcon: 'help-active',
  tooltip: '帮助中心',
  identifier: "".concat(IdentifierPrefix, "-menu.help-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.help-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 3,
  url: 'http://m.baidu.com/'
}, {
  rect: NSMakeRect(0, 0, 40, 40),
  size: NSMakeSize(24, 24),
  icon: 'setting',
  activeIcon: 'setting-active',
  tooltip: '设置',
  identifier: "".concat(IdentifierPrefix, "-menu.setting-").concat(NSUUID.UUID().UUIDString()),
  wkIdentifier: "".concat(IdentifierPrefix, "-webview.setting-").concat(NSUUID.UUID().UUIDString()),
  type: 2,
  inGravityType: 3,
  url: 'http://m.baidu.com/'
}];

/***/ }),

/***/ "./src/session.js":
/*!************************!*\
  !*** ./src/session.js ***!
  \************************/
/*! exports provided: context, document, version, sketchVersion, pluginFolderPath, resourcesPath, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "context", function() { return context; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "document", function() { return document; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sketchVersion", function() { return sketchVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluginFolderPath", function() { return pluginFolderPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resourcesPath", function() { return resourcesPath; });
var context;
var document;
var version;
var sketchVersion;
var pluginFolderPath;
var resourcesPath;

function getPluginFolderPath(context) {
  // Get absolute folder path of plugin
  var split = context.scriptPath.split('/');
  split.splice(-3, 3);
  return split.join('/');
}

/* harmony default export */ __webpack_exports__["default"] = (function (ctx) {
  context = ctx;
  document = context.document || MSDocument.currentDocument(); // eslint-disable-next-line no-new-wrappers

  version = new String(context.plugin.version()).toString(); // eslint-disable-next-line no-new-wrappers

  sketchVersion = new String(context.api().version).toString();
  pluginFolderPath = getPluginFolderPath(context);
  resourcesPath = "".concat(pluginFolderPath, "/Contents/Resources");
});

/***/ }),

/***/ "./src/utils/element.js":
/*!******************************!*\
  !*** ./src/utils/element.js ***!
  \******************************/
/*! exports provided: getImageURL, createImage, createImageView, createBoxSeparator, addButton, createBounds, createPanel, createView, createBox, createTextField */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getImageURL", function() { return getImageURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createImage", function() { return createImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createImageView", function() { return createImageView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBoxSeparator", function() { return createBoxSeparator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addButton", function() { return addButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBounds", function() { return createBounds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createPanel", function() { return createPanel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createView", function() { return createView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBox", function() { return createBox; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTextField", function() { return createTextField; });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../session */ "./src/session.js");

/**
 * getImageURL 获取 icon 路径
 * @param {*} name
 */

var getImageURL = function getImageURL(name) {
  var isRetinaDisplay = NSScreen.mainScreen().backingScaleFactor() > 1;
  var suffix = isRetinaDisplay ? '@2x' : '';
  var pluginSketch = _session__WEBPACK_IMPORTED_MODULE_0__["context"].plugin.url();
  var imageURL = pluginSketch.URLByAppendingPathComponent('Contents').URLByAppendingPathComponent('Resources').URLByAppendingPathComponent('icons').URLByAppendingPathComponent("".concat(name + suffix, ".png"));
  return imageURL;
};
/**
 * createImage 创建 NSImage
 * @param {*} imageURL
 * @param {*} size
 */

var createImage = function createImage(imageURL, size) {
  // NSImage.alloc().initWithSize([width, height])
  var Image = NSImage.alloc().initWithContentsOfURL(imageURL);
  size && Image.setSize(size);
  Image.setScalesWhenResized(true);
  return Image;
};
/**
 * createImageView 创建 NSImageView
 * @param {*} rect
 * @param {*} icon
 * @param {*} size
 */

var createImageView = function createImageView(rect, icon, size) {
  var imageView = NSImageView.alloc().initWithFrame(rect);
  var imageURL = getImageURL(icon);
  var image = createImage(imageURL, size);
  imageView.setImage(image);
  imageView.setAutoresizingMask(5);
  return imageView;
};
/**
 * createImageView 创建 NSBoxSeparator
 */

var createBoxSeparator = function createBoxSeparator() {
  // set to 0 in width and height
  var separtorBox = NSBox.alloc().initWithFrame(NSZeroRect); // Specifies that the box is a separator

  separtorBox.setBoxType(2 || false);
  separtorBox.setBorderColor(NSColor.colorWithHex('#F5F5F5'));

  try {
    separtorBox.setBorderColor(NSColor.colorWithSRGBRed_green_blue_alpha(1.0, 1.0, 1.0, 1.0));
  } catch (error) {
    console.error(error);
  } // separtorBox.setTransparent(true)


  return separtorBox;
};
/**
 * addButton 创建 NSButton
 * @param {*} param { rect, size, icon, activeIcon, tooltip = '', type = 5, callAction }
 */

var addButton = function addButton(_ref) {
  var rect = _ref.rect,
      size = _ref.size,
      icon = _ref.icon,
      activeIcon = _ref.activeIcon,
      _ref$tooltip = _ref.tooltip,
      tooltip = _ref$tooltip === void 0 ? '' : _ref$tooltip,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? 5 : _ref$type,
      callAction = _ref.callAction;
  var button = rect ? NSButton.alloc().initWithFrame(rect) : NSButton.alloc().init();
  var imageURL = getImageURL(icon);
  var image = createImage(imageURL, size);
  button.setImage(image);

  if (activeIcon) {
    var activeImageURL = getImageURL(activeIcon);
    var activeImage = createImage(activeImageURL, size);
    button.setAlternateImage(activeImage);
  } else {
    button.setAlternateImage(image);
  }

  button.setBordered(false);
  button.sizeToFit();
  button.setToolTip(tooltip);
  button.setButtonType(type || NSMomentaryChangeButton);
  button.setCOSJSTargetFunction(callAction);
  button.setAction('callAction:');

  button.removeBadge = function () {
    button.setImage(image);
    button.hasBadge = false;
  };

  button.icon = icon;
  return button;
};
/**
 * 创建 bounds
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 */

var createBounds = function createBounds() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  return NSMakeRect(x, y, width, height);
};
/**
 * createView 创建 NSPanel
 * @param {*} frame  options
 */

var createPanel = function createPanel() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    width: 800,
    height: 600,
    minWidth: 0,
    minHeight: 0,
    x: 0,
    y: 0,
    title: 'panel',
    identifier: 'sketch-panel',
    vibrancy: true
  };
  COScript.currentCOScript().setShouldKeepAround(true);
  var threadDictionary = NSThread.mainThread().threadDictionary();
  var mainScreenRect = NSScreen.screens().firstObject().frame();
  var Bounds = NSMakeRect(options.x ? options.x : Math.round((NSWidth(mainScreenRect) - options.width) / 2), options.y ? NSHeight(mainScreenRect) - options.y : Math.round((NSHeight(mainScreenRect) - options.height) / 2), options.width, options.height);
  var panel = NSPanel.alloc().init();
  panel.setFrame_display(Bounds, true);
  panel.setOpaque(0);
  threadDictionary[options.identifier] = panel; // NSWindowStyleMaskDocModalWindow 直角

  panel.setStyleMask(NSWindowStyleMaskFullSizeContentView | NSBorderlessWindowMask | NSResizableWindowMask | NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask | NSWindowStyleMaskResizable);
  panel.setBackgroundColor(NSColor.whiteColor() || NSColor.windowBackgroundColor());
  panel.title = options.title;
  panel.movableByWindowBackground = true;
  panel.titlebarAppearsTransparent = true;
  panel.titleVisibility = NSWindowTitleHidden;
  panel.center();
  panel.makeKeyAndOrderFront(null);
  panel.setLevel(NSFloatingWindowLevel);
  panel.minSize = NSMakeSize(options.minWidth, options.minHeight);
  panel.standardWindowButton(NSWindowZoomButton).setHidden(true);
  panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
  panel.standardWindowButton(NSWindowCloseButton).setHidden(true); // Some third-party macOS utilities check the zoom button's enabled state to
  // determine whether to show custom UI on hover, so we disable it here to
  // prevent them from doing so in a frameless app window.

  panel.standardWindowButton(NSWindowZoomButton).setEnabled(false); // The fullscreen button should always be hidden for frameless window.

  if (panel.standardWindowButton(NSWindowFullScreenButton)) {
    panel.standardWindowButton(NSWindowFullScreenButton).setHidden(true);
  }

  panel.showsToolbarButton = false;
  panel.movableByWindowBackground = true;

  if (options.vibrancy) {
    // Create the blurred background
    var effectView = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, options.width, options.height));
    effectView.setMaterial(NSVisualEffectMaterialPopover);
    effectView.setAutoresizingMask(NSViewWidthSizable | NSViewHeightSizable);
    effectView.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight));
    effectView.setBlendingMode(NSVisualEffectBlendingModeBehindWindow); // Add it to the panel

    panel.contentView().addSubview(effectView);
  }

  var closeButton = panel.standardWindowButton(NSWindowCloseButton);
  closeButton.setCOSJSTargetFunction(function (sender) {
    log(sender);
    panel.close(); // Remove the reference to the panel

    threadDictionary.removeObjectForKey(options.identifier); // Stop this Long-running script

    COScript.currentCOScript().setShouldKeepAround(false);
  });
  return panel;
};
/**
 * createView 创建 NSView
 * @param {*} frame  NSMakeRect(0, 0, 40, 40)
 */

var createView = function createView(frame) {
  var view = NSView.alloc().initWithFrame(frame);
  view.setFlipped(1);
  return view;
};
/**
 * createBox 创建 NSBox
 * @param {*} frame  NSMakeRect(0, 0, 40, 40)
 */

var createBox = function createBox(frame) {
  var box = NSBox.alloc().initWithFrame(frame);
  box.setTitle('');
  return box;
};
/**
 * createBox 创建 createTextField
 * @param {*} string
 * @param {*} frame NSMakeRect(0, 0, 40, 40)
 */

var createTextField = function createTextField(string, frame) {
  var field = NSTextField.alloc().initWithFrame(frame);
  field.setStringValue(string);
  field.setFont(NSFont.systemFontOfSize(12));
  field.setTextColor(NSColor.colorWithCalibratedRed_green_blue_alpha(0, 0, 0, 0.7));
  field.setBezeled(0);
  field.setBackgroundColor(NSColor.windowBackgroundColor());
  field.setEditable(0);
  return field;
};

/***/ }),

/***/ "./src/utils/file.js":
/*!***************************!*\
  !*** ./src/utils/file.js ***!
  \***************************/
/*! exports provided: File */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "File", function() { return File; });
/**
 * File 文件操作
 * NSString.stringWithFormat('%@', content)
 */
var File = {
  fileManager: NSFileManager.defaultManager(),
  _stringify: function _stringify(jsonData, opt) {
    opt = opt ? 1 : 0;
    var nsJson = NSJSONSerialization.dataWithJSONObject_options_error_(jsonData, opt, nil);
    return NSString.alloc().initWithData_encoding(nsJson, 4);
  },
  writeFile: function writeFile(content, path) {
    content = NSString.stringWithFormat('%@', content);
    path = NSString.stringWithFormat('%@', path);
    return content.writeToFile_atomically_encoding_error_(path, !0, 4, nil);
  },
  copyFile: function copyFile(path, dist) {
    return this.fileManager.fileExistsAtPath(path) ? this.fileManager.copyItemAtPath_toPath_error(path, dist, nil) : nil;
  },
  mkDir: function mkDir(path) {
    return !this.fileManager.fileExistsAtPath(path) && this.fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error_(path, !0, nil, nil);
  },
  readJSON: function readJSON(path, opt) {
    var src = NSData.dataWithContentsOfFile(path);
    var options = !0 === opt ? 1 : 0;
    return NSJSONSerialization.JSONObjectWithData_options_error(src, options, nil);
  },
  size: function size(patch) {
    var size = 0;

    try {
      size = this.fileManager.attributesOfItemAtPath_error(patch, nil).NSFileSize;
    } catch (e) {
      size = 0;
    }

    return size;
  },
  renameFile: function renameFile(from, to) {
    this.fileManager.fileExistsAtPath(from) && this.fileManager.moveItemAtPath_toPath_error(from, to, null);
  },
  exist: function exist(path) {
    return !!this.fileManager.fileExistsAtPath(path);
  },
  readDir: function readDir(path) {
    return !!this.fileManager.fileExistsAtPath(path) && this.fileManager.contentsOfDirectoryAtPath_error_(path, nil);
  },
  removeDir: function removeDir(path) {
    this.fileManager.removeItemAtPath_error(path, null);
  },
  getTempDirPath: function getTempDirPath() {
    var URL = this.fileManager.URLsForDirectory_inDomains(13, 1).lastObject();
    var hash = Date.now() / 1e3;
    var nsString = NSString.stringWithFormat('%@', hash);
    return URL.URLByAppendingPathComponent(nsString).path();
  },
  mkTempDir: function mkTempDir(path) {
    var URL = this.getTempDirPath(path);
    return this.mkDir(URL) || URL;
  },

  /**
   * @param {String} image
   * @param {MSImageData} image
   */
  saveImage: function saveImage(path, image) {
    var tiffData = image.TIFFRepresentation();
    var p = NSBitmapImageRep.imageRepWithData(tiffData);
    var data = p.representationUsingType_properties(NSPNGFileType, null);
    data.writeToFile_atomically(path, !0);
  },
  jsonFilePaths: function jsonFilePaths(path) {
    var filename;
    var ds = this.fileManager.enumeratorAtPath(path);
    var paths = []; // eslint-disable-next-line no-cond-assign

    while (filename = ds.nextObject()) {
      if (filename.pathExtension() == 'json') {
        paths.push(filename);
      }
    }

    return paths;
  }
};

/***/ }),

/***/ "./src/utils/index.js":
/*!****************************!*\
  !*** ./src/utils/index.js ***!
  \****************************/
/*! exports provided: getImageURL, createImage, createImageView, createBoxSeparator, addButton, createBounds, createPanel, createView, createBox, createTextField, getSketchSelected, getSelected, getScriptExecPath, getDocumentPath, getDocumentName, dumpLayer, dumpSymbol, getNewUUID, getThreadDictForKey, setThreadDictForKey, removeThreadDictForKey, getSettingForKey, setSettingForKey, removeSettingForKey, showPluginsPane, showLibrariesPane, getSystemVersion, getPluginVersion, reloadPlugins, getFileContentFromModal, getSavePathFromModal, observerWindowResizeNotification, removeObserverWindowResizeNotification, File */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element */ "./src/utils/element.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getImageURL", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["getImageURL"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createImage", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createImage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createImageView", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createImageView"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createBoxSeparator", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createBoxSeparator"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "addButton", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["addButton"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createBounds", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createBounds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createPanel", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createPanel"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createView", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createView"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createBox", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createBox"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createTextField", function() { return _element__WEBPACK_IMPORTED_MODULE_0__["createTextField"]; });

/* harmony import */ var _selector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./selector */ "./src/utils/selector.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSketchSelected", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getSketchSelected"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSelected", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getSelected"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getScriptExecPath", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getScriptExecPath"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocumentPath", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getDocumentPath"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocumentName", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getDocumentName"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dumpLayer", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["dumpLayer"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dumpSymbol", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["dumpSymbol"]; });

/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system */ "./src/utils/system.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getNewUUID", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getNewUUID"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getThreadDictForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getThreadDictForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setThreadDictForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["setThreadDictForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "removeThreadDictForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["removeThreadDictForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSettingForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getSettingForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setSettingForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["setSettingForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "removeSettingForKey", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["removeSettingForKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "showPluginsPane", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["showPluginsPane"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "showLibrariesPane", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["showLibrariesPane"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSystemVersion", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getSystemVersion"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getPluginVersion", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getPluginVersion"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reloadPlugins", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["reloadPlugins"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getFileContentFromModal", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getFileContentFromModal"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSavePathFromModal", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["getSavePathFromModal"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "observerWindowResizeNotification", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["observerWindowResizeNotification"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "removeObserverWindowResizeNotification", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["removeObserverWindowResizeNotification"]; });

/* harmony import */ var _file__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./file */ "./src/utils/file.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "File", function() { return _file__WEBPACK_IMPORTED_MODULE_3__["File"]; });






/***/ }),

/***/ "./src/utils/selector.js":
/*!*******************************!*\
  !*** ./src/utils/selector.js ***!
  \*******************************/
/*! exports provided: getSketchSelected, getSelected, getScriptExecPath, getDocumentPath, getDocumentName, dumpLayer, dumpSymbol */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSketchSelected", function() { return getSketchSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSelected", function() { return getSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScriptExecPath", function() { return getScriptExecPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentPath", function() { return getDocumentPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentName", function() { return getDocumentName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpLayer", function() { return dumpLayer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpSymbol", function() { return dumpSymbol; });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../session */ "./src/session.js");
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! sketch */ "sketch");
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(sketch__WEBPACK_IMPORTED_MODULE_1__);


/**
 * getSketchSelected 获取当前选择的 document， page， selection
 */

var getSketchSelected = function getSketchSelected() {
  var Document = sketch__WEBPACK_IMPORTED_MODULE_1___default.a.Document;
  var document = Document.getSelectedDocument(); // 当前被选择的 document

  var page = document.selectedPage; // 当前被选择的 page

  var artboard = sketch__WEBPACK_IMPORTED_MODULE_1___default.a.Artboard.fromNative(page._object.currentArtboard());
  var selection = document.selectedLayers; // 当前选择图层

  return {
    document: document,
    page: page,
    artboard: artboard,
    selection: selection
  };
};
/**
 * getSelected 获取当前 document、page、artboard、selection
 */

var getSelected = function getSelected() {
  var document = _session__WEBPACK_IMPORTED_MODULE_0__["context"].document; // 获取 sketch 当前 document

  var plugin = _session__WEBPACK_IMPORTED_MODULE_0__["context"].plugin;
  var command = _session__WEBPACK_IMPORTED_MODULE_0__["context"].command;
  var page = document.currentPage(); // 当前被选择的 page

  var artboards = page.artboards(); // 所有的画板

  var selectedArtboard = page.currentArtboard(); // 当前被选择的画板

  var selection = _session__WEBPACK_IMPORTED_MODULE_0__["context"].selection; // 当前选择图层

  return {
    document: document,
    plugin: plugin,
    command: command,
    page: page,
    artboards: artboards,
    selectedArtboard: selectedArtboard,
    selection: selection
  };
};
/**
 * 获取当前脚本执行路径
 * @param {*} context
 */

var getScriptExecPath = function getScriptExecPath(context) {
  return context.scriptPath;
};
/**
 * getDocumentPath 获取所选择 document 路径
 */

var getDocumentPath = function getDocumentPath() {
  var Document = _session__WEBPACK_IMPORTED_MODULE_0__["context"].document;
  return Document.fileURL() ? Document.fileURL().path() : nil;
};
/**
 * getDocumentName 获取所选择 document name
 */

var getDocumentName = function getDocumentName() {
  return getDocumentPath(_session__WEBPACK_IMPORTED_MODULE_0__["context"]) ? getDocumentPath(_session__WEBPACK_IMPORTED_MODULE_0__["context"]).lastPathComponent() : nil;
};
/**
 * dumpLayer 导出json数据
 * @param {*} sketchObject  如 context.document.currentPage()
 */

var dumpLayer = function dumpLayer(sketchObject) {
  // return NSDictionary
  var jsonData = sketchObject.treeAsDictionary();
  var nsData = NSJSONSerialization.dataWithJSONObject_options_error_(jsonData, 0, nil);
  return NSString.alloc().initWithData_encoding_(nsData, 4);
};
/**
 * dumpSymbol 导出json数据
 * @param {*} symbolInstance // context.selection[0]
 */

var dumpSymbol = function dumpSymbol(symbolInstance) {
  // return symbolInstance
  var immutableInstance = symbolInstance.immutableModelObject();
  return MSJSONDataArchiver.archiveStringWithRootObject_error(immutableInstance, nil);
};

/***/ }),

/***/ "./src/utils/system.js":
/*!*****************************!*\
  !*** ./src/utils/system.js ***!
  \*****************************/
/*! exports provided: getNewUUID, getThreadDictForKey, setThreadDictForKey, removeThreadDictForKey, getSettingForKey, setSettingForKey, removeSettingForKey, showPluginsPane, showLibrariesPane, getSystemVersion, getPluginVersion, reloadPlugins, getFileContentFromModal, getSavePathFromModal, observerWindowResizeNotification, removeObserverWindowResizeNotification */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNewUUID", function() { return getNewUUID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getThreadDictForKey", function() { return getThreadDictForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setThreadDictForKey", function() { return setThreadDictForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeThreadDictForKey", function() { return removeThreadDictForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSettingForKey", function() { return getSettingForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSettingForKey", function() { return setSettingForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeSettingForKey", function() { return removeSettingForKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showPluginsPane", function() { return showPluginsPane; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showLibrariesPane", function() { return showLibrariesPane; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSystemVersion", function() { return getSystemVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPluginVersion", function() { return getPluginVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reloadPlugins", function() { return reloadPlugins; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileContentFromModal", function() { return getFileContentFromModal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSavePathFromModal", function() { return getSavePathFromModal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "observerWindowResizeNotification", function() { return observerWindowResizeNotification; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeObserverWindowResizeNotification", function() { return removeObserverWindowResizeNotification; });
/* harmony import */ var mocha_js_delegate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mocha-js-delegate */ "./node_modules/mocha-js-delegate/index.js");
/* harmony import */ var mocha_js_delegate__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mocha_js_delegate__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../session */ "./src/session.js");
/* harmony import */ var _common_config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/config */ "./src/common/config.js");



/**
 * getNewUUID 获取唯一 ID
 */

var getNewUUID = function getNewUUID() {
  return NSUUID.UUID().UUIDString();
};
/**
 * getThreadDictForKey 获取挂载 mainThread 的键值
 * @param {string} key
 */

var getThreadDictForKey = function getThreadDictForKey(key) {
  return NSThread.mainThread().threadDictionary()[key];
};
/**
 * setThreadDictForKey 挂载到 mainThread 的键值
 * @param {string} key
 * @param {string} value
 */

var setThreadDictForKey = function setThreadDictForKey(key, value) {
  return NSThread.mainThread().threadDictionary()[key] = value;
};
/**
 * removeThreadDictForKey 移除挂载到 mainThread 的键值
 * @param { string } key
 */

var removeThreadDictForKey = function removeThreadDictForKey(key) {
  if (NSThread.mainThread().threadDictionary()[key]) NSThread.mainThread().threadDictionary().removeObjectForKey(key);
};
/**
 * getSettingForKey 获取挂载 NSUserDefaults 的键值
 * @param { string } key
 */

var getSettingForKey = function getSettingForKey(key) {
  return NSUserDefaults.standardUserDefaults().objectForKey(key);
};
/**
 * setSettingForKey 挂载到 NSUserDefaults 的键值
 * @param {string} key
 * @param {string} value
 */

var setSettingForKey = function setSettingForKey(key, value) {
  return NSUserDefaults.standardUserDefaults().setObject_forKey(value, key);
};
/**
 * removeSettingForKey 移除挂载到 NSUserDefaults 的键值
 * @param { string } key
 */

var removeSettingForKey = function removeSettingForKey(key) {
  setSettingForKey(key, nil);
};
/**
 * showPluginsPane 显示 plugin window
 */

var showPluginsPane = function showPluginsPane() {
  var identifier = MSPluginsPreferencePane.identifier();
  var preferencesController = MSPreferencesController.sharedController();
  preferencesController.switchToPaneWithIdentifier(identifier);
  preferencesController.currentPreferencePane().tableView().reloadData();
};
/**
 * showLibrariesPane 显示 libraries window
 */

var showLibrariesPane = function showLibrariesPane() {
  var identifier = MSAssetLibrariesPreferencePane.identifier();
  var preferencesController = MSPreferencesController.sharedController();
  preferencesController.switchToPaneWithIdentifier(identifier);
  preferencesController.currentPreferencePane().tableView().reloadData();
};
/**
 * getSystemVersion 获取系统版本
 */

var getSystemVersion = function getSystemVersion() {
  try {
    var systemVersion = NSProcessInfo.processInfo().operatingSystemVersionString().match(/\d*\.\d*(\.\d*)?/);

    if (systemVersion && systemVersion[0]) {
      var versions = systemVersion[0];
      return versions.split('.').length === 2 ? ''.concat(versions, '.0') : versions;
    }

    return '0.0.0';
  } catch (e) {
    return '0.0.0';
  }
};
/**
 * getPluginVersion 获取插件版本
 */

var getPluginVersion = function getPluginVersion() {
  return _session__WEBPACK_IMPORTED_MODULE_1__["context"].plugin.version();
};
/**
 * reloadPlugins 重载插件
 */

var reloadPlugins = function reloadPlugins() {
  AppController.sharedInstance().pluginManager().reloadPlugins();
};
/**
 * getFileContentFromModal 打开文件选择器，获取文件的文本内容
 * @param {Array<string>} fileTypes 文件类型
 */

var getFileContentFromModal = function getFileContentFromModal() {
  var fileTypes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var openPanel = NSOpenPanel.openPanel();
  openPanel.setTitle('Choose a JSON File');
  openPanel.canCreateDirectories = false;
  openPanel.canChooseFiles = true;
  openPanel.allowedFileTypes = fileTypes;
  var openPanelButtonPressed = openPanel.runModal();

  if (openPanelButtonPressed === NSModalResponseOK) {
    var filePath = openPanel.URL().path();
    return NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, nil);
  }

  return '';
};
/**
 * getSavePathFromModal 获取文件的存储路径
 * @param {String} fileName 文件名
 * @param {Array<string>} fileTypes 文件类型
 */

var getSavePathFromModal = function getSavePathFromModal(fileName) {
  var fileTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['json'];
  if (!fileName) return;
  var savePanel = NSSavePanel.savePanel();
  savePanel.canCreateDirectories = true;
  savePanel.nameFieldStringValue = fileName;
  savePanel.allowedFileTypes = fileTypes;
  var savePanelActionStatus = savePanel.runModal();

  if (savePanelActionStatus === NSModalResponseOK) {
    var filePath = savePanel.URL().path();
    return {
      filePath: filePath,
      fileName: savePanel.nameFieldStringValue()
    };
  }

  return false;
};
/**
 * observerWindowResizeNotification 监听窗口resize
 * @param {*} fn
 */

var observerWindowResizeNotification = function observerWindowResizeNotification(fn) {
  // Keep script around, otherwise everything will be dumped once its run
  // COScript.currentCOScript().setShouldKeepAround(true)
  if (!getThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_INSTANCE"])) {
    // Create a selector
    var Selector = NSSelectorFromString('onWindowMove:');
    var delegate = new mocha_js_delegate__WEBPACK_IMPORTED_MODULE_0___default.a({
      'onWindowMove:': function onWindowMove(notification) {
        // const bounds = NSScreen.mainScreen().frame()
        fn(notification); // log(notification)
        // NSNotificationCenter.defaultCenter().removeObserver_name_object(delegateInstance, NSWindowDidResizeNotification, nil)
      }
    }); // Don't forget to create a class instance of the delegate

    var delegateInstance = delegate.getClassInstance();
    NSNotificationCenter.defaultCenter().addObserver_selector_name_object(delegateInstance, Selector, NSWindowDidResizeNotification, nil);
    setThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_INSTANCE"], delegateInstance);
    setThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_SELECTOR"], Selector);
  }
};
/**
 * removeObserverWindowResizeNotification 清除监听窗口resize
 * @param {*} fn
 */

var removeObserverWindowResizeNotification = function removeObserverWindowResizeNotification() {
  var delegateInstance = getThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_INSTANCE"]);

  if (delegateInstance) {
    NSNotificationCenter.defaultCenter().removeObserver_name_object(delegateInstance, NSWindowDidResizeNotification, nil);
    removeThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_INSTANCE"]);
    removeThreadDictForKey(_common_config__WEBPACK_IMPORTED_MODULE_2__["WINDOW_MOVE_SELECTOR"]);
  }
};

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ })

/******/ });
    if (key === 'default' && typeof exports === 'function') {
      exports(context);
    } else if (typeof exports[key] !== 'function') {
      throw new Error('Missing export named "' + key + '". Your command should contain something like `export function " + key +"() {}`.');
    } else {
      exports[key](context);
    }
  } catch (err) {
    if (typeof process !== 'undefined' && process.listenerCount && process.listenerCount('uncaughtException')) {
      process.emit("uncaughtException", err, "uncaughtException");
    } else {
      throw err
    }
  }
}
globalThis['onOpenDocument'] = __skpm_run.bind(this, 'onOpenDocument');
globalThis['onCloseDocument'] = __skpm_run.bind(this, 'onCloseDocument');
globalThis['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=action.js.map