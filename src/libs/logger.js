const postWebUIEvent = require('./web-events').postWebUIEvent;

function logMessage(level, data) {
  postWebUIEvent('onLogMessage', { level: level, data: data });
}

module.exports = logMessage;
