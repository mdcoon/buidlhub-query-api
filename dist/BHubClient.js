'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Query = require('./Query');

var _Query2 = _interopRequireDefault(_Query);

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

var _Connector = require('./Connector');

var _Connector2 = _interopRequireDefault(_Connector);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schema = yup.object({
  apiKey: yup.string().required(),
  connector: yup.mixed()
});

var ACCESS_URL = '/api/auth/apiAccess';
var QUERY_URL = '/api/cache/query';

var inst = null;

var BHubClient = function () {
  _createClass(BHubClient, null, [{
    key: 'init',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(props) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:

                if (!inst) {
                  inst = new BHubClient(props);
                }

                if (!(!inst.connected || inst.stale())) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return inst.connect();

              case 4:
                return _context.abrupt('return', inst);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'instance',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (inst) {
                  _context2.next = 2;
                  break;
                }

                throw new Error("Must initialize BHub client first");

              case 2:
                if (!(!inst.connected || inst.stale())) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 5;
                return inst.connect();

              case 5:
                return _context2.abrupt('return', inst);

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function instance() {
        return _ref2.apply(this, arguments);
      }

      return instance;
    }()
  }]);

  function BHubClient(props) {
    var _this = this;

    _classCallCheck(this, BHubClient);

    schema.validateSync(props);

    this.apiKey = props.apiKey;
    this.connector = props.connector;
    if (!this.connector) {
      this.connector = new _Connector2.default();
    }

    this.connected = false;
    ['connect', 'stale', 'query', 'count', '_runQuery'].forEach(function (fn) {
      _this[fn] = _this[fn].bind(_this);
    });
  }

  _createClass(BHubClient, [{
    key: 'connect',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var url, res, token;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                url = ACCESS_URL + '/' + this.apiKey;
                _context3.next = 3;
                return this.connector.get(url);

              case 3:
                res = _context3.sent;
                token = res.token;

                if (token) {
                  _context3.next = 7;
                  break;
                }

                throw new Error("Could not connect to BUIDLHub for access token");

              case 7:
                this.token = token;
                this.connected = true;

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function connect() {
        return _ref3.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: 'stale',
    value: function stale() {
      return this.connector.stale(this.token);
    }
  }, {
    key: 'query',
    value: function query(props) {
      return new _Query2.default(_extends({}, props, {
        client: this
      }));
    }
  }, {
    key: 'count',
    value: function count(props) {
      return new _Query2.default(_extends({}, props, {
        client: this,
        count: true
      }));
    }
  }, {
    key: '_runQuery',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(query) {
        var url, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                url = QUERY_URL;

                if (!this.stale()) {
                  _context4.next = 4;
                  break;
                }

                _context4.next = 4;
                return this.connect();

              case 4:
                _context4.next = 6;
                return this.connector.post({
                  url: url,
                  token: this.token,
                  data: _extends({}, query, {
                    client: undefined
                  })
                });

              case 6:
                res = _context4.sent;
                return _context4.abrupt('return', res);

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _runQuery(_x2) {
        return _ref4.apply(this, arguments);
      }

      return _runQuery;
    }()
  }]);

  return BHubClient;
}();

exports.default = BHubClient;