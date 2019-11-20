"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getNewestFile = function getNewestFile(dir, regexp) {
  var newest = null;

  var files = _fs["default"].readdirSync(dir);

  var one_matched = 0;

  for (var i = 0; i < files.length; i++) {
    if (regexp.test(files[i]) == false) continue;else if (one_matched == 0) {
      newest = files[i];
      one_matched = 1;
      continue;
    }
    f1_time = _fs["default"].statSync(files[i]).mtime.getTime();
    f2_time = _fs["default"].statSync(newest).mtime.getTime();
    if (f1_time > f2_time) newest[i] = files[i];
  }

  if (newest != null) return dir + newest;
  return null;
};

var _default = getNewestFile;
exports["default"] = _default;