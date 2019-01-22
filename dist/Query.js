'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Filter = require('./Filter');

var _Filter2 = _interopRequireDefault(_Filter);

var _utils = require('./utils');

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schema = yup.object({
  client: yup.mixed().required(),
  contracts: yup.array().of(yup.string().max(42).matches(/^0x/)).required(),
  filter: _Filter.filterSchema.clone().required(),
  groupBy: yup.string().max(50),
  timeRange: yup.object({
    start: yup.number().positive().integer(),
    end: yup.number().positive().integer()
  }),
  limit: yup.number().positive().integer(),
  offset: yup.number().moreThan(-1).integer(),
  count: yup.boolean()
});

/**
  * Query class. This is created by the BHubClient but is also possible
  * to create directly.
  */

var Query = function () {
  function Query(props) {
    var _this = this;

    _classCallCheck(this, Query);

    schema.validateSync(props);
    this.client = props.client;
    this.contracts = props.contracts;
    this.filter = props.filter;

    //all extra fields
    this.groupBy = props.groupBy;
    this.limit = props.limit || 10;
    this.offset = props.offset || 0;
    this.count = props.count;
    this.timeRange = props.timeRange;
    if (props.timeRange && props.timeRange.start > props.timeRange.end) {
      (0, _utils._throw)("Query", "range start must be before range end");
    }

    ['execute'].forEach(function (fn) {
      _this[fn] = _this[fn].bind(_this);
    });
  }

  /**
    * Execute the query (async).
  */


  _createClass(Query, [{
    key: 'execute',
    value: function execute() {
      schema.validateSync(this);
      return this.client._runQuery(this);
    }
  }]);

  return Query;
}();

exports.default = Query;