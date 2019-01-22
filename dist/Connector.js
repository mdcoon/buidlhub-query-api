'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var postSchema = yup.object({
  token: yup.string().required(),
  url: yup.string().required(),
  data: yup.mixed().required()
});

var BASE_URL = "https://buidlhub.com";

var Connector = function () {
  function Connector() {
    _classCallCheck(this, Connector);
  }

  _createClass(Connector, [{
    key: 'get',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, token) {
        var headers, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!url.startsWith(BASE_URL)) {
                  if (url.startsWith("/")) {
                    url = url.substring(1);
                  }
                  url = BASE_URL + '/' + url;
                }
                headers = undefined;

                if (token) {
                  headers = { 'Authorization': 'Bearer ' + token };
                }
                _context.next = 5;
                return (0, _axios2.default)({
                  method: "GET",
                  headers: headers,
                  url: url
                });

              case 5:
                res = _context.sent;
                return _context.abrupt('return', res.data);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'post',
    value: function post(props) {
      var _this = this;

      return new Promise(function (done, err) {
        _this._post({
          count: 0,
          retries: 10,
          cb: function cb(e, ctx, res) {
            if (e) {
              if (ctx.count >= ctx.retries) {
                //timeout
                err(e);
              } else if (e.response && e.response.status === 429) {
                console.log("Throttling requests...");
                //only retries if throttling requests
                var waitTime = (ctx.count + 1) * 1000;
                setTimeout(function () {
                  _this._post(_extends({}, ctx, {
                    count: ctx.count + 1
                  }), props);
                }, waitTime);
              } else {
                err(e);
              }
            } else {
              done(res);
            }
          }
        }, props);
      });
    }
  }, {
    key: '_post',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx, props) {
        var headers, url, data, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                postSchema.validateSync(props);
                headers = { 'Authorization': 'Bearer ' + props.token };
                url = props.url;
                data = props.data;

                if (!url.startsWith(BASE_URL)) {
                  if (url.startsWith("/")) {
                    url = url.substring(1);
                  }
                  url = BASE_URL + '/' + url;
                }

                _context2.prev = 5;
                _context2.next = 8;
                return (0, _axios2.default)({
                  method: 'POST',
                  headers: headers,
                  url: url,
                  data: data
                });

              case 8:
                res = _context2.sent;

                ctx.cb(null, ctx, res.data);
                _context2.next = 15;
                break;

              case 12:
                _context2.prev = 12;
                _context2.t0 = _context2['catch'](5);

                ctx.cb(_context2.t0, ctx);

              case 15:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 12]]);
      }));

      function _post(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return _post;
    }()
  }, {
    key: 'stale',
    value: function stale(token) {
      if (!token) {
        return true;
      }

      var payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var exp = payload.exp * 1000;
      var now = Date.now();
      return exp < now;
    }
  }]);

  return Connector;
}();

exports.default = Connector;