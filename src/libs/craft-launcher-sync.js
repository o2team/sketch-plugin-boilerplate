/* global NSNotificationCenter NSSelectorFromString NSWindowDidBecomeKeyNotification NSWindowWillCloseNotification MSDocumentController ICPanelsManager */

// Keep the buttons in the Craft Panel launcher in sync with
// the state of the main plugin window, e.g. when the window
// appears, the button in the launcher should become active.

const $ = require('./collection-helpers');
const util = require('./util');
const UI = require('./ui');

function initCraftLauncherSync(pluginIdentifier) {
  const notificationHandler = util.createCocoaObject({
    'handleWindowOpened:': function(notification) {
      if (UI.isMainPluginWindow(notification.object())) {
        forEachCraftDocumentManager(function(craftDocumentManager) {
          craftDocumentManager.openPlugin(pluginIdentifier);
        });
      }
    },

    'handleWindowClosed:': function(notification) {
      if (UI.isMainPluginWindow(notification.object())) {
        forEachCraftDocumentManager(function(craftDocumentManager) {
          craftDocumentManager.closePlugin(pluginIdentifier);
        });
      }
    }
  });

  const notificationCenter = NSNotificationCenter.defaultCenter();
  notificationCenter.addObserver_selector_name_object(
    notificationHandler,
    NSSelectorFromString('handleWindowOpened:'),
    NSWindowDidBecomeKeyNotification,
    null
  );
  notificationCenter.addObserver_selector_name_object(
    notificationHandler,
    NSSelectorFromString('handleWindowClosed:'),
    NSWindowWillCloseNotification,
    null
  );
}

function forEachCraftDocumentManager(func) {
  if (typeof ICPanelsManager !== 'undefined') {
    const craftPanelsManager = ICPanelsManager.sharedManager();
    const allOpenDocuments = MSDocumentController.sharedDocumentController().documents();
    $.forEach(allOpenDocuments, function(document) {
      const craftDocumentManager = craftPanelsManager.getManagerFromDocument(document);
      if (craftDocumentManager) {
        func(craftDocumentManager);
      }
    });
  }
}

module.exports = initCraftLauncherSync;
