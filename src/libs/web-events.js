const util = require('./util');
const persist = require('./persistence');
const coerceJS = require('./coerce').coerceJS;
const debug = util.debug;

function postWebUIEvent(eventName, payload) {
  var webView = persist.get('dsmMainWebView');
  if (webView) {
    var data = JSON.stringify({ eventName: eventName, payload: payload });
    var script = 'window.dsm.handleEvent(' + data + ')';
    // webview.windowScriptObject().evaluateWebScript(script)
    webView.evaluateWebScript(script).catch(err => {
      debug(err)
    })
  } else {
    debug('No WebView present. Event cannot be posted to the web UI.');
  }
}

function sendDataToWebView(webView, data) {
  const jsonData = JSON.stringify(coerceJS(data));
  debug('NATIVE->WEB: ' + jsonData);
  const script = 'window.dsm.receiveDataFromNativeUI(' + jsonData + ')';
  webView.windowScriptObject().evaluateWebScript(script);
}


exports.postWebUIEvent = postWebUIEvent;
exports.sendDataToWebView = sendDataToWebView;
