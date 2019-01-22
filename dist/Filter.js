'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterSchema = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filterSchema = exports.filterSchema = yup.object({
  joiner: yup.string().oneOf(["and", "or"]).notRequired(),

  filters: yup.lazy(function () {
    return yup.array().notRequired().of(filterSchema.default(undefined));
  }),

  functionQuery: yup.object({
    name: yup.string().max(50),
    params: yup.array().of(yup.mixed()).nullable()
  }),

  eventQuery: yup.object({
    name: yup.string().max(50),
    attributes: yup.array().of(yup.mixed()).nullable()
  }),

  fields: yup.mixed().nullable()

});

var Filter = function () {
  _createClass(Filter, null, [{
    key: 'or',
    value: function or(filters) {
      var f = new Filter({
        joiner: 'or',
        filters: filters
      });
      filterSchema.validateSync(f);
      return f;
    }
  }, {
    key: 'and',
    value: function and(filters) {
      var f = new Filter({
        joiner: 'and',
        filters: filters
      });
      filterSchema.validateSync(f);
      return f;
    }
  }, {
    key: 'functionQuery',
    value: function functionQuery(spec) {
      //couldn't figure out the syntax needed for name validation on a
      //not-required field
      if (!spec.name) {
        (0, _utils._throw)("functionQuery", "name is required");
      }
      var f = new Filter({
        functionQuery: spec
      });
      filterSchema.validateSync(f);
      return f;
    }
  }, {
    key: 'eventQuery',
    value: function eventQuery(spec) {
      //couldn't figure out the syntax needed for name validation on a
      //not-required field
      if (!spec.name) {
        (0, _utils._throw)("eventQuery", "name is required");
      }
      var f = new Filter({
        eventQuery: spec
      });
      filterSchema.validateSync(f);
      return f;
    }
  }, {
    key: 'fields',
    value: function fields(spec) {
      var f = new Filter({
        fields: spec
      });
      filterSchema.validateSync(f);
      return f;
    }
  }]);

  function Filter(props) {
    _classCallCheck(this, Filter);

    this.joiner = props.joiner;
    this.filters = props.filters;
    this.functionQuery = props.functionQuery;
    this.eventQuery = props.eventQuery;
    this.fields = props.fields;
    if (!this.filters && !this.functionQuery && !this.eventQuery && !this.fields) {
      (0, _utils._throw)("Filter", "Requires at least sub-filters, a functionQuery, an eventQuery, or fields");
    }
  }

  return Filter;
}();

exports.default = Filter;