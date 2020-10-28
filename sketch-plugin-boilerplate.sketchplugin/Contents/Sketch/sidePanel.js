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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/sidePanel.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@skpm/promise/index.js":
/*!*********************************************!*\
  !*** ./node_modules/@skpm/promise/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* from https://github.com/taylorhakes/promise-polyfill */

function promiseFinally(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
}

function noop() {}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError("Promises must be constructed via new");
  if (typeof fn !== "function") throw new TypeError("not a function");
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError("A promise cannot be resolved with itself.");
    if (
      newValue &&
      (typeof newValue === "object" || typeof newValue === "function")
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === "function") {
        doResolve(then.bind(newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value, self);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) {
          Promise._multipleResolvesFn("resolve", self, value);
          return;
        }
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) {
          Promise._multipleResolvesFn("reject", self, reason);
          return;
        }
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) {
      Promise._multipleResolvesFn("reject", self, ex);
      return;
    }
    done = true;
    reject(self, ex);
  }
}

Promise.prototype["catch"] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype["finally"] = promiseFinally;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(arr)) {
      return reject(new TypeError("Promise.all accepts an array"));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === "object" || typeof val === "function")) {
          var then = val.then;
          if (typeof then === "function") {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === "object" && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(arr)) {
      return reject(new TypeError("Promise.race accepts an array"));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn = setImmediate;

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err, promise) {
  if (
    typeof process !== "undefined" &&
    process.listenerCount &&
    (process.listenerCount("unhandledRejection") ||
      process.listenerCount("uncaughtException"))
  ) {
    process.emit("unhandledRejection", err, promise);
    process.emit("uncaughtException", err, "unhandledRejection");
  } else if (typeof console !== "undefined" && console) {
    console.warn("Possible Unhandled Promise Rejection:", err);
  }
};

Promise._multipleResolvesFn = function _multipleResolvesFn(
  type,
  promise,
  value
) {
  if (typeof process !== "undefined" && process.emit) {
    process.emit("multipleResolves", type, promise, value);
  }
};

module.exports = Promise;


/***/ }),

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

/***/ "./node_modules/sketch-module-web-view/lib/browser-api.js":
/*!****************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/browser-api.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function parseHexColor(color) {
  // Check the string for incorrect formatting.
  if (!color || color[0] !== '#') {
    if (
      color &&
      typeof color.isKindOfClass === 'function' &&
      color.isKindOfClass(NSColor)
    ) {
      return color
    }
    throw new Error(
      'Incorrect color formating. It should be an hex color: #RRGGBBAA'
    )
  }

  // append FF if alpha channel is not specified.
  var source = color.substr(1)
  if (source.length === 3) {
    source += 'F'
  } else if (source.length === 6) {
    source += 'FF'
  }
  // Convert the string from #FFF format to #FFFFFF format.
  var hex
  if (source.length === 4) {
    for (var i = 0; i < 4; i += 1) {
      hex += source[i]
      hex += source[i]
    }
  } else if (source.length === 8) {
    hex = source
  } else {
    return NSColor.whiteColor()
  }

  var r = parseInt(hex.slice(0, 2), 16)
  var g = parseInt(hex.slice(2, 4), 16)
  var b = parseInt(hex.slice(4, 6), 16)
  var a = parseInt(hex.slice(6, 8), 16)

  return NSColor.colorWithSRGBRed_green_blue_alpha(r, g, b, a)
}

module.exports = function(browserWindow, panel, webview) {
  // keep reference to the subviews
  browserWindow._panel = panel
  browserWindow._webview = webview
  browserWindow._destroyed = false

  browserWindow.destroy = function() {
    return panel.close()
  }

  browserWindow.close = function() {
    if (panel.delegate().utils && panel.delegate().utils.parentWindow) {
      var shouldClose = true
      browserWindow.emit('close', {
        get defaultPrevented() {
          return !shouldClose
        },
        preventDefault: function() {
          shouldClose = false
        },
      })
      if (shouldClose) {
        panel.delegate().utils.parentWindow.endSheet(panel)
      }
      return
    }

    if (!browserWindow.isClosable()) {
      return
    }

    panel.performClose(null)
  }

  function focus(focused) {
    if (!browserWindow.isVisible()) {
      return
    }
    if (focused) {
      NSApplication.sharedApplication().activateIgnoringOtherApps(true)
      panel.makeKeyAndOrderFront(null)
    } else {
      panel.orderBack(null)
      NSApp.mainWindow().makeKeyAndOrderFront(null)
    }
  }

  browserWindow.focus = focus.bind(this, true)
  browserWindow.blur = focus.bind(this, false)

  browserWindow.isFocused = function() {
    return panel.isKeyWindow()
  }

  browserWindow.isDestroyed = function() {
    return browserWindow._destroyed
  }

  browserWindow.show = function() {
    // This method is supposed to put focus on window, however if the app does not
    // have focus then "makeKeyAndOrderFront" will only show the window.
    NSApp.activateIgnoringOtherApps(true)

    if (panel.delegate().utils && panel.delegate().utils.parentWindow) {
      return panel.delegate().utils.parentWindow.beginSheet_completionHandler(
        panel,
        __mocha__.createBlock_function('v16@?0q8', function() {
          browserWindow.emit('closed')
        })
      )
    }

    return panel.makeKeyAndOrderFront(null)
  }

  browserWindow.showInactive = function() {
    return panel.orderFrontRegardless()
  }

  browserWindow.hide = function() {
    return panel.orderOut(null)
  }

  browserWindow.isVisible = function() {
    return panel.isVisible()
  }

  browserWindow.isModal = function() {
    return false
  }

  browserWindow.maximize = function() {
    if (!browserWindow.isMaximized()) {
      panel.zoom(null)
    }
  }
  browserWindow.unmaximize = function() {
    if (browserWindow.isMaximized()) {
      panel.zoom(null)
    }
  }

  browserWindow.isMaximized = function() {
    if ((panel.styleMask() & NSResizableWindowMask) !== 0) {
      return panel.isZoomed()
    }
    var rectScreen = NSScreen.mainScreen().visibleFrame()
    var rectWindow = panel.frame()
    return (
      rectScreen.origin.x == rectWindow.origin.x &&
      rectScreen.origin.y == rectWindow.origin.y &&
      rectScreen.size.width == rectWindow.size.width &&
      rectScreen.size.height == rectWindow.size.height
    )
  }

  browserWindow.minimize = function() {
    return panel.miniaturize(null)
  }

  browserWindow.restore = function() {
    return panel.deminiaturize(null)
  }

  browserWindow.isMinimized = function() {
    return panel.isMiniaturized()
  }

  browserWindow.setFullScreen = function(fullscreen) {
    if (fullscreen !== browserWindow.isFullscreen()) {
      panel.toggleFullScreen(null)
    }
  }

  browserWindow.isFullscreen = function() {
    return panel.styleMask() & NSFullScreenWindowMask
  }

  browserWindow.setAspectRatio = function(aspectRatio /* , extraSize */) {
    // Reset the behaviour to default if aspect_ratio is set to 0 or less.
    if (aspectRatio > 0.0) {
      panel.setAspectRatio(NSMakeSize(aspectRatio, 1.0))
    } else {
      panel.setResizeIncrements(NSMakeSize(1.0, 1.0))
    }
  }

  browserWindow.setBounds = function(bounds, animate) {
    if (!bounds) {
      return
    }

    // Do nothing if in fullscreen mode.
    if (browserWindow.isFullscreen()) {
      return
    }

    const newBounds = Object.assign(browserWindow.getBounds(), bounds)

    // TODO: Check size constraints since setFrame does not check it.
    // var size = bounds.size
    // size.SetToMax(GetMinimumSize());
    // gfx::Size max_size = GetMaximumSize();
    // if (!max_size.IsEmpty())
    //   size.SetToMin(max_size);

    var cocoaBounds = NSMakeRect(
      newBounds.x,
      0,
      newBounds.width,
      newBounds.height
    )
    // Flip Y coordinates based on the primary screen
    var screen = NSScreen.screens().firstObject()
    cocoaBounds.origin.y = NSHeight(screen.frame()) - newBounds.y

    panel.setFrame_display_animate(cocoaBounds, true, animate)
  }

  browserWindow.getBounds = function() {
    const cocoaBounds = panel.frame()
    var mainScreenRect = NSScreen.screens()
      .firstObject()
      .frame()
    return {
      x: cocoaBounds.origin.x,
      y: Math.round(NSHeight(mainScreenRect) - cocoaBounds.origin.y),
      width: cocoaBounds.size.width,
      height: cocoaBounds.size.height,
    }
  }

  browserWindow.setContentBounds = function(bounds, animate) {
    // TODO:
    browserWindow.setBounds(bounds, animate)
  }

  browserWindow.getContentBounds = function() {
    // TODO:
    return browserWindow.getBounds()
  }

  browserWindow.setSize = function(width, height, animate) {
    // TODO: handle resizing around center
    return browserWindow.setBounds({ width: width, height: height }, animate)
  }

  browserWindow.getSize = function() {
    var bounds = browserWindow.getBounds()
    return [bounds.width, bounds.height]
  }

  browserWindow.setContentSize = function(width, height, animate) {
    // TODO: handle resizing around center
    return browserWindow.setContentBounds(
      { width: width, height: height },
      animate
    )
  }

  browserWindow.getContentSize = function() {
    var bounds = browserWindow.getContentBounds()
    return [bounds.width, bounds.height]
  }

  browserWindow.setMinimumSize = function(width, height) {
    const minSize = CGSizeMake(width, height)
    panel.setContentMinSize(minSize)
  }

  browserWindow.getMinimumSize = function() {
    const size = panel.contentMinSize()
    return [size.width, size.height]
  }

  browserWindow.setMaximumSize = function(width, height) {
    const maxSize = CGSizeMake(width, height)
    panel.setContentMaxSize(maxSize)
  }

  browserWindow.getMaximumSize = function() {
    const size = panel.contentMaxSize()
    return [size.width, size.height]
  }

  browserWindow.setResizable = function(resizable) {
    return browserWindow._setStyleMask(resizable, NSResizableWindowMask)
  }

  browserWindow.isResizable = function() {
    return panel.styleMask() & NSResizableWindowMask
  }

  browserWindow.setMovable = function(movable) {
    return panel.setMovable(movable)
  }
  browserWindow.isMovable = function() {
    return panel.isMovable()
  }

  browserWindow.setMinimizable = function(minimizable) {
    return browserWindow._setStyleMask(minimizable, NSMiniaturizableWindowMask)
  }

  browserWindow.isMinimizable = function() {
    return panel.styleMask() & NSMiniaturizableWindowMask
  }

  browserWindow.setMaximizable = function(maximizable) {
    if (panel.standardWindowButton(NSWindowZoomButton)) {
      panel.standardWindowButton(NSWindowZoomButton).setEnabled(maximizable)
    }
  }

  browserWindow.isMaximizable = function() {
    return (
      panel.standardWindowButton(NSWindowZoomButton) &&
      panel.standardWindowButton(NSWindowZoomButton).isEnabled()
    )
  }

  browserWindow.setFullScreenable = function(fullscreenable) {
    browserWindow._setCollectionBehavior(
      fullscreenable,
      NSWindowCollectionBehaviorFullScreenPrimary
    )
    // On EL Capitan this flag is required to hide fullscreen button.
    browserWindow._setCollectionBehavior(
      !fullscreenable,
      NSWindowCollectionBehaviorFullScreenAuxiliary
    )
  }

  browserWindow.isFullScreenable = function() {
    var collectionBehavior = panel.collectionBehavior()
    return collectionBehavior & NSWindowCollectionBehaviorFullScreenPrimary
  }

  browserWindow.setClosable = function(closable) {
    browserWindow._setStyleMask(closable, NSClosableWindowMask)
  }

  browserWindow.isClosable = function() {
    return panel.styleMask() & NSClosableWindowMask
  }

  browserWindow.setAlwaysOnTop = function(top, level, relativeLevel) {
    var windowLevel = NSNormalWindowLevel
    var maxWindowLevel = CGWindowLevelForKey(kCGMaximumWindowLevelKey)
    var minWindowLevel = CGWindowLevelForKey(kCGMinimumWindowLevelKey)

    if (top) {
      if (level === 'normal') {
        windowLevel = NSNormalWindowLevel
      } else if (level === 'torn-off-menu') {
        windowLevel = NSTornOffMenuWindowLevel
      } else if (level === 'modal-panel') {
        windowLevel = NSModalPanelWindowLevel
      } else if (level === 'main-menu') {
        windowLevel = NSMainMenuWindowLevel
      } else if (level === 'status') {
        windowLevel = NSStatusWindowLevel
      } else if (level === 'pop-up-menu') {
        windowLevel = NSPopUpMenuWindowLevel
      } else if (level === 'screen-saver') {
        windowLevel = NSScreenSaverWindowLevel
      } else if (level === 'dock') {
        // Deprecated by macOS, but kept for backwards compatibility
        windowLevel = NSDockWindowLevel
      } else {
        windowLevel = NSFloatingWindowLevel
      }
    }

    var newLevel = windowLevel + (relativeLevel || 0)
    if (newLevel >= minWindowLevel && newLevel <= maxWindowLevel) {
      panel.setLevel(newLevel)
    } else {
      throw new Error(
        'relativeLevel must be between ' +
          minWindowLevel +
          ' and ' +
          maxWindowLevel
      )
    }
  }

  browserWindow.isAlwaysOnTop = function() {
    return panel.level() !== NSNormalWindowLevel
  }

  browserWindow.moveTop = function() {
    return panel.orderFrontRegardless()
  }

  browserWindow.center = function() {
    panel.center()
  }

  browserWindow.setPosition = function(x, y, animate) {
    return browserWindow.setBounds({ x: x, y: y }, animate)
  }

  browserWindow.getPosition = function() {
    var bounds = browserWindow.getBounds()
    return [bounds.x, bounds.y]
  }

  browserWindow.setTitle = function(title) {
    panel.setTitle(title)
  }

  browserWindow.getTitle = function() {
    return String(panel.title())
  }

  var attentionRequestId = 0
  browserWindow.flashFrame = function(flash) {
    if (flash) {
      attentionRequestId = NSApp.requestUserAttention(NSInformationalRequest)
    } else {
      NSApp.cancelUserAttentionRequest(attentionRequestId)
      attentionRequestId = 0
    }
  }

  browserWindow.getNativeWindowHandle = function() {
    return panel
  }

  browserWindow.getNativeWebViewHandle = function() {
    return webview
  }

  browserWindow.loadURL = function(url) {
    // When frameLocation is a file, prefix it with the Sketch Resources path
    if (/^(?!https?|file).*\.html?$/.test(url)) {
      if (typeof __command !== 'undefined' && __command.pluginBundle()) {
        url =
          'file://' +
          __command
            .pluginBundle()
            .urlForResourceNamed(url)
            .path()
      }
    }

    if (/^file:\/\/.*\.html?$/.test(url)) {
      // ensure URLs containing spaces are properly handled
      url = NSString.alloc().initWithString(url)
      url = url.stringByAddingPercentEncodingWithAllowedCharacters(
        NSCharacterSet.URLQueryAllowedCharacterSet()
      )
      webview.loadFileURL_allowingReadAccessToURL(
        NSURL.URLWithString(url),
        NSURL.URLWithString('file:///')
      )
      return
    }

    const properURL = NSURL.URLWithString(url)
    const urlRequest = NSURLRequest.requestWithURL(properURL)

    webview.loadRequest(urlRequest)
  }

  browserWindow.reload = function() {
    webview.reload()
  }

  browserWindow.setHasShadow = function(hasShadow) {
    return panel.setHasShadow(hasShadow)
  }

  browserWindow.hasShadow = function() {
    return panel.hasShadow()
  }

  browserWindow.setOpacity = function(opacity) {
    return panel.setAlphaValue(opacity)
  }

  browserWindow.getOpacity = function() {
    return panel.alphaValue()
  }

  browserWindow.setVisibleOnAllWorkspaces = function(visible) {
    return browserWindow._setCollectionBehavior(
      visible,
      NSWindowCollectionBehaviorCanJoinAllSpaces
    )
  }

  browserWindow.isVisibleOnAllWorkspaces = function() {
    var collectionBehavior = panel.collectionBehavior()
    return collectionBehavior & NSWindowCollectionBehaviorCanJoinAllSpaces
  }

  browserWindow.setIgnoreMouseEvents = function(ignore) {
    return panel.setIgnoresMouseEvents(ignore)
  }

  browserWindow.setContentProtection = function(enable) {
    panel.setSharingType(enable ? NSWindowSharingNone : NSWindowSharingReadOnly)
  }

  browserWindow.setAutoHideCursor = function(autoHide) {
    panel.setDisableAutoHideCursor(autoHide)
  }

  browserWindow.setVibrancy = function(type) {
    var effectView = browserWindow._vibrantView

    if (!type) {
      if (effectView == null) {
        return
      }

      effectView.removeFromSuperview()
      panel.setVibrantView(null)
      return
    }

    if (effectView == null) {
      var contentView = panel.contentView()
      effectView = NSVisualEffectView.alloc().initWithFrame(
        contentView.bounds()
      )
      browserWindow._vibrantView = effectView

      effectView.setAutoresizingMask(NSViewWidthSizable | NSViewHeightSizable)
      effectView.setBlendingMode(NSVisualEffectBlendingModeBehindWindow)
      effectView.setState(NSVisualEffectStateActive)
      effectView.setFrame(contentView.bounds())
      contentView.addSubview_positioned_relativeTo(
        effectView,
        NSWindowBelow,
        null
      )
    }

    var vibrancyType = NSVisualEffectMaterialLight

    if (type === 'appearance-based') {
      vibrancyType = NSVisualEffectMaterialAppearanceBased
    } else if (type === 'light') {
      vibrancyType = NSVisualEffectMaterialLight
    } else if (type === 'dark') {
      vibrancyType = NSVisualEffectMaterialDark
    } else if (type === 'titlebar') {
      vibrancyType = NSVisualEffectMaterialTitlebar
    } else if (type === 'selection') {
      vibrancyType = NSVisualEffectMaterialSelection
    } else if (type === 'menu') {
      vibrancyType = NSVisualEffectMaterialMenu
    } else if (type === 'popover') {
      vibrancyType = NSVisualEffectMaterialPopover
    } else if (type === 'sidebar') {
      vibrancyType = NSVisualEffectMaterialSidebar
    } else if (type === 'medium-light') {
      vibrancyType = NSVisualEffectMaterialMediumLight
    } else if (type === 'ultra-dark') {
      vibrancyType = NSVisualEffectMaterialUltraDark
    }

    effectView.setMaterial(vibrancyType)
  }

  browserWindow._setBackgroundColor = function(colorName) {
    var color = parseHexColor(colorName)
    webview.setValue_forKey(false, 'drawsBackground')
    panel.backgroundColor = color
  }

  browserWindow._invalidate = function() {
    panel.flushWindow()
    panel.contentView().setNeedsDisplay(true)
  }

  browserWindow._setStyleMask = function(on, flag) {
    var wasMaximizable = browserWindow.isMaximizable()
    if (on) {
      panel.setStyleMask(panel.styleMask() | flag)
    } else {
      panel.setStyleMask(panel.styleMask() & ~flag)
    }
    // Change style mask will make the zoom button revert to default, probably
    // a bug of Cocoa or macOS.
    browserWindow.setMaximizable(wasMaximizable)
  }

  browserWindow._setCollectionBehavior = function(on, flag) {
    var wasMaximizable = browserWindow.isMaximizable()
    if (on) {
      panel.setCollectionBehavior(panel.collectionBehavior() | flag)
    } else {
      panel.setCollectionBehavior(panel.collectionBehavior() & ~flag)
    }
    // Change collectionBehavior will make the zoom button revert to default,
    // probably a bug of Cocoa or macOS.
    browserWindow.setMaximizable(wasMaximizable)
  }

  browserWindow._showWindowButton = function(button) {
    var view = panel.standardWindowButton(button)
    view.superview().addSubview_positioned_relative(view, NSWindowAbove, null)
  }
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/constants.js":
/*!**************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/constants.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  JS_BRIDGE: '__skpm_sketchBridge',
  START_MOVING_WINDOW: '__skpm_startMovingWindow',
  EXECUTE_JAVASCRIPT: '__skpm_executeJS',
  EXECUTE_JAVASCRIPT_SUCCESS: '__skpm_executeJS_success_',
  EXECUTE_JAVASCRIPT_ERROR: '__skpm_executeJS_error_',
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/dispatch-first-click.js":
/*!*************************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/dispatch-first-click.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var tagsToFocus =
  '["text", "textarea", "date", "datetime-local", "email", "number", "month", "password", "search", "tel", "time", "url", "week" ]'

module.exports = function(webView, event) {
  var point = webView.convertPoint_fromView(event.locationInWindow(), null)
  return (
    'var el = document.elementFromPoint(' + // get the DOM element that match the event
    point.x +
    ', ' +
    point.y +
    '); ' +
    'if (el && ' + // some tags need to be focused instead of clicked
    tagsToFocus +
    '.indexOf(el.type) >= 0 && ' +
    'el.focus' +
    ') {' +
    'el.focus();' + // so focus them
    '} else if (el) {' +
    'el.dispatchEvent(new Event("click", {bubbles: true}))' + // click the others
    '}'
  )
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/execute-javascript.js":
/*!***********************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/execute-javascript.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Promise) {var CONSTANTS = __webpack_require__(/*! ./constants */ "./node_modules/sketch-module-web-view/lib/constants.js")

module.exports = function(webview, browserWindow) {
  function executeJavaScript(script, userGesture, callback) {
    if (typeof userGesture === 'function') {
      callback = userGesture
      userGesture = false
    }
    var fiber = coscript.createFiber()

    // if the webview is not ready yet, defer the execution until it is
    if (
      webview.navigationDelegate().state &&
      webview.navigationDelegate().state.wasReady == 0
    ) {
      return new Promise(function(resolve, reject) {
        browserWindow.once('ready-to-show', function() {
          executeJavaScript(script, userGesture, callback)
            .then(resolve)
            .catch(reject)
          fiber.cleanup()
        })
      })
    }

    return new Promise(function(resolve, reject) {
      var requestId = Math.random()

      browserWindow.webContents.on(
        CONSTANTS.EXECUTE_JAVASCRIPT_SUCCESS + requestId,
        function(res) {
          try {
            if (callback) {
              callback(null, res)
            }
            resolve(res)
          } catch (err) {
            reject(err)
          }
          fiber.cleanup()
        }
      )
      browserWindow.webContents.on(
        CONSTANTS.EXECUTE_JAVASCRIPT_ERROR + requestId,
        function(err) {
          try {
            if (callback) {
              callback(err)
              resolve()
            } else {
              reject(err)
            }
          } catch (err2) {
            reject(err2)
          }
          fiber.cleanup()
        }
      )

      webview.evaluateJavaScript_completionHandler(
        module.exports.wrapScript(script, requestId),
        null
      )
    })
  }

  return executeJavaScript
}

module.exports.wrapScript = function(script, requestId) {
  return (
    'window.' +
    CONSTANTS.EXECUTE_JAVASCRIPT +
    '(' +
    requestId +
    ', ' +
    JSON.stringify(script) +
    ')'
  )
}

module.exports.injectScript = function(webView) {
  var source =
    'window.' +
    CONSTANTS.EXECUTE_JAVASCRIPT +
    ' = function(id, script) {' +
    '  try {' +
    '    var res = eval(script);' +
    '    if (res && typeof res.then === "function" && typeof res.catch === "function") {' +
    '      res.then(function (res2) {' +
    '        window.postMessage("' +
    CONSTANTS.EXECUTE_JAVASCRIPT_SUCCESS +
    '" + id, res2);' +
    '      })' +
    '      .catch(function (err) {' +
    '        window.postMessage("' +
    CONSTANTS.EXECUTE_JAVASCRIPT_ERROR +
    '" + id, err);' +
    '      })' +
    '    } else {' +
    '      window.postMessage("' +
    CONSTANTS.EXECUTE_JAVASCRIPT_SUCCESS +
    '" + id, res);' +
    '    }' +
    '  } catch (err) {' +
    '    window.postMessage("' +
    CONSTANTS.EXECUTE_JAVASCRIPT_ERROR +
    '" + id, err);' +
    '  }' +
    '}'
  var script = WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly(
    source,
    0,
    true
  )
  webView
    .configuration()
    .userContentController()
    .addUserScript(script)
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@skpm/promise/index.js */ "./node_modules/@skpm/promise/index.js")))

/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/fitSubview.js":
/*!***************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/fitSubview.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function addEdgeConstraint(edge, subview, view, constant) {
  view.addConstraint(
    NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
      subview,
      edge,
      NSLayoutRelationEqual,
      view,
      edge,
      1,
      constant
    )
  )
}
module.exports = function fitSubviewToView(subview, view, constants) {
  constants = constants || []
  subview.setTranslatesAutoresizingMaskIntoConstraints(false)

  addEdgeConstraint(NSLayoutAttributeLeft, subview, view, constants[0] || 0)
  addEdgeConstraint(NSLayoutAttributeTop, subview, view, constants[1] || 0)
  addEdgeConstraint(NSLayoutAttributeRight, subview, view, constants[2] || 0)
  addEdgeConstraint(NSLayoutAttributeBottom, subview, view, constants[3] || 0)
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* let's try to match the API from Electron's Browser window
(https://github.com/electron/electron/blob/master/docs/api/browser-window.md) */
var EventEmitter = __webpack_require__(/*! events */ "events")
var buildBrowserAPI = __webpack_require__(/*! ./browser-api */ "./node_modules/sketch-module-web-view/lib/browser-api.js")
var buildWebAPI = __webpack_require__(/*! ./webview-api */ "./node_modules/sketch-module-web-view/lib/webview-api.js")
var fitSubviewToView = __webpack_require__(/*! ./fitSubview */ "./node_modules/sketch-module-web-view/lib/fitSubview.js")
var dispatchFirstClick = __webpack_require__(/*! ./dispatch-first-click */ "./node_modules/sketch-module-web-view/lib/dispatch-first-click.js")
var injectClientMessaging = __webpack_require__(/*! ./inject-client-messaging */ "./node_modules/sketch-module-web-view/lib/inject-client-messaging.js")
var movableArea = __webpack_require__(/*! ./movable-area */ "./node_modules/sketch-module-web-view/lib/movable-area.js")
var executeJavaScript = __webpack_require__(/*! ./execute-javascript */ "./node_modules/sketch-module-web-view/lib/execute-javascript.js")
var setDelegates = __webpack_require__(/*! ./set-delegates */ "./node_modules/sketch-module-web-view/lib/set-delegates.js")

function BrowserWindow(options) {
  options = options || {}

  var identifier = options.identifier || NSUUID.UUID().UUIDString()
  var threadDictionary = NSThread.mainThread().threadDictionary()

  var existingBrowserWindow = BrowserWindow.fromId(identifier)

  // if we already have a window opened, reuse it
  if (existingBrowserWindow) {
    return existingBrowserWindow
  }

  var browserWindow = new EventEmitter()
  browserWindow.id = identifier

  if (options.modal && !options.parent) {
    throw new Error('A modal needs to have a parent.')
  }

  // Long-running script
  var fiber = coscript.createFiber()

  // Window size
  var width = options.width || 800
  var height = options.height || 600
  var mainScreenRect = NSScreen.screens()
    .firstObject()
    .frame()
  var cocoaBounds = NSMakeRect(
    typeof options.x !== 'undefined'
      ? options.x
      : Math.round((NSWidth(mainScreenRect) - width) / 2),
    typeof options.y !== 'undefined'
      ? NSHeight(mainScreenRect) - options.y
      : Math.round((NSHeight(mainScreenRect) - height) / 2),
    width,
    height
  )

  if (options.titleBarStyle && options.titleBarStyle !== 'default') {
    options.frame = false
  }

  var useStandardWindow = options.windowType !== 'textured'
  var styleMask = NSTitledWindowMask

  // this is commented out because the toolbar doesn't appear otherwise :thinking-face:
  // if (!useStandardWindow || options.frame === false) {
  //   styleMask = NSFullSizeContentViewWindowMask
  // }
  if (options.minimizable !== false) {
    styleMask |= NSMiniaturizableWindowMask
  }
  if (options.closable !== false) {
    styleMask |= NSClosableWindowMask
  }
  if (options.resizable !== false) {
    styleMask |= NSResizableWindowMask
  }
  if (!useStandardWindow || options.transparent || options.frame === false) {
    styleMask |= NSTexturedBackgroundWindowMask
  }

  var panel = NSPanel.alloc().initWithContentRect_styleMask_backing_defer(
    cocoaBounds,
    styleMask,
    NSBackingStoreBuffered,
    true
  )

  var wkwebviewConfig = WKWebViewConfiguration.alloc().init()
  var webView = WKWebView.alloc().initWithFrame_configuration(
    CGRectMake(0, 0, options.width || 800, options.height || 600),
    wkwebviewConfig
  )
  injectClientMessaging(webView)
  webView.setAutoresizingMask(NSViewWidthSizable | NSViewHeightSizable)

  buildBrowserAPI(browserWindow, panel, webView)
  buildWebAPI(browserWindow, panel, webView)
  setDelegates(browserWindow, panel, webView, options)

  if (options.windowType === 'desktop') {
    panel.setLevel(kCGDesktopWindowLevel - 1)
    // panel.setCanBecomeKeyWindow(false)
    panel.setCollectionBehavior(
      NSWindowCollectionBehaviorCanJoinAllSpaces |
        NSWindowCollectionBehaviorStationary |
        NSWindowCollectionBehaviorIgnoresCycle
    )
  }

  if (
    typeof options.minWidth !== 'undefined' ||
    typeof options.minHeight !== 'undefined'
  ) {
    browserWindow.setMinimumSize(options.minWidth || 0, options.minHeight || 0)
  }

  if (
    typeof options.maxWidth !== 'undefined' ||
    typeof options.maxHeight !== 'undefined'
  ) {
    browserWindow.setMaximumSize(
      options.maxWidth || 10000,
      options.maxHeight || 10000
    )
  }

  // if (options.focusable === false) {
  //   panel.setCanBecomeKeyWindow(false)
  // }

  if (options.transparent || options.frame === false) {
    panel.titlebarAppearsTransparent = true
    panel.titleVisibility = NSWindowTitleHidden
    panel.setOpaque(0)
    panel.isMovableByWindowBackground = true
    var toolbar2 = NSToolbar.alloc().initWithIdentifier(
      'titlebarStylingToolbar'
    )
    toolbar2.setShowsBaselineSeparator(false)
    panel.setToolbar(toolbar2)
  }

  if (options.titleBarStyle === 'hiddenInset') {
    var toolbar = NSToolbar.alloc().initWithIdentifier('titlebarStylingToolbar')
    toolbar.setShowsBaselineSeparator(false)
    panel.setToolbar(toolbar)
  }

  if (options.frame === false || !options.useContentSize) {
    browserWindow.setSize(width, height)
  }

  if (options.center) {
    browserWindow.center()
  }

  if (options.alwaysOnTop) {
    browserWindow.setAlwaysOnTop(true)
  }

  if (options.fullscreen) {
    browserWindow.setFullScreen(true)
  }
  browserWindow.setFullScreenable(!!options.fullscreenable)

  const title =
    options.title ||
    (typeof __command !== 'undefined' && __command.pluginBundle()
      ? __command.pluginBundle().name()
      : undefined)
  if (title) {
    browserWindow.setTitle(title)
  }

  var backgroundColor = options.backgroundColor
  if (options.transparent) {
    backgroundColor = NSColor.clearColor()
  }
  if (!backgroundColor && options.frame === false && options.vibrancy) {
    backgroundColor = NSColor.clearColor()
  }

  browserWindow._setBackgroundColor(
    backgroundColor || NSColor.windowBackgroundColor()
  )

  if (options.hasShadow === false) {
    browserWindow.setHasShadow(false)
  }

  if (typeof options.opacity !== 'undefined') {
    browserWindow.setOpacity(options.opacity)
  }

  options.webPreferences = options.webPreferences || {}

  webView
    .configuration()
    .preferences()
    .setValue_forKey(
      options.webPreferences.devTools !== false,
      'developerExtrasEnabled'
    )
  webView
    .configuration()
    .preferences()
    .setValue_forKey(
      options.webPreferences.javascript !== false,
      'javaScriptEnabled'
    )
  webView
    .configuration()
    .preferences()
    .setValue_forKey(!!options.webPreferences.plugins, 'plugInsEnabled')
  webView
    .configuration()
    .preferences()
    .setValue_forKey(
      options.webPreferences.minimumFontSize || 0,
      'minimumFontSize'
    )

  if (options.webPreferences.zoomFactor) {
    webView.setMagnification(options.webPreferences.zoomFactor)
  }

  var contentView = panel.contentView()

  if (options.frame !== false) {
    webView.setFrame(contentView.bounds())
    contentView.addSubview(webView)
  } else {
    // In OSX 10.10, adding subviews to the root view for the NSView hierarchy
    // produces warnings. To eliminate the warnings, we resize the contentView
    // to fill the window, and add subviews to that.
    // http://crbug.com/380412
    contentView.setAutoresizingMask(NSViewWidthSizable | NSViewHeightSizable)
    fitSubviewToView(contentView, contentView.superview())

    webView.setFrame(contentView.bounds())
    contentView.addSubview(webView)

    // The fullscreen button should always be hidden for frameless window.
    if (panel.standardWindowButton(NSWindowFullScreenButton)) {
      panel.standardWindowButton(NSWindowFullScreenButton).setHidden(true)
    }

    if (!options.titleBarStyle || options.titleBarStyle === 'default') {
      // Hide the window buttons.
      panel.standardWindowButton(NSWindowZoomButton).setHidden(true)
      panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true)
      panel.standardWindowButton(NSWindowCloseButton).setHidden(true)

      // Some third-party macOS utilities check the zoom button's enabled state to
      // determine whether to show custom UI on hover, so we disable it here to
      // prevent them from doing so in a frameless app window.
      panel.standardWindowButton(NSWindowZoomButton).setEnabled(false)
    }
  }

  if (options.vibrancy) {
    browserWindow.setVibrancy(options.vibrancy)
  }

  // Set maximizable state last to ensure zoom button does not get reset
  // by calls to other APIs.
  browserWindow.setMaximizable(options.maximizable !== false)

  panel.setHidesOnDeactivate(options.hidesOnDeactivate !== false)

  if (options.remembersWindowFrame) {
    panel.setFrameAutosaveName(identifier)
    panel.setFrameUsingName_force(panel.frameAutosaveName(), false)
  }

  if (options.acceptsFirstMouse) {
    browserWindow.on('focus', function(event) {
      if (event.type() === NSEventTypeLeftMouseDown) {
        browserWindow.webContents
          .executeJavaScript(dispatchFirstClick(webView, event))
          .catch(() => {})
      }
    })
  }

  executeJavaScript.injectScript(webView)
  movableArea.injectScript(webView)
  movableArea.setupHandler(browserWindow)

  if (options.show !== false) {
    browserWindow.show()
  }

  browserWindow.on('closed', function() {
    browserWindow._destroyed = true
    threadDictionary.removeObjectForKey(identifier)
    fiber.cleanup()
  })

  threadDictionary[identifier] = panel

  fiber.onCleanup(function() {
    if (!browserWindow._destroyed) {
      browserWindow.destroy()
    }
  })

  return browserWindow
}

BrowserWindow.fromId = function(identifier) {
  var threadDictionary = NSThread.mainThread().threadDictionary()

  if (threadDictionary[identifier]) {
    return BrowserWindow.fromPanel(threadDictionary[identifier], identifier)
  }

  return undefined
}

BrowserWindow.fromPanel = function(panel, identifier) {
  var browserWindow = new EventEmitter()
  browserWindow.id = identifier

  if (!panel || !panel.contentView) {
    throw new Error('needs to pass an NSPanel')
  }

  var webView = null
  var subviews = panel.contentView().subviews()
  for (var i = 0; i < subviews.length; i += 1) {
    if (
      !webView &&
      !subviews[i].isKindOfClass(WKInspectorWKWebView) &&
      subviews[i].isKindOfClass(WKWebView)
    ) {
      webView = subviews[i]
    }
  }

  if (!webView) {
    throw new Error('The panel needs to have a webview')
  }

  buildBrowserAPI(browserWindow, panel, webView)
  buildWebAPI(browserWindow, panel, webView)

  return browserWindow
}

module.exports = BrowserWindow


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/inject-client-messaging.js":
/*!****************************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/inject-client-messaging.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var CONSTANTS = __webpack_require__(/*! ./constants */ "./node_modules/sketch-module-web-view/lib/constants.js")

module.exports = function(webView) {
  var source =
    'window.originalPostMessage = window.postMessage;' +
    'window.postMessage = function(actionName) {' +
    'if (!actionName) {' +
    "throw new Error('missing action name')" +
    '}' +
    'window.webkit.messageHandlers.' +
    CONSTANTS.JS_BRIDGE +
    '.postMessage(' +
    'JSON.stringify([].slice.call(arguments))' +
    ');' +
    '}'
  var script = WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly(
    source,
    0,
    true
  )
  webView
    .configuration()
    .userContentController()
    .addUserScript(script)
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/movable-area.js":
/*!*****************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/movable-area.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var CONSTANTS = __webpack_require__(/*! ./constants */ "./node_modules/sketch-module-web-view/lib/constants.js")

module.exports.injectScript = function(webView) {
  var source =
    '(function () {' +
    "document.addEventListener('mousedown', onMouseDown);" +
    '' +
    'function shouldDrag(target) {' +
    '  if (!target || (target.dataset || {}).appRegion === "no-drag") { return false }' +
    '  if ((target.dataset || {}).appRegion === "drag") { return true }' +
    '  return shouldDrag(target.parentElement)' +
    '};' +
    '' +
    'function onMouseDown(e) {console.log(e);' +
    '  if (e.button !== 0 || !shouldDrag(e.target)) { return }' +
    '  window.postMessage("' +
    CONSTANTS.START_MOVING_WINDOW +
    '");' +
    '};' +
    '})()'
  var script = WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly(
    source,
    0,
    true
  )
  webView
    .configuration()
    .userContentController()
    .addUserScript(script)
}

module.exports.setupHandler = function(browserWindow) {
  var initialMouseLocation = null
  var initialWindowPosition = null
  var interval = null

  function moveWindow() {
    // if the user released the button, stop moving the window
    if (!initialWindowPosition || NSEvent.pressedMouseButtons() !== 1) {
      clearInterval(interval)
      initialMouseLocation = null
      initialWindowPosition = null
      return
    }

    var mouse = NSEvent.mouseLocation()
    browserWindow.setPosition(
      initialWindowPosition.x + (mouse.x - initialMouseLocation.x),
      initialWindowPosition.y + (initialMouseLocation.y - mouse.y), // y is inverted
      false
    )
  }

  browserWindow.webContents.on(CONSTANTS.START_MOVING_WINDOW, function() {
    initialMouseLocation = NSEvent.mouseLocation()
    var position = browserWindow.getPosition()
    initialWindowPosition = {
      x: position[0],
      y: position[1],
    }

    interval = setInterval(moveWindow, 1000 / 60) // 60 fps
  })
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/parseWebArguments.js":
/*!**********************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/parseWebArguments.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(webArguments) {
  var args = null
  try {
    args = JSON.parse(webArguments)
  } catch (e) {
    // malformed arguments
  }

  if (
    !args ||
    !args.constructor ||
    args.constructor !== Array ||
    args.length == 0
  ) {
    return null
  }

  return args
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/set-delegates.js":
/*!******************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/set-delegates.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ObjCClass = __webpack_require__(/*! mocha-js-delegate */ "./node_modules/mocha-js-delegate/index.js")
var parseWebArguments = __webpack_require__(/*! ./parseWebArguments */ "./node_modules/sketch-module-web-view/lib/parseWebArguments.js")
var CONSTANTS = __webpack_require__(/*! ./constants */ "./node_modules/sketch-module-web-view/lib/constants.js")

// We create one ObjC class for ourselves here
var WindowDelegateClass
var NavigationDelegateClass
var WebScriptHandlerClass

// TODO: events
// - 'page-favicon-updated'
// - 'new-window'
// - 'did-navigate-in-page'
// - 'will-prevent-unload'
// - 'crashed'
// - 'unresponsive'
// - 'responsive'
// - 'destroyed'
// - 'before-input-event'
// - 'certificate-error'
// - 'found-in-page'
// - 'media-started-playing'
// - 'media-paused'
// - 'did-change-theme-color'
// - 'update-target-url'
// - 'cursor-changed'
// - 'context-menu'
// - 'select-bluetooth-device'
// - 'paint'
// - 'console-message'

module.exports = function(browserWindow, panel, webview, options) {
  if (!WindowDelegateClass) {
    WindowDelegateClass = new ObjCClass({
      utils: null,
      panel: null,

      'windowDidResize:': function() {
        this.utils.emit('resize')
      },

      'windowDidMiniaturize:': function() {
        this.utils.emit('minimize')
      },

      'windowDidDeminiaturize:': function() {
        this.utils.emit('restore')
      },

      'windowDidEnterFullScreen:': function() {
        this.utils.emit('enter-full-screen')
      },

      'windowDidExitFullScreen:': function() {
        this.utils.emit('leave-full-screen')
      },

      'windowDidMove:': function() {
        this.utils.emit('move')
        this.utils.emit('moved')
      },

      'windowShouldClose:': function() {
        var shouldClose = 1
        this.utils.emit('close', {
          get defaultPrevented() {
            return !shouldClose
          },
          preventDefault: function() {
            shouldClose = 0
          },
        })
        return shouldClose
      },

      'windowWillClose:': function() {
        this.utils.emit('closed')
      },

      'windowDidBecomeKey:': function() {
        this.utils.emit('focus', this.panel.currentEvent())
      },

      'windowDidResignKey:': function() {
        this.utils.emit('blur')
      },
    })
  }

  if (!NavigationDelegateClass) {
    NavigationDelegateClass = new ObjCClass({
      state: {
        wasReady: 0,
      },
      utils: null,

      // // Called when the web view begins to receive web content.
      'webView:didCommitNavigation:': function(webView) {
        this.utils.emit('will-navigate', {}, String(String(webView.URL())))
      },

      // // Called when web content begins to load in a web view.
      'webView:didStartProvisionalNavigation:': function() {
        this.utils.emit('did-start-navigation')
        this.utils.emit('did-start-loading')
      },

      // Called when a web view receives a server redirect.
      'webView:didReceiveServerRedirectForProvisionalNavigation:': function() {
        this.utils.emit('did-get-redirect-request')
      },

      // // Called when the web view needs to respond to an authentication challenge.
      // 'webView:didReceiveAuthenticationChallenge:completionHandler:': function(
      //   webView,
      //   challenge,
      //   completionHandler
      // ) {
      //   function callback(username, password) {
      //     completionHandler(
      //       0,
      //       NSURLCredential.credentialWithUser_password_persistence(
      //         username,
      //         password,
      //         1
      //       )
      //     )
      //   }
      //   var protectionSpace = challenge.protectionSpace()
      //   this.utils.emit(
      //     'login',
      //     {},
      //     {
      //       method: String(protectionSpace.authenticationMethod()),
      //       url: 'not implemented', // TODO:
      //       referrer: 'not implemented', // TODO:
      //     },
      //     {
      //       isProxy: !!protectionSpace.isProxy(),
      //       scheme: String(protectionSpace.protocol()),
      //       host: String(protectionSpace.host()),
      //       port: Number(protectionSpace.port()),
      //       realm: String(protectionSpace.realm()),
      //     },
      //     callback
      //   )
      // },

      // Called when an error occurs during navigation.
      // 'webView:didFailNavigation:withError:': function(
      //   webView,
      //   navigation,
      //   error
      // ) {},

      // Called when an error occurs while the web view is loading content.
      'webView:didFailProvisionalNavigation:withError:': function(
        webView,
        navigation,
        error
      ) {
        this.utils.emit('did-fail-load', error)
      },

      // Called when the navigation is complete.
      'webView:didFinishNavigation:': function() {
        if (this.state.wasReady == 0) {
          this.state.wasReady = 1
          this.utils.emitBrowserEvent('ready-to-show')
        }
        this.utils.emit('did-navigate')
        this.utils.emit('did-frame-navigate')
        this.utils.emit('did-stop-loading')
        this.utils.emit('did-finish-load')
        this.utils.emit('did-frame-finish-load')
      },

      // Called when the web view’s web content process is terminated.
      'webViewWebContentProcessDidTerminate:': function() {
        this.utils.emit('dom-ready')
      },

      // Decides whether to allow or cancel a navigation.
      // webView:decidePolicyForNavigationAction:decisionHandler:

      // Decides whether to allow or cancel a navigation after its response is known.
      // webView:decidePolicyForNavigationResponse:decisionHandler:
    })
  }

  if (!WebScriptHandlerClass) {
    WebScriptHandlerClass = new ObjCClass({
      utils: null,
      'userContentController:didReceiveScriptMessage:': function(_, message) {
        var args = this.utils.parseWebArguments(String(message.body()))
        if (!args) {
          return
        }
        if (!args[0] || typeof args[0] !== 'string') {
          return
        }
        args[0] = String(args[0])

        this.utils.emit.apply(this, args)
      },
    })
  }

  var navigationDelegate = NavigationDelegateClass.new({
    utils: {
      setTitle: browserWindow.setTitle.bind(browserWindow),
      emitBrowserEvent() {
        try {
          browserWindow.emit.apply(browserWindow, arguments)
        } catch (err) {
          if (
            typeof process !== 'undefined' &&
            process.listenerCount &&
            process.listenerCount('uncaughtException')
          ) {
            process.emit('uncaughtException', err, 'uncaughtException')
          } else {
            console.error(err)
            throw err
          }
        }
      },
      emit() {
        try {
          browserWindow.webContents.emit.apply(
            browserWindow.webContents,
            arguments
          )
        } catch (err) {
          if (
            typeof process !== 'undefined' &&
            process.listenerCount &&
            process.listenerCount('uncaughtException')
          ) {
            process.emit('uncaughtException', err, 'uncaughtException')
          } else {
            console.error(err)
            throw err
          }
        }
      },
    },
    state: {
      wasReady: 0,
    },
  })

  webview.setNavigationDelegate(navigationDelegate)

  var webScriptHandler = WebScriptHandlerClass.new({
    utils: {
      emit() {
        try {
          browserWindow.webContents.emit.apply(
            browserWindow.webContents,
            arguments
          )
        } catch (err) {
          if (
            typeof process !== 'undefined' &&
            process.listenerCount &&
            process.listenerCount('uncaughtException')
          ) {
            process.emit('uncaughtException', err, 'uncaughtException')
          } else {
            console.error(err)
            throw err
          }
        }
      },
      parseWebArguments: parseWebArguments,
    },
  })

  webview
    .configuration()
    .userContentController()
    .addScriptMessageHandler_name(webScriptHandler, CONSTANTS.JS_BRIDGE)

  var utils = {
    emit() {
      try {
        browserWindow.emit.apply(browserWindow, arguments)
      } catch (err) {
        if (
          typeof process !== 'undefined' &&
          process.listenerCount &&
          process.listenerCount('uncaughtException')
        ) {
          process.emit('uncaughtException', err, 'uncaughtException')
        } else {
          console.error(err)
          throw err
        }
      }
    },
  }
  if (options.modal) {
    // find the window of the document
    var msdocument
    if (options.parent.type === 'Document') {
      msdocument = options.parent.sketchObject
    } else {
      msdocument = options.parent
    }
    if (msdocument && String(msdocument.class()) === 'MSDocumentData') {
      // we only have an MSDocumentData instead of a MSDocument
      // let's try to get back to the MSDocument
      msdocument = msdocument.delegate()
    }
    utils.parentWindow = msdocument.windowForSheet()
  }

  var windowDelegate = WindowDelegateClass.new({
    utils: utils,
    panel: panel,
  })

  panel.setDelegate(windowDelegate)
}


/***/ }),

/***/ "./node_modules/sketch-module-web-view/lib/webview-api.js":
/*!****************************************************************!*\
  !*** ./node_modules/sketch-module-web-view/lib/webview-api.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(/*! events */ "events")
var executeJavaScript = __webpack_require__(/*! ./execute-javascript */ "./node_modules/sketch-module-web-view/lib/execute-javascript.js")

// let's try to match https://github.com/electron/electron/blob/master/docs/api/web-contents.md
module.exports = function buildAPI(browserWindow, panel, webview) {
  var webContents = new EventEmitter()

  webContents.loadURL = browserWindow.loadURL

  webContents.loadFile = function(/* filePath */) {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }

  webContents.downloadURL = function(/* filePath */) {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }

  webContents.getURL = function() {
    return String(webview.url())
  }

  webContents.getTitle = function() {
    return String(webview.title())
  }

  webContents.isDestroyed = function() {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }

  webContents.focus = browserWindow.focus
  webContents.isFocused = browserWindow.isFocused

  webContents.isLoading = function() {
    return !!webview.loading()
  }

  webContents.isLoadingMainFrame = function() {
    // TODO:
    return !!webview.loading()
  }

  webContents.isWaitingForResponse = function() {
    return !webview.loading()
  }

  webContents.stop = function() {
    webview.stopLoading()
  }
  webContents.reload = function() {
    webview.reload()
  }
  webContents.reloadIgnoringCache = function() {
    webview.reloadFromOrigin()
  }
  webContents.canGoBack = function() {
    return !!webview.canGoBack()
  }
  webContents.canGoForward = function() {
    return !!webview.canGoForward()
  }
  webContents.canGoToOffset = function(offset) {
    return !!webview.backForwardList().itemAtIndex(offset)
  }
  webContents.clearHistory = function() {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.goBack = function() {
    webview.goBack()
  }
  webContents.goForward = function() {
    webview.goForward()
  }
  webContents.goToIndex = function(index) {
    var backForwardList = webview.backForwardList()
    var backList = backForwardList.backList()
    var backListLength = backList.count()
    if (backListLength > index) {
      webview.loadRequest(NSURLRequest.requestWithURL(backList[index]))
      return
    }
    var forwardList = backForwardList.forwardList()
    if (forwardList.count() > index - backListLength) {
      webview.loadRequest(
        NSURLRequest.requestWithURL(forwardList[index - backListLength])
      )
      return
    }
    throw new Error('Cannot go to index ' + index)
  }
  webContents.goToOffset = function(offset) {
    if (!webContents.canGoToOffset(offset)) {
      throw new Error('Cannot go to offset ' + offset)
    }
    webview.loadRequest(
      NSURLRequest.requestWithURL(webview.backForwardList().itemAtIndex(offset))
    )
  }
  webContents.isCrashed = function() {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.setUserAgent = function(/* userAgent */) {
    // TODO:
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.getUserAgent = function() {
    const userAgent = webview.customUserAgent()
    return userAgent ? String(userAgent) : undefined
  }
  webContents.insertCSS = function(css) {
    var source =
      "var style = document.createElement('style'); style.innerHTML = " +
      css.replace(/"/, '\\"') +
      '; document.head.appendChild(style);'
    var script = WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly(
      source,
      0,
      true
    )
    webview
      .configuration()
      .userContentController()
      .addUserScript(script)
  }
  webContents.insertJS = function(source) {
    var script = WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly(
      source,
      0,
      true
    )
    webview
      .configuration()
      .userContentController()
      .addUserScript(script)
  }
  webContents.executeJavaScript = executeJavaScript(webview, browserWindow)
  webContents.setIgnoreMenuShortcuts = function() {
    // TODO:??
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.setAudioMuted = function(/* muted */) {
    // TODO:??
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.isAudioMuted = function() {
    // TODO:??
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.setZoomFactor = function(factor) {
    webview.setMagnification_centeredAtPoint(factor, CGPointMake(0, 0))
  }
  webContents.getZoomFactor = function(callback) {
    callback(Number(webview.magnification()))
  }
  webContents.setZoomLevel = function(level) {
    // eslint-disable-next-line no-restricted-properties
    webContents.setZoomFactor(Math.pow(1.2, level))
  }
  webContents.getZoomLevel = function(callback) {
    // eslint-disable-next-line no-restricted-properties
    callback(Math.log(Number(webview.magnification())) / Math.log(1.2))
  }
  webContents.setVisualZoomLevelLimits = function(/* minimumLevel, maximumLevel */) {
    // TODO:??
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }
  webContents.setLayoutZoomLevelLimits = function(/* minimumLevel, maximumLevel */) {
    // TODO:??
    console.warn(
      'Not implemented yet, please open a PR on https://github.com/skpm/sketch-module-web-view :)'
    )
  }

  // TODO:
  // webContents.undo = function() {
  //   webview.undoManager().undo()
  // }
  // webContents.redo = function() {
  //   webview.undoManager().redo()
  // }
  // webContents.cut = webview.cut
  // webContents.copy = webview.copy
  // webContents.paste = webview.paste
  // webContents.pasteAndMatchStyle = webview.pasteAsRichText
  // webContents.delete = webview.delete
  // webContents.replace = webview.replaceSelectionWithText

  webContents.send = function() {
    const script =
      'window.postMessage({' +
      'isSketchMessage: true,' +
      "origin: '" +
      String(__command.identifier()) +
      "'," +
      'args: ' +
      JSON.stringify([].slice.call(arguments)) +
      '}, "*")'
    webview.evaluateJavaScript_completionHandler(script, null)
  }

  webContents.getNativeWebview = function() {
    return webview
  }

  browserWindow.webContents = webContents
}


/***/ }),

/***/ "./src/sidePanel.js":
/*!**************************!*\
  !*** ./src/sidePanel.js ***!
  \**************************/
/*! exports provided: onToggleSidePanel, onOpenDocument, onCloseDocument, onShutdown */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onToggleSidePanel", function() { return onToggleSidePanel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onOpenDocument", function() { return onOpenDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onCloseDocument", function() { return onCloseDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onShutdown", function() { return onShutdown; });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./state */ "./src/state.js");
/* harmony import */ var _webview_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webview/index */ "./src/webview/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/utils/index.js");



/**
 * insertSidePanel 插入侧边栏
 * @param {*} toolbar
 * @param {*} identifier
 * @param {*} isInsert  默认插入，已插入删除
 */

var insertSidePanel = function insertSidePanel(toolbar, identifier) {
  var isInsert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var contentView = _state__WEBPACK_IMPORTED_MODULE_0__["context"].document.documentWindow().contentView();
  var stageView = contentView.subviews().objectAtIndex(0);
  var views = stageView.subviews();
  var existId = isInsert || views.find(function (d) {
    return ''.concat(d.identifier()) === identifier;
  });
  var finalViews = [];
  var pushedWebView = false;

  for (var i = 0; i < views.count(); i++) {
    var view = views[i];

    if (existId) {
      if (''.concat(view.identifier()) !== identifier) finalViews.push(view);
    } else {
      finalViews.push(view);

      if (!pushedWebView && ''.concat(view.identifier()) === 'view_canvas') {
        finalViews.push(toolbar);
        pushedWebView = true;
      }
    }
  }

  if (pushedWebView) {
    Object(_utils__WEBPACK_IMPORTED_MODULE_2__["setSettingForKey"])(_state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"], 'true');
  } else {
    Object(_utils__WEBPACK_IMPORTED_MODULE_2__["removeSettingForKey"])(_state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"]);
  }

  stageView.subviews = finalViews;
  stageView.adjustSubviews();
};

var onToggleSidePanel = function onToggleSidePanel(context) {
  console.error('✅✅ 展示 plugins'); // register context

  Object(_state__WEBPACK_IMPORTED_MODULE_0__["default"])(context);
  var threadDictionary = NSThread.mainThread().threadDictionary();

  if (threadDictionary[_state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"]]) {
    insertSidePanel(threadDictionary[_state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"]], _state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"], true);
    onShutdown();
    return;
  } // Long-running script


  COScript.currentCOScript().setShouldKeepAround(true);
  Object(_utils__WEBPACK_IMPORTED_MODULE_2__["observerWindowResizeNotification"])(function () {
    var curWebView = _webview_index__WEBPACK_IMPORTED_MODULE_1__["BrowserManage"].getCurrent();

    if (curWebView) {
      curWebView.updatePosition();
    }
  });
  var toolbar = NSStackView.alloc().initWithFrame(NSMakeRect(0, 0, 40, 400));
  threadDictionary[_state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"]] = toolbar;
  toolbar.identifier = _state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"];
  toolbar.setSpacing(8);
  toolbar.setFlipped(true);
  toolbar.setBackgroundColor(NSColor.windowBackgroundColor());
  toolbar.orientation = 1;
  toolbar.addView_inGravity(Object(_utils__WEBPACK_IMPORTED_MODULE_2__["createImageView"])(NSMakeRect(0, 0, 40, 22), 'transparent', NSMakeSize(40, 22)), 1);
  var Logo = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["createImageView"])(NSMakeRect(0, 0, 40, 30), 'logo', NSMakeSize(40, 28));
  toolbar.addSubview(Logo);
  _state__WEBPACK_IMPORTED_MODULE_0__["Menus"].map(function (item, index) {
    var _item$rect = item.rect,
        rect = _item$rect === void 0 ? NSMakeRect(0, 0, 40, 40) : _item$rect,
        _item$size = item.size,
        size = _item$size === void 0 ? NSMakeSize(24, 24) : _item$size,
        icon = item.icon,
        activeIcon = item.activeIcon,
        tooltip = item.tooltip,
        identifier = item.identifier,
        wkIdentifier = item.wkIdentifier,
        _item$type = item.type,
        type = _item$type === void 0 ? 2 : _item$type,
        _item$inGravityType = item.inGravityType,
        inGravityType = _item$inGravityType === void 0 ? 1 : _item$inGravityType,
        url = item.url;
    var Button = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["addButton"])({
      rect: rect,
      size: size,
      icon: icon,
      activeIcon: activeIcon,
      tooltip: tooltip,
      identifier: identifier,
      type: type,
      callAction: function callAction(sender) {
        // log('sender', sender)
        var threadDictionary = NSThread.mainThread().threadDictionary();
        var menuBtnRegExp = new RegExp("".concat(_state__WEBPACK_IMPORTED_MODULE_0__["IdentifierPrefix"], "-menu*"));

        for (var k in threadDictionary) {
          if (menuBtnRegExp.test(k) && k !== identifier) {
            threadDictionary[k].setState(NSOffState);
          }
        }

        var options = {
          sender: sender,
          identifier: wkIdentifier,
          frame: false,
          show: false,
          width: 320,
          height: 480,
          inGravityType: inGravityType,
          url: url
        };

        var _ref = new _webview_index__WEBPACK_IMPORTED_MODULE_1__["Browser"](options),
            browserWindow = _ref.browserWindow;

        var webView = browserWindow.webContents;
        webView.on('did-start-loading', function () {// console.error('did-start-loading')
        });
        webView.on('did-finish-load', function () {// console.error('did-finish-load')
        });
        webView.on('openView', function (options) {// console.error('openViewopenView')
        });
      }
    });
    threadDictionary[identifier] = Button;
    toolbar.addView_inGravity(Object(_utils__WEBPACK_IMPORTED_MODULE_2__["createBoxSeparator"])(), inGravityType);
    toolbar.addView_inGravity(Button, inGravityType);
    if (icon === 'fill') toolbar.addView_inGravity(Object(_utils__WEBPACK_IMPORTED_MODULE_2__["createBoxSeparator"])(), inGravityType);
    if (index === _state__WEBPACK_IMPORTED_MODULE_0__["Menus"].length - 1) toolbar.addView_inGravity(Object(_utils__WEBPACK_IMPORTED_MODULE_2__["createImageView"])(NSMakeRect(0, 0, 40, 8), 'transparent'), 3);
  });
  insertSidePanel(toolbar, _state__WEBPACK_IMPORTED_MODULE_0__["SidePanelIdentifier"]);
};
var onOpenDocument = function onOpenDocument() {};
var onCloseDocument = function onCloseDocument(context) {
  Object(_state__WEBPACK_IMPORTED_MODULE_0__["default"])(context);
  onShutdown();
}; // handler cleanly Long-running script

function onShutdown() {
  // console.error('✅✅ my-plugins onShutdown')
  var threadDictionary = NSThread.mainThread().threadDictionary();
  _webview_index__WEBPACK_IMPORTED_MODULE_1__["BrowserManage"].empty();
  var prefixRegExp = new RegExp("".concat(_state__WEBPACK_IMPORTED_MODULE_0__["IdentifierPrefix"], "*"));
  var webViewPrefixRegExp = new RegExp("".concat(_state__WEBPACK_IMPORTED_MODULE_0__["IdentifierPrefix"], "-webview*")); // clear MSClass

  for (var key in threadDictionary) {
    if (prefixRegExp.test(key)) {
      if (webViewPrefixRegExp.test(key)) {
        threadDictionary[key].close();
      }

      threadDictionary.removeObjectForKey(key);
    }
  } // clear WindowResizeNotification


  Object(_utils__WEBPACK_IMPORTED_MODULE_2__["removeObserverWindowResizeNotification"])();
  COScript.currentCOScript().setShouldKeepAround(false);
}

/***/ }),

/***/ "./src/state.js":
/*!**********************!*\
  !*** ./src/state.js ***!
  \**********************/
/*! exports provided: context, document, version, sketchVersion, pluginFolderPath, resourcesPath, documentObjectID, IdentifierPrefix, SidePanelIdentifier, WINDOW_MOVE_INSTANCE, WINDOW_MOVE_SELECTOR, Menus, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "context", function() { return context; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "document", function() { return document; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sketchVersion", function() { return sketchVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluginFolderPath", function() { return pluginFolderPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resourcesPath", function() { return resourcesPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentObjectID", function() { return documentObjectID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IdentifierPrefix", function() { return IdentifierPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidePanelIdentifier", function() { return SidePanelIdentifier; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WINDOW_MOVE_INSTANCE", function() { return WINDOW_MOVE_INSTANCE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WINDOW_MOVE_SELECTOR", function() { return WINDOW_MOVE_SELECTOR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Menus", function() { return Menus; });
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sketch */ "sketch");
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sketch__WEBPACK_IMPORTED_MODULE_0__);

var context;
var document;
var version;
var sketchVersion;
var pluginFolderPath;
var resourcesPath;
var documentObjectID;
var IdentifierPrefix;
var SidePanelIdentifier;
var WINDOW_MOVE_INSTANCE;
var WINDOW_MOVE_SELECTOR;
var Menus;

function updateIdentifier(objectID) {
  IdentifierPrefix = objectID ? "sketch-plugin-boilerplate-".concat(objectID) : 'sketch-plugin-boilerplate';
  SidePanelIdentifier = "".concat(IdentifierPrefix, "-side-panel");
  WINDOW_MOVE_INSTANCE = "window-move-instance-".concat(objectID);
  WINDOW_MOVE_SELECTOR = "window-move-selector-".concat(objectID);
  Menus = [{
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'artboard',
    activeIcon: 'artboard-active',
    tooltip: '上传画板',
    identifier: "".concat(IdentifierPrefix, "-menu.artboard"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.artboard"),
    type: 2,
    inGravityType: 1,
    url: 'https://aotu.io'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'icon',
    activeIcon: 'icon-active',
    tooltip: '图标',
    identifier: "".concat(IdentifierPrefix, "-menu.icon"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.icon"),
    type: 2,
    inGravityType: 1,
    url: 'https://docs.pfan123.com/'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'component',
    activeIcon: 'component-active',
    tooltip: '组件',
    identifier: "".concat(IdentifierPrefix, "-menu.component"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.component"),
    type: 2,
    inGravityType: 1,
    url: 'https://m.baidu.com/'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'palette',
    activeIcon: 'palette-active',
    tooltip: '调色板',
    identifier: "".concat(IdentifierPrefix, "-menu.palette"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.palette"),
    type: 2,
    inGravityType: 1,
    url: 'https://aotu.io/'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'fill',
    activeIcon: 'fill-active',
    tooltip: '填充',
    identifier: "".concat(IdentifierPrefix, "-menu.fill"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.fill"),
    type: 2,
    inGravityType: 1,
    url: 'https://aotu.io/'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'help',
    activeIcon: 'help-active',
    tooltip: '帮助中心',
    identifier: "".concat(IdentifierPrefix, "-menu.help"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.help"),
    type: 2,
    inGravityType: 3,
    url: 'https://aotu.io/'
  }, {
    rect: NSMakeRect(0, 0, 40, 40),
    size: NSMakeSize(24, 24),
    icon: 'setting',
    activeIcon: 'setting-active',
    tooltip: '设置',
    identifier: "".concat(IdentifierPrefix, "-menu.setting"),
    wkIdentifier: "".concat(IdentifierPrefix, "-webview.setting"),
    type: 2,
    inGravityType: 3,
    url: 'https://aotu.io/'
  }];
}

function getPluginFolderPath(context) {
  // Get absolute folder path of plugin
  var split = context.scriptPath.split('/');
  split.splice(-3, 3);
  return split.join('/');
}

/* harmony default export */ __webpack_exports__["default"] = (function (ctx) {
  context = ctx;
  document = context.document || context.actionContext.document || MSDocument.currentDocument();
  documentObjectID = document.documentData().objectID();
  updateIdentifier(documentObjectID); // eslint-disable-next-line no-new-wrappers

  version = new String(context.plugin.version()).toString(); //Sketch 66 已移除 context.api()  Javascript API (v1.0)
  // sketchVersion = new String(context.api().version).toString()
  // eslint-disable-next-line no-new-wrappers

  sketchVersion = new String(sketch__WEBPACK_IMPORTED_MODULE_0___default.a.version.sketch).toString();
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
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state */ "./src/state.js");

/**
 * getImageURL 获取 icon 路径
 * @param {*} name
 */

var getImageURL = function getImageURL(name) {
  var isRetinaDisplay = NSScreen.mainScreen().backingScaleFactor() > 1;
  var suffix = isRetinaDisplay ? '@2x' : '';
  var pluginSketch = _state__WEBPACK_IMPORTED_MODULE_0__["context"].plugin.url();
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
/*! exports provided: getImageURL, createImage, createImageView, createBoxSeparator, addButton, createBounds, createPanel, createView, createBox, createTextField, getSketchSelected, getSelected, getScriptExecPath, getDocumentID, getDocumentPath, getDocumentName, dumpLayer, dumpSymbol, penUrlInBrowser, getNewUUID, getThreadDictForKey, setThreadDictForKey, removeThreadDictForKey, getSettingForKey, setSettingForKey, removeSettingForKey, showPluginsPane, showLibrariesPane, getSystemVersion, getPluginVersion, reloadPlugins, getFileContentFromModal, getSavePathFromModal, observerWindowResizeNotification, removeObserverWindowResizeNotification, File */
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

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocumentID", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getDocumentID"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocumentPath", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getDocumentPath"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocumentName", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["getDocumentName"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dumpLayer", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["dumpLayer"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dumpSymbol", function() { return _selector__WEBPACK_IMPORTED_MODULE_1__["dumpSymbol"]; });

/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system */ "./src/utils/system.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "penUrlInBrowser", function() { return _system__WEBPACK_IMPORTED_MODULE_2__["penUrlInBrowser"]; });

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
/*! exports provided: getSketchSelected, getSelected, getScriptExecPath, getDocumentID, getDocumentPath, getDocumentName, dumpLayer, dumpSymbol */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSketchSelected", function() { return getSketchSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSelected", function() { return getSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScriptExecPath", function() { return getScriptExecPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentID", function() { return getDocumentID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentPath", function() { return getDocumentPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentName", function() { return getDocumentName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpLayer", function() { return dumpLayer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpSymbol", function() { return dumpSymbol; });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state */ "./src/state.js");
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
  var document = _state__WEBPACK_IMPORTED_MODULE_0__["context"].document; // 获取 sketch 当前 document

  var plugin = _state__WEBPACK_IMPORTED_MODULE_0__["context"].plugin;
  var command = _state__WEBPACK_IMPORTED_MODULE_0__["context"].command;
  var page = document.currentPage(); // 当前被选择的 page

  var artboards = page.artboards(); // 所有的画板

  var selectedArtboard = page.currentArtboard(); // 当前被选择的画板

  var selection = _state__WEBPACK_IMPORTED_MODULE_0__["context"].selection; // 当前选择图层

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
 * document 获取所选择 document objectID
 */

var getDocumentID = function getDocumentID() {
  return _state__WEBPACK_IMPORTED_MODULE_0__["context"].document.documentData().objectID();
};
/**
 * getDocumentPath 获取所选择 document 路径
 */

var getDocumentPath = function getDocumentPath() {
  var Document = _state__WEBPACK_IMPORTED_MODULE_0__["context"].document;
  return Document.fileURL() ? Document.fileURL().path() : nil;
};
/**
 * getDocumentName 获取所选择 document name
 */

var getDocumentName = function getDocumentName() {
  return getDocumentPath(_state__WEBPACK_IMPORTED_MODULE_0__["context"]) ? getDocumentPath(_state__WEBPACK_IMPORTED_MODULE_0__["context"]).lastPathComponent() : nil;
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
/*! exports provided: penUrlInBrowser, getNewUUID, getThreadDictForKey, setThreadDictForKey, removeThreadDictForKey, getSettingForKey, setSettingForKey, removeSettingForKey, showPluginsPane, showLibrariesPane, getSystemVersion, getPluginVersion, reloadPlugins, getFileContentFromModal, getSavePathFromModal, observerWindowResizeNotification, removeObserverWindowResizeNotification */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "penUrlInBrowser", function() { return penUrlInBrowser; });
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
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../state */ "./src/state.js");


/**
 * openUrlInBrowser 浏览器打开链接
 * @param {string} url
 */

var penUrlInBrowser = function penUrlInBrowser(url) {
  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
};
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
  return _state__WEBPACK_IMPORTED_MODULE_1__["context"].plugin.version();
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
  if (!getThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_INSTANCE"])) {
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
    setThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_INSTANCE"], delegateInstance);
    setThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_SELECTOR"], Selector);
  }
};
/**
 * removeObserverWindowResizeNotification 清除监听窗口resize
 * @param {*} fn
 */

var removeObserverWindowResizeNotification = function removeObserverWindowResizeNotification() {
  var delegateInstance = getThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_INSTANCE"]);

  if (delegateInstance) {
    NSNotificationCenter.defaultCenter().removeObserver_name_object(delegateInstance, NSWindowDidResizeNotification, nil);
    removeThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_INSTANCE"]);
    removeThreadDictForKey(_state__WEBPACK_IMPORTED_MODULE_1__["WINDOW_MOVE_SELECTOR"]);
  }
};

/***/ }),

/***/ "./src/webview/index.js":
/*!******************************!*\
  !*** ./src/webview/index.js ***!
  \******************************/
/*! exports provided: BrowserManage, Browser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BrowserManage", function() { return BrowserManage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Browser", function() { return Browser; });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state */ "./src/state.js");
/* harmony import */ var sketch_module_web_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! sketch-module-web-view */ "./node_modules/sketch-module-web-view/lib/index.js");
/* harmony import */ var sketch_module_web_view__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(sketch_module_web_view__WEBPACK_IMPORTED_MODULE_1__);
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var BrowserManage = {
  list: [],
  add: function add(browser) {
    this.list.push(browser);
  },
  get: function get(identifier) {
    return this.list.find(function (d) {
      return d.identifier === identifier;
    });
  },
  getCurrent: function getCurrent() {
    return this.list.find(function (d) {
      return d.browserWindow.isVisible();
    });
  },
  empty: function empty() {
    this.list = [];
  }
};

var getAbsScreenOfTop = function getAbsScreenOfTop() {
  var contentView = _state__WEBPACK_IMPORTED_MODULE_0__["document"].documentWindow().contentView();
  var width = contentView.frame().size.width;
  var height = contentView.frame().size.height;
  var x = contentView.frame().origin.x;
  var y = contentView.frame().origin.y;
  var rect = _state__WEBPACK_IMPORTED_MODULE_0__["document"].window().convertRectToScreen(NSMakeRect(x, y, width, height));
  return rect;
};

var getAbsWindowOfView = function getAbsWindowOfView(button) {
  var bounds = button.bounds();
  var width = bounds.size.width;
  var height = bounds.size.height;
  var x = bounds.origin.x;
  var y = bounds.origin.y;
  return button.convertRect_toView(NSMakeRect(x, y, width, height), nil);
};

var Browser =
/*#__PURE__*/
function () {
  function Browser(options) {
    var _this = this;

    _classCallCheck(this, Browser);

    this.options = Object.assign({
      width: 290,
      height: 550,
      minimizable: false,
      resizable: false,
      transparent: false,
      closable: false,
      center: false,
      alwaysOnTop: true,
      titleBarStyle: 'hiddenInset',
      frame: false,
      show: false
    }, options);
    this.identifier = options.identifier;
    BrowserManage.list.forEach(function (d) {
      if (d.identifier != _this.identifier) {
        if (d.browserWindow.isVisible()) {
          d.hide();
        }
      }
    });
    var existBrowser = BrowserManage.get(options.identifier);

    if (existBrowser) {
      if (existBrowser.browserWindow.isVisible()) {
        existBrowser.hide();
      } else {
        existBrowser.show();
      }

      return existBrowser;
    }

    this.browserWindow = new sketch_module_web_view__WEBPACK_IMPORTED_MODULE_1___default.a(options);
    options.url && this.browserWindow.loadURL(options.url);

    this.browserWindow._panel.setStyleMask(NSWindowStyleMaskDocModalWindow);

    BrowserManage.add(this);
    this.show();
  }

  _createClass(Browser, [{
    key: "show",
    value: function show() {
      this.updatePosition();
      var documentWindow = _state__WEBPACK_IMPORTED_MODULE_0__["context"].document.documentWindow();
      documentWindow.addChildWindow_ordered(this.browserWindow._panel, true);
      this.browserWindow.show();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.browserWindow.hide();

      if (this.browserWindow.webContents) {
        this.browserWindow.webContents.removeAllListeners();
      }
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      var _this$options = this.options,
          sender = _this$options.sender,
          inGravityType = _this$options.inGravityType;

      var _this$browserWindow$g = this.browserWindow.getSize(),
          _this$browserWindow$g2 = _slicedToArray(_this$browserWindow$g, 2),
          width = _this$browserWindow$g2[0],
          height = _this$browserWindow$g2[1];

      var winRect = getAbsScreenOfTop();
      var senderRect = getAbsWindowOfView(sender);
      var x = winRect.origin.x + senderRect.origin.x - sender.frame().origin.x - width - 1;

      if (inGravityType === 1) {
        var y = winRect.origin.y + senderRect.origin.y + 24 - height + 8;

        this.browserWindow._panel.setFrame_display(NSMakeRect(x, y, width, height), true);
      } else if (inGravityType === 3) {
        var _y = winRect.origin.y;

        this.browserWindow._panel.setFrame_display(NSMakeRect(x, _y, width, height), true);
      }
    }
  }]);

  return Browser;
}();

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

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
globalThis['onToggleSidePanel'] = __skpm_run.bind(this, 'onToggleSidePanel');
globalThis['onOpenDocument'] = __skpm_run.bind(this, 'onOpenDocument');
globalThis['onCloseDocument'] = __skpm_run.bind(this, 'onCloseDocument');
globalThis['onShutdown'] = __skpm_run.bind(this, 'onShutdown');
globalThis['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=sidePanel.js.map