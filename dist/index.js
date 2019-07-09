"use strict";

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _express = _interopRequireDefault(require("express"));

var _next2 = _interopRequireDefault(require("next"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _compression = _interopRequireDefault(require("compression"));

var _expressUseragent = _interopRequireDefault(require("express-useragent"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _connectRedis = _interopRequireDefault(require("connect-redis"));

var _querystring = _interopRequireDefault(require("querystring"));

var _raven = _interopRequireDefault(require("raven"));

var _morgan = _interopRequireDefault(require("morgan"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _apiHelpers = require("./api-helpers");

var _Security = _interopRequireDefault(require("./middlewares/Security"));

var _RateLimiter = _interopRequireDefault(require("./middlewares/RateLimiter"));

var _serverConfig = _interopRequireDefault(require("./server-config"));

var _redisConfig = _interopRequireDefault(require("./redis-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

var path = require('path'); // import authenticParams from '../constants/urlParams';


require('dotenv').config();

var _process$env = process.env,
    PORT = _process$env.PORT,
    NODE_ENV = _process$env.NODE_ENV,
    API_BASE_URL = _process$env.API_BASE_URL,
    ABTASTY_BASE_URL = _process$env.ABTASTY_BASE_URL,
    ABTASTY_API_KEY = _process$env.ABTASTY_API_KEY;
var dev = NODE_ENV !== 'production';

require('dotenv').config();

var port = PORT ? parseInt(PORT, 10) : 3000;
var server = (0, _express.default)(); // Express Middlewares
// for logging express req and res

server.use((0, _morgan.default)('combined', {
  skip: function skip(req, res) {
    return res.statusCode < 400;
  }
}));
server.use((0, _cookieParser.default)());
server.use(_bodyParser.default.json());
server.use(_expressUseragent.default.express());
server.use('/uploads', _express.default.static('uploads')); // configure remote logging

if (!dev) {
  _raven.default.config('https://30b971029d594608bb765ea6e46298f0@sentry.io/1207214', {
    maxBreadcrumbs: 10,
    sendTimeout: 5
  }).install();

  server.use((0, _compression.default)());
}

var RedisSessionStore = (0, _connectRedis.default)(_expressSession.default); // initialize redis store to be used by Ratelimiter

server.use((0, _expressSession.default)({
  key: 'ABCBDSESSID',
  store: new RedisSessionStore({
    prefix: 'starlight_session_',
    client: _redisConfig.default
  }),
  expireAfterSeconds: 3 * 60 * 60,
  // session is valid for 3 hours
  secret: _serverConfig.default.secret,
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
server.use('/*', _RateLimiter.default);

var isAuthentic = function isAuthentic(req) {
  var isAuthenticUser = false;
  var authenticParams = ['affId', 'sourceValue3', 'sourceValue4', 'sourceValue5', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'mailsoft_person_id', 'cid', 'sms_id', 'promocode'];

  if (req.query && Object.keys(req.query).length) {
    var queryParams = Object.keys(req.query);
    isAuthenticUser = queryParams.some(function (param) {
      if (authenticParams.includes(param)) {
        return true;
      }

      return false;
    });
  }

  return isAuthenticUser;
}; // Security.js for protecting agains xss attacks


server.use(function (req, res, cb) {
  res.set('X-Powered-By', 'Yeah Keto');
  res.set('X-XSS-Protection', 1);
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin');

  try {
    if (req.session) {
      // set key only for page requests
      // ignore for static calls and HMR calls in dev
      if (req.url.indexOf('/static/') === -1 && req.url.indexOf('on-demand-entries-ping') === -1) {
        res.set('ABCBDSESSID', req.sessionID);
      }

      if (req.session && !req.session.ip) {
        req.session.ip = _Security.default.getIp(req); // eslint-disable-line no-param-reassign
      }

      if (req.session && !req.session.userAgent) {
        req.session.userAgent = req.get('User-Agent'); // eslint-disable-line no-param-reassign
      }
    }
  } catch (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);
  }

  return cb();
});
/**
 * get sessionId from cookies
 * @param  {} req
 * @param  {} res
 * @return {Object} id : token
 */

var getSessionId =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(req, res) {
    var _ref, cookies, token;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            cookies = req.cookies;
            token = (_ref = cookies) != null ? _ref.ascbd_session : _ref;

            if (!token || token === 'undefined') {
              console.error('Token not found!!');
              res.redirect('/promo');
            }

            return _context.abrupt("return", {
              id: token
            });

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);

            _raven.default.captureException(_context.t0);

            console.error('Exception Occurred in ReactApp', _context.t0.stack || _context.t0);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));

  return function getSessionId(_x, _x2) {
    return _ref7.apply(this, arguments);
  };
}();

var generateSession =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(req, res) {
    var _ref2;

    var sessionResponse;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _apiHelpers.post)('/v1/auth', {
              username: 'larby@starlightgroup.io',
              password: 'P@ssw0rd'
            }, {
              'x-ascbd-req-origin': req.get('host')
            });

          case 2:
            sessionResponse = _context2.sent;

            if (!((_ref2 = sessionResponse) != null ? (_ref2 = _ref2.response) != null ? _ref2.data : _ref2 : _ref2)) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", sessionResponse.response.data.data.token);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function generateSession(_x3, _x4) {
    return _ref8.apply(this, arguments);
  };
}();

var getVisitorId =
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, res) {
    var _ref3, cookies, visitorId;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            cookies = req.cookies;
            visitorId = (_ref3 = cookies) != null ? _ref3.asc_visitor_id : _ref3;

            if (!(visitorId && visitorId !== 'undefined')) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", {
              visitorId: visitorId,
              isNew: false
            });

          case 5:
            _context3.next = 7;
            return (0, _apiHelpers.generateAbtastyVisitorId)();

          case 7:
            visitorId = _context3.sent;
            return _context3.abrupt("return", {
              visitorId: visitorId,
              isNew: true
            });

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);

            _raven.default.captureException(_context3.t0);

            console.error('Exception Occurred in ReactApp', _context3.t0.stack || _context3.t0);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 11]]);
  }));

  return function getVisitorId(_x5, _x6) {
    return _ref9.apply(this, arguments);
  };
}();

var qualifiesForCidDiscount = function qualifiesForCidDiscount(req) {
  try {
    var _ref4;

    var cookies = req.cookies;
    var cidDiscount = (_ref4 = cookies) != null ? _ref4.cid_discount : _ref4;

    if (cidDiscount && cidDiscount === 'true') {
      return true;
    }
  } catch (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);
  }

  return false;
};

var app = (0, _next2.default)({
  dev: dev
});
var handle = app.getRequestHandler();
app.prepare().then(function () {
  server.post('/abtasty',
  /*#__PURE__*/
  function () {
    var _ref10 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee4(req, res) {
      var response;
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return (0, _apiHelpers.postToAbtasty)(req.body.action, req.body);

            case 2:
              response = _context4.sent;
              console.log({
                response: response
              });
              res.status(200).send(response);

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x7, _x8) {
      return _ref10.apply(this, arguments);
    };
  }());
  server.post('/multicampaign-abtasty',
  /*#__PURE__*/
  function () {
    var _ref11 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee5(req, res) {
      var campaigns, promises;
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              campaigns = req.body;
              promises = [];
              Object.keys(campaigns).forEach(function (key) {
                var response = (0, _apiHelpers.postToAbtastyMultiple)(campaigns[key].action, campaigns[key]);
                promises.push(response);
              });
              Promise.all(promises).then(function (values) {
                res.status(200).send('success');
              }).catch(function (reason) {
                console.log(reason);
                res.status(500).send('error');
              });

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x9, _x10) {
      return _ref11.apply(this, arguments);
    };
  }());
  server.get('/start-session',
  /*#__PURE__*/
  function () {
    var _ref12 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee6(req, res) {
      var token;
      return _regenerator.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return generateSession(req, res);

            case 2:
              token = _context6.sent;
              res.cookie('ascbd_session', token, {
                maxAge: 3600000
              });
              res.status(200).send({
                token: token
              });

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    return function (_x11, _x12) {
      return _ref12.apply(this, arguments);
    };
  }());
  server.get('/cart',
  /*#__PURE__*/
  function () {
    var _ref13 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee7(req, res) {
      return _regenerator.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", app.render(req, res, '/cart'));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    return function (_x13, _x14) {
      return _ref13.apply(this, arguments);
    };
  }());
  server.get('/cbd',
  /*#__PURE__*/
  function () {
    var _ref14 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee8(req, res) {
      return _regenerator.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'index.html')));

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    return function (_x15, _x16) {
      return _ref14.apply(this, arguments);
    };
  }());
  server.get('/cbd/checkout',
  /*#__PURE__*/
  function () {
    var _ref15 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee9(req, res) {
      return _regenerator.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'checkout.html')));

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    return function (_x17, _x18) {
      return _ref15.apply(this, arguments);
    };
  }());
  server.get('/cbd/thankyou',
  /*#__PURE__*/
  function () {
    var _ref16 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee10(req, res) {
      return _regenerator.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'thankyou.html')));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    return function (_x19, _x20) {
      return _ref16.apply(this, arguments);
    };
  }());
  server.get('/cbd/tnc',
  /*#__PURE__*/
  function () {
    var _ref17 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee11(req, res) {
      return _regenerator.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'tnc.html')));

            case 1:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    return function (_x21, _x22) {
      return _ref17.apply(this, arguments);
    };
  }());
  server.get('/cbd/privacy',
  /*#__PURE__*/
  function () {
    var _ref18 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee12(req, res) {
      return _regenerator.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'privacypolicy.html')));

            case 1:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    return function (_x23, _x24) {
      return _ref18.apply(this, arguments);
    };
  }());
  server.get('/cbd/customer',
  /*#__PURE__*/
  function () {
    var _ref19 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee13(req, res) {
      return _regenerator.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'customer.html')));

            case 1:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    return function (_x25, _x26) {
      return _ref19.apply(this, arguments);
    };
  }());
  server.get('/cbd/cvv',
  /*#__PURE__*/
  function () {
    var _ref20 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee14(req, res) {
      return _regenerator.default.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              return _context14.abrupt("return", res.sendFile(path.join(__dirname, '../static/temp', 'cvv.html')));

            case 1:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    }));

    return function (_x27, _x28) {
      return _ref20.apply(this, arguments);
    };
  }());
  server.get('/thankyou?',
  /*#__PURE__*/
  function () {
    var _ref21 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee15(req, res) {
      var requestAgent, orderId, sessionId;
      return _regenerator.default.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.prev = 0;
              requestAgent = req.useragent.isMobile ? 'mobile' : 'desktop';
              orderId = req.query.orderId;
              _context15.next = 5;
              return getSessionId(req, res);

            case 5:
              sessionId = _context15.sent;
              return _context15.abrupt("return", app.render(req, res, '/thankyou-page', {
                orderId: orderId,
                sessionId: sessionId,
                device: requestAgent
              }));

            case 9:
              _context15.prev = 9;
              _context15.t0 = _context15["catch"](0);

              _raven.default.captureException(_context15.t0);

              console.error('Exception Occurred in ReactApp', _context15.t0.stack || _context15.t0);

            case 13:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15, this, [[0, 9]]);
    }));

    return function (_x29, _x30) {
      return _ref21.apply(this, arguments);
    };
  }());
  server.get('/promo/:useragent?',
  /*#__PURE__*/
  function () {
    var _ref22 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee16(req, res) {
      var requestAgent, visitorId, isNew, isAuthenticUser, token, sessionId, campaignMaps, cid, fromKonnective, userInfo, _ref5, cidResponse, _cid, _campaignMaps;

      return _regenerator.default.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.prev = 0;
              requestAgent = req.useragent.isMobile ? 'mobile' : 'desktop'; // const { visitorId, isNew } = await getVisitorId(req, res);

              visitorId = null;
              isNew = false;
              isAuthenticUser = isAuthentic(req); // if (isNew) {
              //   res.cookie('asc_visitor_id', visitorId, { maxAge: 3600000 });
              // }

              if (!(requestAgent !== req.params.useragent)) {
                _context16.next = 8;
                break;
              }

              res.redirect("/promo/".concat(requestAgent, "?").concat(_querystring.default.stringify(req.query)));
              return _context16.abrupt("return");

            case 8:
              if (!(requestAgent === 'desktop')) {
                _context16.next = 25;
                break;
              }

              _context16.next = 11;
              return generateSession(req, res);

            case 11:
              token = _context16.sent;
              sessionId = {
                id: token
              }; // const campaignMaps = await getVariationsForVisitor(visitorId, {});

              campaignMaps = [];
              cid = (0, _apiHelpers.getParameterByName)('cid', req.originalUrl);
              fromKonnective = (0, _apiHelpers.getParameterByName)('from_k', req.originalUrl);
              userInfo = null;

              if (!cid) {
                _context16.next = 24;
                break;
              }

              _context16.next = 20;
              return (0, _apiHelpers.get)("/v1/response/customer/".concat(cid, "?from_k=").concat(fromKonnective), sessionId.id, {
                'x-ascbd-req-origin': req.get('host')
              });

            case 20:
              cidResponse = _context16.sent;

              if (((_ref5 = cidResponse) != null ? (_ref5 = _ref5.response) != null ? (_ref5 = _ref5.data) != null ? _ref5.code : _ref5 : _ref5 : _ref5) === 200) {
                userInfo = cidResponse.response.data.data;
              }

              console.log('userInfo', userInfo);

              if (userInfo) {
                res.cookie('cid_discount', true, {
                  maxAge: 3600000
                });
              }

            case 24:
              app.render(req, res, '/promo-desktop', {
                requestAgent: requestAgent,
                visitorId: null,
                device: requestAgent,
                campaignMaps: campaignMaps,
                isAuthenticUser: isAuthenticUser,
                userInfo: userInfo,
                cid: cid,
                API_BASE_URL: API_BASE_URL
              });

            case 25:
              if (!(requestAgent === 'mobile')) {
                _context16.next = 31;
                break;
              }

              _cid = (0, _apiHelpers.getParameterByName)('cid', req.originalUrl);
              _context16.next = 29;
              return (0, _apiHelpers.getVariationsForVisitor)(visitorId, {});

            case 29:
              _campaignMaps = _context16.sent;
              app.render(req, res, '/promo-mobile', {
                requestAgent: requestAgent,
                visitorId: visitorId,
                device: requestAgent,
                campaignMaps: _campaignMaps,
                isAuthenticUser: isAuthenticUser,
                cid: _cid,
                API_BASE_URL: API_BASE_URL
              });

            case 31:
              _context16.next = 37;
              break;

            case 33:
              _context16.prev = 33;
              _context16.t0 = _context16["catch"](0);

              _raven.default.captureException(_context16.t0);

              console.error('Exception Occurred in ReactApp', _context16.t0.stack || _context16.t0);

            case 37:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16, this, [[0, 33]]);
    }));

    return function (_x31, _x32) {
      return _ref22.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/checkout',
  /*#__PURE__*/
  function () {
    var _ref23 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee17(req, res) {
      var sessionId, _req$query, orderId, transaction_id, offerId, adv_sub;

      return _regenerator.default.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.prev = 0;
              _context17.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context17.sent;
              _req$query = req.query, orderId = _req$query.orderId, transaction_id = _req$query.transaction_id, offerId = _req$query.offer_id, adv_sub = _req$query.aff_sub2; // const { visitorId } = await getVisitorId(req, res);
              // const campaignMaps = await getVariationsForVisitor(visitorId, {
              //   313018: undefined,
              //   318676: '419445',
              //   319131: '420043',
              //   319133: '420046',
              //   319137: '420050',
              // });
              // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-desktop-checkout', {
                orderId: orderId,
                sessionId: sessionId,
                visitorId: '',
                adv_sub: adv_sub,
                transaction_id: transaction_id,
                offerId: offerId,
                campaignMaps: []
              }); // });

              _context17.next = 12;
              break;

            case 8:
              _context17.prev = 8;
              _context17.t0 = _context17["catch"](0);

              _raven.default.captureException(_context17.t0);

              console.error('Exception Occurred in ReactApp', _context17.t0.stack || _context17.t0);

            case 12:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, this, [[0, 8]]);
    }));

    return function (_x33, _x34) {
      return _ref23.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/upsell-1',
  /*#__PURE__*/
  function () {
    var _ref24 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee18(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub, affId;
      return _regenerator.default.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.prev = 0;
              _context18.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context18.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              affId = req.query.affId; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-desktop-upsell', {
                upsell: 1,
                orderId: orderId,
                offerId: offerId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId,
                affId: affId
              }); // });

              _context18.next = 16;
              break;

            case 12:
              _context18.prev = 12;
              _context18.t0 = _context18["catch"](0);

              _raven.default.captureException(_context18.t0);

              console.error('Exception Occurred in ReactApp', _context18.t0.stack || _context18.t0);

            case 16:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18, this, [[0, 12]]);
    }));

    return function (_x35, _x36) {
      return _ref24.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/upsell-1-1',
  /*#__PURE__*/
  function () {
    var _ref25 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee19(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub;
      return _regenerator.default.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.prev = 0;
              _context19.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context19.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-desktop-upsell', {
                upsell: '1-1',
                orderId: orderId,
                offerId: offerId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId
              }); // });

              _context19.next = 15;
              break;

            case 11:
              _context19.prev = 11;
              _context19.t0 = _context19["catch"](0);

              _raven.default.captureException(_context19.t0);

              console.error('Exception Occurred in ReactApp', _context19.t0.stack || _context19.t0);

            case 15:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19, this, [[0, 11]]);
    }));

    return function (_x37, _x38) {
      return _ref25.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/upsell-2',
  /*#__PURE__*/
  function () {
    var _ref26 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee20(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub;
      return _regenerator.default.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.prev = 0;
              _context20.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context20.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-desktop-upsell', {
                upsell: 2,
                orderId: orderId,
                offerId: offerId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId
              }); // });

              _context20.next = 15;
              break;

            case 11:
              _context20.prev = 11;
              _context20.t0 = _context20["catch"](0);

              _raven.default.captureException(_context20.t0);

              console.error('Exception Occurred in ReactApp', _context20.t0.stack || _context20.t0);

            case 15:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, this, [[0, 11]]);
    }));

    return function (_x39, _x40) {
      return _ref26.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/thankyou',
  /*#__PURE__*/
  function () {
    var _ref27 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee21(req, res) {
      var sessionId, orderId;
      return _regenerator.default.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.prev = 0;
              _context21.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context21.sent;
              orderId = req.query.orderId; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/thankyou-page', {
                orderId: orderId,
                sessionId: sessionId,
                isPromo: true,
                device: 'desktop'
              }); // });

              _context21.next = 12;
              break;

            case 8:
              _context21.prev = 8;
              _context21.t0 = _context21["catch"](0);

              _raven.default.captureException(_context21.t0);

              console.error('Exception Occurred in ReactApp', _context21.t0.stack || _context21.t0);

            case 12:
            case "end":
              return _context21.stop();
          }
        }
      }, _callee21, this, [[0, 8]]);
    }));

    return function (_x41, _x42) {
      return _ref27.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/shipping',
  /*#__PURE__*/
  function () {
    var _ref28 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee22(req, res) {
      var sessionId, cid, fromKonnective, userInfo, _ref6, cidResponse;

      return _regenerator.default.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.prev = 0;
              _context22.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context22.sent;
              // const { visitorId } = await getVisitorId(req, res);
              cid = (0, _apiHelpers.getParameterByName)('cid', req.originalUrl);
              fromKonnective = (0, _apiHelpers.getParameterByName)('from_k', req.originalUrl);
              userInfo = null;

              if (!cid) {
                _context22.next = 14;
                break;
              }

              _context22.next = 10;
              return (0, _apiHelpers.get)("/v1/response/customer/".concat(cid, "?from_k=").concat(fromKonnective), sessionId.id, {
                'x-ascbd-req-origin': req.get('host')
              });

            case 10:
              cidResponse = _context22.sent;

              if (((_ref6 = cidResponse) != null ? (_ref6 = _ref6.response) != null ? (_ref6 = _ref6.data) != null ? _ref6.code : _ref6 : _ref6 : _ref6) === 200) {
                userInfo = cidResponse.response.data.data;
              }

              console.log('userInfo', userInfo);

              if (userInfo) {
                res.cookie('cid_discount', true, {
                  maxAge: 3600000
                });
              }

            case 14:
              return _context22.abrupt("return", app.render(req, res, '/promo-mobile-shipping', {
                sessionId: sessionId,
                userInfo: userInfo,
                cid: cid
              }));

            case 17:
              _context22.prev = 17;
              _context22.t0 = _context22["catch"](0);

              _raven.default.captureException(_context22.t0);

              console.error('Exception Occurred in ReactApp', _context22.t0.stack || _context22.t0);

            case 21:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22, this, [[0, 17]]);
    }));

    return function (_x43, _x44) {
      return _ref28.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/select-package',
  /*#__PURE__*/
  function () {
    var _ref29 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee23(req, res) {
      var sessionId, orderId;
      return _regenerator.default.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.prev = 0;
              _context23.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context23.sent;
              orderId = req.query.orderId; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-mobile-select-package', {
                sessionId: sessionId,
                orderId: orderId
              }); // });

              _context23.next = 12;
              break;

            case 8:
              _context23.prev = 8;
              _context23.t0 = _context23["catch"](0);

              _raven.default.captureException(_context23.t0);

              console.error('Exception Occurred in ReactApp', _context23.t0.stack || _context23.t0);

            case 12:
            case "end":
              return _context23.stop();
          }
        }
      }, _callee23, this, [[0, 8]]);
    }));

    return function (_x45, _x46) {
      return _ref29.apply(this, arguments);
    };
  }()); // A.k.a. Checkout in AB testing

  server.get('/promo/mobile/confirm',
  /*#__PURE__*/
  function () {
    var _ref30 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee24(req, res) {
      var sessionId, _ref31, visitorId, _req$query2, orderId, offerId, transaction_id, adv_sub, productId, cid, isAuthenticUser;

      return _regenerator.default.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.prev = 0;
              _context24.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context24.sent;
              _context24.next = 6;
              return getVisitorId(req, res);

            case 6:
              _ref31 = _context24.sent;
              visitorId = _ref31.visitorId;
              _req$query2 = req.query, orderId = _req$query2.orderId, offerId = _req$query2.offer_id, transaction_id = _req$query2.transaction_id, adv_sub = _req$query2.aff_sub2, productId = _req$query2.productId;
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null;
              isAuthenticUser = isAuthentic(req); // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-mobile-confirm', {
                sessionId: sessionId,
                visitorId: visitorId,
                orderId: orderId,
                productId: productId,
                offerId: offerId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                cid: cid,
                isAuthenticUser: isAuthenticUser
              }); // });

              _context24.next = 18;
              break;

            case 14:
              _context24.prev = 14;
              _context24.t0 = _context24["catch"](0);

              _raven.default.captureException(_context24.t0);

              console.error('Exception Occurred in ReactApp', _context24.t0.stack || _context24.t0);

            case 18:
            case "end":
              return _context24.stop();
          }
        }
      }, _callee24, this, [[0, 14]]);
    }));

    return function (_x47, _x48) {
      return _ref30.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/upsell-1',
  /*#__PURE__*/
  function () {
    var _ref32 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee25(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub, affId, isAuthenticUser, _ref33, visitorId, cid;

      return _regenerator.default.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.prev = 0;
              _context25.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context25.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              affId = req.query.affId;
              isAuthenticUser = isAuthentic(req);
              _context25.next = 12;
              return getVisitorId(req, res);

            case 12:
              _ref33 = _context25.sent;
              visitorId = _ref33.visitorId;
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null;
              app.render(req, res, '/promo-mobile-upsell', {
                upsell: 1,
                offerId: offerId,
                orderId: orderId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                isAuthenticUser: isAuthenticUser,
                sessionId: sessionId,
                visitorId: visitorId,
                cid: cid,
                affId: affId
              });
              _context25.next = 22;
              break;

            case 18:
              _context25.prev = 18;
              _context25.t0 = _context25["catch"](0);

              _raven.default.captureException(_context25.t0);

              console.error('Exception Occurred in ReactApp', _context25.t0.stack || _context25.t0);

            case 22:
            case "end":
              return _context25.stop();
          }
        }
      }, _callee25, this, [[0, 18]]);
    }));

    return function (_x49, _x50) {
      return _ref32.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/upsell-1-1',
  /*#__PURE__*/
  function () {
    var _ref34 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee26(req, res) {
      var sessionId, orderId, transaction_id, adv_sub, isAuthenticUser, cid;
      return _regenerator.default.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.prev = 0;
              _context26.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context26.sent;
              orderId = req.query.orderId;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              isAuthenticUser = isAuthentic(req);
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null;
              app.render(req, res, '/promo-mobile-upsell', {
                upsell: '1-1',
                orderId: orderId,
                transaction_id: transaction_id,
                isAuthenticUser: isAuthenticUser,
                adv_sub: adv_sub,
                sessionId: sessionId,
                cid: cid
              });
              _context26.next = 16;
              break;

            case 12:
              _context26.prev = 12;
              _context26.t0 = _context26["catch"](0);

              _raven.default.captureException(_context26.t0);

              console.error('Exception Occurred in ReactApp', _context26.t0.stack || _context26.t0);

            case 16:
            case "end":
              return _context26.stop();
          }
        }
      }, _callee26, this, [[0, 12]]);
    }));

    return function (_x51, _x52) {
      return _ref34.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/upsell-2',
  /*#__PURE__*/
  function () {
    var _ref35 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee27(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub, isAuthenticUser, _ref36, visitorId, cid;

      return _regenerator.default.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.prev = 0;
              _context27.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context27.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              isAuthenticUser = isAuthentic(req);
              _context27.next = 11;
              return getVisitorId(req, res);

            case 11:
              _ref36 = _context27.sent;
              visitorId = _ref36.visitorId;
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null;
              app.render(req, res, '/promo-mobile-upsell', {
                upsell: 2,
                orderId: orderId,
                offerId: offerId,
                visitorId: visitorId,
                isAuthenticUser: isAuthenticUser,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId,
                cid: cid
              });
              _context27.next = 21;
              break;

            case 17:
              _context27.prev = 17;
              _context27.t0 = _context27["catch"](0);

              _raven.default.captureException(_context27.t0);

              console.error('Exception Occurred in ReactApp', _context27.t0.stack || _context27.t0);

            case 21:
            case "end":
              return _context27.stop();
          }
        }
      }, _callee27, this, [[0, 17]]);
    }));

    return function (_x53, _x54) {
      return _ref35.apply(this, arguments);
    };
  }());
  server.get('/promo/desktop/upsell-2-1',
  /*#__PURE__*/
  function () {
    var _ref37 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee28(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub, cid;
      return _regenerator.default.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.prev = 0;
              _context28.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context28.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-desktop-upsell', {
                upsell: '2-1',
                orderId: orderId,
                offerId: offerId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId,
                cid: cid
              }); // });

              _context28.next = 16;
              break;

            case 12:
              _context28.prev = 12;
              _context28.t0 = _context28["catch"](0);

              _raven.default.captureException(_context28.t0);

              console.error('Exception Occurred in ReactApp', _context28.t0.stack || _context28.t0);

            case 16:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28, this, [[0, 12]]);
    }));

    return function (_x55, _x56) {
      return _ref37.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/upsell-2-1',
  /*#__PURE__*/
  function () {
    var _ref38 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee29(req, res) {
      var sessionId, orderId, offerId, transaction_id, adv_sub, _ref39, visitorId, cid;

      return _regenerator.default.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              _context29.prev = 0;
              _context29.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context29.sent;
              orderId = req.query.orderId;
              offerId = req.query.sourceValue5;
              transaction_id = req.query.sourceValue3;
              adv_sub = req.query.sourceValue2;
              _context29.next = 10;
              return getVisitorId(req, res);

            case 10:
              _ref39 = _context29.sent;
              visitorId = _ref39.visitorId;
              cid = qualifiesForCidDiscount(req) ? (0, _apiHelpers.getParameterByName)('cid', req.originalUrl) : null; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/promo-mobile-upsell', {
                upsell: '2-1',
                orderId: orderId,
                offerId: offerId,
                visitorId: visitorId,
                transaction_id: transaction_id,
                adv_sub: adv_sub,
                sessionId: sessionId,
                cid: cid
              }); // });

              _context29.next = 20;
              break;

            case 16:
              _context29.prev = 16;
              _context29.t0 = _context29["catch"](0);

              _raven.default.captureException(_context29.t0);

              console.error('Exception Occurred in ReactApp', _context29.t0.stack || _context29.t0);

            case 20:
            case "end":
              return _context29.stop();
          }
        }
      }, _callee29, this, [[0, 16]]);
    }));

    return function (_x57, _x58) {
      return _ref38.apply(this, arguments);
    };
  }());
  server.get('/promo/mobile/thankyou',
  /*#__PURE__*/
  function () {
    var _ref40 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee30(req, res) {
      var sessionId, orderId;
      return _regenerator.default.wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.prev = 0;
              _context30.next = 3;
              return getSessionId(req, res);

            case 3:
              sessionId = _context30.sent;
              orderId = req.query.orderId; // redirectToPromo(orderId, req, res, () => {

              app.render(req, res, '/thankyou-page', {
                orderId: orderId,
                sessionId: sessionId,
                isPromo: true,
                device: 'mobile'
              }); // });

              _context30.next = 12;
              break;

            case 8:
              _context30.prev = 8;
              _context30.t0 = _context30["catch"](0);

              _raven.default.captureException(_context30.t0);

              console.error('Exception Occurred in ReactApp', _context30.t0.stack || _context30.t0);

            case 12:
            case "end":
              return _context30.stop();
          }
        }
      }, _callee30, this, [[0, 8]]);
    }));

    return function (_x59, _x60) {
      return _ref40.apply(this, arguments);
    };
  }());
  server.get('/promo/:useragent/*',
  /*#__PURE__*/
  function () {
    var _ref41 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee31(req, res) {
      var requestAgent;
      return _regenerator.default.wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              try {
                requestAgent = req.useragent.isMobile ? 'mobile' : 'desktop';
                res.redirect("/promo/".concat(requestAgent));
              } catch (error) {
                _raven.default.captureException(error);

                console.error('Exception Occurred in ReactApp', error.stack || error);
              }

            case 1:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31, this);
    }));

    return function (_x61, _x62) {
      return _ref41.apply(this, arguments);
    };
  }());
  server.get('/hemp-oil',
  /*#__PURE__*/
  function () {
    var _ref42 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee32(req, res) {
      return _regenerator.default.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.prev = 0;
              return _context32.abrupt("return", app.render(req, res, '/products', {
                product: 'hemp-oil'
              }));

            case 4:
              _context32.prev = 4;
              _context32.t0 = _context32["catch"](0);

              _raven.default.captureException(_context32.t0);

              console.error('Exception Occurred in ReactApp', _context32.t0.stack || _context32.t0);

            case 8:
            case "end":
              return _context32.stop();
          }
        }
      }, _callee32, this, [[0, 4]]);
    }));

    return function (_x63, _x64) {
      return _ref42.apply(this, arguments);
    };
  }());
  server.get('/hemp-capsule',
  /*#__PURE__*/
  function () {
    var _ref43 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee33(req, res) {
      return _regenerator.default.wrap(function _callee33$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              _context33.prev = 0;
              return _context33.abrupt("return", app.render(req, res, '/products', {
                product: 'hemp-capsule'
              }));

            case 4:
              _context33.prev = 4;
              _context33.t0 = _context33["catch"](0);

              _raven.default.captureException(_context33.t0);

              console.error('Exception Occurred in ReactApp', _context33.t0.stack || _context33.t0);

            case 8:
            case "end":
              return _context33.stop();
          }
        }
      }, _callee33, this, [[0, 4]]);
    }));

    return function (_x65, _x66) {
      return _ref43.apply(this, arguments);
    };
  }());
  server.get('/warming_balm',
  /*#__PURE__*/
  function () {
    var _ref44 = _asyncToGenerator(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee34(req, res) {
      return _regenerator.default.wrap(function _callee34$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              _context34.prev = 0;
              return _context34.abrupt("return", app.render(req, res, '/products', {
                product: 'warming_balm'
              }));

            case 4:
              _context34.prev = 4;
              _context34.t0 = _context34["catch"](0);

              _raven.default.captureException(_context34.t0);

              console.error('Exception Occurred in ReactApp', _context34.t0.stack || _context34.t0);

            case 8:
            case "end":
              return _context34.stop();
          }
        }
      }, _callee34, this, [[0, 4]]);
    }));

    return function (_x67, _x68) {
      return _ref44.apply(this, arguments);
    };
  }());
  server.get('*', function (req, res) {
    try {
      var permittedRoutes = ['/', '/faqs', '/contact', '/products'];

      if (req.url.indexOf('/static/') === -1 && req.url.indexOf('on-demand-entries-ping') === -1 && req.url.indexOf('_next') === -1 && req.url.indexOf('uploads') === -1 && !permittedRoutes.includes(req.url)) {
        console.log('coming here also');
        res.redirect("/promo?".concat(_querystring.default.stringify(req.query)));
      } else if (req.url === '/') {
        res.redirect('/promo');
      }

      return handle(req, res);
    } catch (error) {
      _raven.default.captureException(error);

      console.error('Exception Occurred in ReactApp', error.stack || error);
    }
  });
  server.listen(port, function (err) {
    if (err) throw err;
    console.log("> Ready on ".concat(port));
  });
});