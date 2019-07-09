"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xss = _interopRequireDefault(require("xss"));

var _serverConfig = _interopRequireDefault(require("../server-config"));

var _raven = _interopRequireDefault(require("raven"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// middleware for security
// Entry points, ip tampering, and so on
// it makes api return 403 error and sets `req.session.isBot` to true

/**
 * Middleware to protect react server from xss attacks
 * @function
 * @namespace server-middleware
 * @param  {} req
 */
function getIp(req) {
  try {
    // https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-CloudFlare-handle-HTTP-Request-headers-
    if (_serverConfig.default.ENV !== 'development' && req.headers['cf-connecting-ip']) {
      return (0, _xss.default)(req.headers['cf-connecting-ip']);
    } // http://stackoverflow.com/a/10849772/1885921


    if (req.headers['x-forwarded-for']) {
      return (0, _xss.default)(req.headers['x-forwarded-for']);
    }

    return req.connection.remoteAddress;
  } catch (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);
  }
}

var _default = {
  getIp: getIp
};
exports.default = _default;