"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = injectDOM;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function injectDOM() {
  var description = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
  var parentNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var _description$split = description.split('.'),
      _description$split2 = _slicedToArray(_description$split, 2),
      type = _description$split2[0],
      classNames = _description$split2[1];

  var node = document.createElement(type);
  if (classNames) node.className = classNames;
  if (parentNode == null) document.body.appendChild(node);else parentNode.appendChild(node);
  return node;
}