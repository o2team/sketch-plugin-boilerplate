/*
  global
  MSDocument
  NSNotificationCenter
  NSSelectorFromString
  NSUserDefaults
  NSWindowWillCloseNotification
*/

// Help users discover the plugin’s keyboard shortcut for showing/hiding the
// main panel by displaying a notification when they first close the panel.

const util = require('./util');
const UI = require('./ui');

const hasShownPluginKeyboardShortcutMessageDefaultsKey =
  util.getDefaultsKey('HasShownPluginKeyboardShortcutMessage');

function initKeyboardShortcutDiscoveryMessage(nib) {
  if (hasNotShownPluginKeyboardShortcutMessage()) {
    const notificationHandler = util.createCocoaObject({
      'handleWindowClosed:': function(notification) {
        if (UI.isMainPluginWindow(notification.object()) && hasNotShownPluginKeyboardShortcutMessage()) {
          const document = MSDocument.currentDocument();
          if (document) {
            (new UI(nib)).showDocumentMessage(document, {
              message: 'Quickly show and hide Design Systems Manager by pressing ⌘L',
              action: {
                message: 'Got it'
              }
            });
            setHasShownHideShowKeyboardShortcutMessage();
          }
        }
      }
    });

    const notificationCenter = NSNotificationCenter.defaultCenter();
    notificationCenter.addObserver_selector_name_object(
      notificationHandler,
      NSSelectorFromString('handleWindowClosed:'),
      NSWindowWillCloseNotification,
      null
    );
  }
}

function hasNotShownPluginKeyboardShortcutMessage() {
  return !NSUserDefaults.standardUserDefaults().boolForKey(hasShownPluginKeyboardShortcutMessageDefaultsKey);
}

function setHasShownHideShowKeyboardShortcutMessage() {
  NSUserDefaults.standardUserDefaults().setObject_forKey(true, hasShownPluginKeyboardShortcutMessageDefaultsKey);
}

module.exports = initKeyboardShortcutDiscoveryMessage;
