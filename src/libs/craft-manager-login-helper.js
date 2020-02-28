/* global NSURL NSDistributedNotificationCenter NSSelectorFromString NSWorkspace */

/*
  Client for the Craft Mgr Login
  which presents InVision authentication UI and provides login tokens.
*/

const util = require('./util');
const debug = util.debug;

const SignInStateChangedNotification = 'CMSignInStateChangedNotification';
const SignOutStateChangedNotification = 'CMSignOutStateChangedNotification';

function CraftLoginHelper(callbackOptions) {

  this.onStateChange = callbackOptions.onStateChange;
  this.onLogout = callbackOptions.onLogout;

  this.notificationHandler = util.createCocoaObject({
    'handleLogin:': function() {
      debug('craft login');

      if (this.onStateChange) {
        this.onStateChange();
      }
    }.bind(this),

    'handleLogout:': function() {
      debug('craft logout');
      this.onLogout();
    }.bind(this)
  });

  this.notificationCenter = NSDistributedNotificationCenter.defaultCenter();

  // Listen for notifications.
  this.notificationCenter.addObserver_selector_name_object(
    this.notificationHandler,
    NSSelectorFromString('handleLogin:'),
    SignInStateChangedNotification,
    null
  );

  this.notificationCenter.addObserver_selector_name_object(
    this.notificationHandler,
    NSSelectorFromString('handleLogout:'),
    SignOutStateChangedNotification,
    null
  );
}

CraftLoginHelper.prototype.displayLoginWindow = function(callbackOptions) {
  this.onStateChange = callbackOptions.onStateChange;

  // Not checking for craft existence, because on failure we will try login helper option
  var url = NSURL.URLWithString('craft://invisionapp.com/signin');
  NSWorkspace.sharedWorkspace().openURL(url);
};

CraftLoginHelper.prototype.stopListening = function() {
  // When name argument is null, removes ALL notifications for observer.
  this.notificationCenter.removeObserver_name_object(this.notificationHandler, null, null);
};

CraftLoginHelper.prototype.sendLogoutNotification = function() {
  try {
    var url = NSURL.URLWithString('craft://invisionapp.com/signout');
    NSWorkspace.sharedWorkspace().openURL(url);
  } catch (err) {
    debug('error in calling craft logout');
    debug(err);
  }
};

module.exports = CraftLoginHelper;
