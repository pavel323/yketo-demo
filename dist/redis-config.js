"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ioredis = _interopRequireDefault(require("ioredis"));

var _winston = _interopRequireDefault(require("winston"));

var _raven = _interopRequireDefault(require("raven"));

var _serverConfig = _interopRequireDefault(require("./server-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var redisUrl = _serverConfig.default.redis.REDIS_URL;
var redis = new _ioredis.default(redisUrl, {
  dropBufferSupport: true
});
var _redis$connector$opti = redis.connector.options,
    host = _redis$connector$opti.host,
    port = _redis$connector$opti.port;
redis.on('connect', function () {
  _winston.default.verbose('redis:connect', {
    host: host,
    port: port,
    type: 'redis:connect',
    env: _serverConfig.default.ENV
  });
});
redis.on('error', function (e) {
  _winston.default.error('redis:error', {
    host: host,
    port: port,
    type: 'redis:error',
    env: _serverConfig.default.ENV
  });

  _raven.default.captureException(e);

  console.log(e); // process.exit(1);
  // app requires the redis to run
  // failing to run redis will result in app crash
});
var _default = redis;
exports.default = _default;