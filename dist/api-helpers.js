"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;
exports.put = put;
exports.get = get;
exports.postToAbtasty = postToAbtasty;
exports.postToAbtastyMultiple = postToAbtastyMultiple;
exports.generateAbtastyVisitorId = generateAbtastyVisitorId;
exports.getVariationForVisitor = getVariationForVisitor;
exports.getVariationsForVisitor = getVariationsForVisitor;
exports.getParameterByName = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _raven = _interopRequireDefault(require("raven"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('dotenv').config();

var _process$env = process.env,
    API_BASE_URL = _process$env.API_BASE_URL,
    ABTASTY_BASE_URL = _process$env.ABTASTY_BASE_URL,
    ABTASTY_API_KEY = _process$env.ABTASTY_API_KEY;
/**
 * a common wrapper makes an axios POST call to the api
 * @export
 * @namespace api-helpers
 * @param {*} location
 * @param {*} body
 * @param {*} headers
 * @returns {}
 */

function post(location, body, headers) {
  console.log("post ".concat(API_BASE_URL).concat(location));
  return _axios.default.post("".concat(API_BASE_URL).concat(location), body, headers).then(function (response) {
    return {
      error: null,
      response: response
    };
  }).catch(function (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);

    if (error.response) {
      return {
        error: error.response
      };
    }

    if (error.request) {
      return {
        error: 'No response from server'
      };
    }

    return error.message;
  });
}
/**
 * a common wrapper makes an axios PUT call to the api
 * @export
 * @namespace api-helpers
 * @param {*} location
 * @param {*} body
 * @param {*} headers
 * @returns {}
 */


function put(location, body, headers) {
  console.log("put ".concat(API_BASE_URL).concat(location));
  return _axios.default.put("".concat(API_BASE_URL).concat(location), body, headers).then(function (response) {
    return {
      error: null,
      response: response
    };
  }).catch(function (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);

    if (error.response) {
      return {
        error: error.response
      };
    }

    if (error.request) {
      return {
        error: 'No response from server'
      };
    }

    return error.message;
  });
}
/**
 * a common wrapper makes an axios GET call to the api
 * @export
 * @namespace api-helpers
 * @param {*} location
 * @param {*} headers
 * @returns {}
 */


function get(location, sessionId, headers) {
  headers = headers || {};
  console.log("get ".concat(API_BASE_URL).concat(location));
  return _axios.default.get("".concat(API_BASE_URL).concat(location), {
    headers: _objectSpread({
      Authorization: "JWT ".concat(sessionId)
    }, headers)
  }).then(function (response) {
    console.log({
      response: response
    });
    return {
      error: null,
      response: response
    };
  }).catch(function (error) {
    console.error('Exception Occurred in ReactApp', error.stack || error);

    if (error.response) {
      return {
        error: error.response
      };
    }

    if (error.request) {
      return {
        error: 'No response from server'
      };
    }

    return error.message;
  });
}

function postToAbtasty(_x, _x2) {
  return _postToAbtasty.apply(this, arguments);
}

function _postToAbtasty() {
  _postToAbtasty = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(action, body) {
    var url, response;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            url = "".concat(ABTASTY_BASE_URL, "/").concat(action);
            _context.next = 4;
            return _axios.default.post(url, body, {
              headers: {
                'x-api-key': ABTASTY_API_KEY
              }
            });

          case 4:
            response = _context.sent;
            return _context.abrupt("return", response.data);

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
  return _postToAbtasty.apply(this, arguments);
}

function postToAbtastyMultiple(action, body) {
  try {
    var url = "".concat(ABTASTY_BASE_URL, "/").concat(action);
    return _axios.default.post(url, body, {
      headers: {
        'x-api-key': ABTASTY_API_KEY
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function generateAbtastyVisitorId() {
  return _generateAbtastyVisitorId.apply(this, arguments);
}

function _generateAbtastyVisitorId() {
  _generateAbtastyVisitorId = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var _ref, response;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _axios.default.post("".concat(ABTASTY_BASE_URL, "/visitor"), {}, {
              headers: {
                'x-api-key': ABTASTY_API_KEY
              }
            });

          case 3:
            response = _context2.sent;

            if (!((_ref = response) != null ? (_ref = _ref.data) != null ? _ref.id : _ref : _ref)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", response.data.id);

          case 6:
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);

            _raven.default.captureException(_context2.t0);

            console.error('Exception Occurred in ReactApp', _context2.t0.stack || _context2.t0);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 8]]);
  }));
  return _generateAbtastyVisitorId.apply(this, arguments);
}

function getVariationForVisitor(_x3, _x4) {
  return _getVariationForVisitor.apply(this, arguments);
}

function _getVariationForVisitor() {
  _getVariationForVisitor = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(visitor_id, campaign_id) {
    var _ref2, response, variation_id;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('Getting variation id for a campaign', {
              visitor_id: visitor_id,
              campaign_id: campaign_id
            });
            _context3.prev = 1;
            _context3.next = 4;
            return _axios.default.post("".concat(ABTASTY_BASE_URL, "/allocate"), {
              campaign_id: campaign_id,
              visitor_id: visitor_id
            }, {
              headers: {
                'x-api-key': ABTASTY_API_KEY
              }
            });

          case 4:
            response = _context3.sent;
            variation_id = (_ref2 = response) != null ? (_ref2 = _ref2.data) != null ? _ref2.variation_id : _ref2 : _ref2;
            console.log('Got the variation id for the campaign', {
              visitor_id: visitor_id,
              campaign_id: campaign_id,
              variation_id: variation_id
            });
            return _context3.abrupt("return", variation_id);

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](1);

            _raven.default.captureException(_context3.t0);

            console.error('Exception Occurred in ReactApp', _context3.t0.stack || _context3.t0);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[1, 10]]);
  }));
  return _getVariationForVisitor.apply(this, arguments);
}

var getParameterByName = function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp("[?&]".concat(name, "(=([^&#]*)|&|#|$)"));
  var results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
/**
 * Gets variation ids for many ABTasty campaigns. If getting a variation id for a campaign fails,
 * the error is reported and the default id is returned.
 *
 * @param {string} visitor_id ABTasty visitor id
 * @param {{}} campaigns The list of campaigns. The keys are campaign ids, the values are the
 *   default variation ids.
 * @return {Promise<{}>} A promise resolving with the same list of campaigns but the values are the
 *   actual variation ids.
 */


exports.getParameterByName = getParameterByName;

function getVariationsForVisitor(_x5, _x6) {
  return _getVariationsForVisitor.apply(this, arguments);
}

function _getVariationsForVisitor() {
  _getVariationsForVisitor = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(visitor_id, campaigns) {
    var campaignMaps;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            campaignMaps = _objectSpread({}, campaigns);
            _context5.next = 3;
            return Promise.all(Object.keys(campaignMaps).map(
            /*#__PURE__*/
            function () {
              var _ref3 = _asyncToGenerator(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee4(campaign_id) {
                var variation_id;
                return _regenerator.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return getVariationForVisitor(visitor_id, campaign_id);

                      case 2:
                        variation_id = _context4.sent;

                        if (variation_id) {
                          campaignMaps[campaign_id] = variation_id;
                        }

                      case 4:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function (_x7) {
                return _ref3.apply(this, arguments);
              };
            }()));

          case 3:
            return _context5.abrupt("return", campaignMaps);

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
  return _getVariationsForVisitor.apply(this, arguments);
}