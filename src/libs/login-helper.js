/* global NSDistributedNotificationCenter NSSelectorFromString NSWorkspace NSWorkspaceLaunchNewInstance NSStringFromRect NSBundle NSClassFromString displayAlert */

/*
  Client for the Craft Login Helper
  (https://github.com/InVisionApp/craft-panels/tree/master/
  Panels/LoginHelper) which presents InVision authentication
  UI and provides login tokens.
*/

const util = require('./util');
const debug = util.debug;

const StateChangedNotification = 'ICSyncPanelStateDidChangeNotification';
const ConfigChangedNotification = 'ICSyncPanelConfigChangedNotification';
const LogoutNotification = 'ICCraftLogoutNotification';

const ViewState = {
  Welcome:            0,
  SignIn:             1,
  Sync:               2,
  Enterprise:         3,
  EnterpriseSignIn:   4,
  OnboardingMessage:  5
};

function LoginHelper(callbackOptions) {

  this.onConfigChange = callbackOptions.onConfigChange;
  this.onStateChange = callbackOptions.onStateChange;
  this.onLogout = callbackOptions.onLogout;
  this.onWindowClosed = callbackOptions.onWindowClosed;

  this.notificationHandler = util.createCocoaObject({
    'handleStateChange:': function(notification) {
      debug('handleStateChange');
      debug(notification.userInfo());
      this.loginHelperVisible = false;
      const userInfo = notification.userInfo();
      const viewState = notification.object() && notification.object().integerValue();
      if (userInfo) {
        if (this.onStateChange) {
          this.onStateChange(userInfo['accessToken'], userInfo['refreshToken'], viewState);
        }
      } else {
        // When there is no userInfo, that means the user
        // closed the Login Helper window.
        if (this.onWindowClosed) {
          this.onWindowClosed();
        }
      }
    }.bind(this),

    'handleConfigChange:': function(notification) {
      debug('handleConfigChange');
      const userInfo = notification.userInfo();
      if (userInfo) {
        var configurationManifest = userInfo['configurationManifest'];
        var domainInfo = userInfo['domainInfo'];
        debug(userInfo);
        debug(configurationManifest);
        if (this.onConfigChange) {
          this.onConfigChange(configurationManifest && configurationManifest['signOnType'], domainInfo);
        }
      }
    }.bind(this),

    'handleLogout:': function() {
      debug('handleLogoutChange');
      // if (this.onLogout) {
      //   this.onLogout();
      // }
    }.bind(this)
  });

  this.notificationCenter = NSDistributedNotificationCenter.defaultCenter();

  // Listen for notifications.
  this.notificationCenter.addObserver_selector_name_object(
    this.notificationHandler,
    NSSelectorFromString('handleStateChange:'),
    StateChangedNotification,
    null
  );

  this.notificationCenter.addObserver_selector_name_object(
    this.notificationHandler,
    NSSelectorFromString('handleConfigChange:'),
    ConfigChangedNotification,
    null
  );

  this.notificationCenter.addObserver_selector_name_object(
    this.notificationHandler,
    NSSelectorFromString('handleLogout:'),
    LogoutNotification,
    null
  );
}

LoginHelper.prototype.displayLoginWindow = function(frame, callbackOptions) {

  if (this.loginHelperVisible) {
    return;
  }

  this.onStateChange = callbackOptions.onStateChange;

  this.loginHelperVisible = true;

  const frameString = NSStringFromRect(frame);
  const url = NSBundle.bundleForClass(NSClassFromString('ICPanelsManager'))
    .URLForResource_withExtension('LoginHelper', 'app');

  if (!url) {
    displayAlert({
      style: 'error',
      title: 'Please Install Craft',
      description: 'DSM requires Craft to be installed.'
    });
    return;
  }

  const config = {
    NSWorkspaceLaunchConfigurationArguments: ['-positioningRect', frameString]
  };


  NSWorkspace.sharedWorkspace().launchApplicationAtURL_options_configuration_error(
    url,
    NSWorkspaceLaunchNewInstance,
    config,
    null
  );
};

LoginHelper.prototype.stopListening = function() {
  // When name argument is null, removes ALL notifications for observer.
  this.notificationCenter.removeObserver_name_object(this.notificationHandler, null, null);
};

LoginHelper.prototype.sendLogoutNotification = function() {
  this.notificationCenter.postNotificationName_object(LogoutNotification, null);
};

LoginHelper.ViewState = ViewState;

module.exports = LoginHelper;
