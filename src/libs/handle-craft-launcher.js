/* global NSApplication AppController */

// This function is basically a duplicate of a simliar function in ui.js. We are
// not using require() to access that because the functions in this file will be
// called whenever the users selects (or deselects) DSM in the Craft bar. They
// should respond quickly and as far as I can tell loading our `require`
// implementation and using it would happen each time these functions are run,
// rather than once when this file is first loaded.
function getMainPluginWindow() {
  const windows = NSApplication.sharedApplication().windows();
  var window;
  for (var i = 0; i < windows.count(); i++) {
    window = windows.objectAtIndex(i);
    if (window.identifier() == 'com.invision.dsm.mainWindow') {
      return window;
    }
  }
}

function onOpenFromCraftPanel(context) { // eslint-disable-line no-unused-vars
  const mainPluginWindow = getMainPluginWindow();

  if (!mainPluginWindow || !mainPluginWindow.isVisible()) {
    // If the plugin has no main window or the window is hidden, treat this
    // exacly like an invocation from the menu that opens the plugin.
    const toggleOpenCommand = context.command.pluginBundle().commands()['dsm-display'];
    context.command = toggleOpenCommand;
    AppController.sharedInstance().runPluginCommand_fromMenu_context(
      toggleOpenCommand,
      false,
      context
    );
  }

}

function onCloseFromCraftPanel(context) { // eslint-disable-line no-unused-vars
  const mainPluginWindow = getMainPluginWindow();

  if (mainPluginWindow && mainPluginWindow.isVisible()) {
    mainPluginWindow.performClose(null);
  }
}
