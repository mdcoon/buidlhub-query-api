'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var empty = function empty(v) {
  if (typeof v === 'undefined' || v === null) {
    return true;
  }
  if (typeof v === 'string') {
    return v.trim().length === 0;
  }
  return false;
};

var _throw = function _throw(ctx, msg) {
  throw new Error('Context: \'' + ctx + '\' Message: ' + msg);
};

var isType = function isType(v, t) {
  if (t === 'number') {
    return !isNaN(v);
  }

  return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === t;
};

var propsCheck = function propsCheck(props, required, context) {
  if (!props && required) {
    _throw(context, "No properties provided");
  }

  if ((typeof props === 'undefined' ? 'undefined' : _typeof(props)) !== 'object') {
    _throw(context, "Properties must be an object");
  }

  required.forEach(function (rp) {
    var name = rp;
    if (rp.name) {
      name = rp.name;
    }
    var v = props[name];
    if (empty(v)) {
      _throw(context, "Missing property " + name);
    }
    if (rp.type) {
      if (!isType(v, rp.type)) {
        _throw(context, "Property " + name + " must be type: " + rp.type + " but is " + (typeof v === 'undefined' ? 'undefined' : _typeof(v)));
      }
    }
  });
};

exports.empty = empty;
exports.propsCheck = propsCheck;
exports._throw = _throw;