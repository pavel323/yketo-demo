"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _strictRateLimiter = _interopRequireDefault(require("strict-rate-limiter"));

var _raven = _interopRequireDefault(require("raven"));

var _Security = _interopRequireDefault(require("./Security"));

var _redisConfig = _interopRequireDefault(require("../redis-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var limitRequestsInterval = 60 * 1000; // 60 seconds

var limitRequestsNumber = 1000;
/**
 * Middleware for limiting the rate of requests. <br />
 * Currently we limit the number of requests from 1000.
 * Ratelimiter keeps the count of requests from a particular IP inside redis
 * and throws an error if the limit has been crossed
 * @namespace server-middleware
 * @param  {} req
 * @param  {} res
 * @param  {function()} next callback function
 */

var _default = function _default(req, res, next) {
  try {
    var id = _Security.default.getIp(req);

    if (!id) {
      return res.status(404).json({
        error: 'Invalid IP!'
      });
    } // allow 100 request / 60s


    var limiter = new _strictRateLimiter.default({
      id: id,
      limit: limitRequestsNumber,
      duration: limitRequestsInterval
    }, _redisConfig.default);
    return limiter.get(function (err, limit, remaining, reset) {
      if (err) {
        return next(err);
      }

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.floor(reset / 1000));

      if (remaining >= 0) {
        return next();
      } // limit exceeded


      res.setHeader('Retry-After', Math.floor((reset - new Date()) / 1000));
      res.statusCode = 429; // eslint-disable-line no-param-reassign
      // trace.incrementMetric(util.format('security/rateLimit'));

      return res.end('Rate limit exceeded.');
    });
  } catch (error) {
    _raven.default.captureException(error);

    console.error('Exception Occurred in ReactApp', error.stack || error);
  }
};

exports.default = _default;