"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var redisUrl = 'redis://127.0.0.1:6379/';

if (process.env.REDIS_URL) {
  redisUrl = process.env.REDIS_URL;
}

var _default = {
  ENV: process.env.NODE_ENV,
  buildId: 'heroku',
  redis: {
    REDIS_URL: redisUrl
  },
  secret: process.env.SESSION_SECRET || 'abcbdsecret'
};
exports.default = _default;