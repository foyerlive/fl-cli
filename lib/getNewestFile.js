'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getNewestFile = function getNewestFile(dir, regexp) {
  var newest = null;
  var files = _fs2.default.readdirSync(dir);
  var one_matched = 0;

  for (var i = 0; i < files.length; i++) {

    if (regexp.test(files[i]) == false) continue;else if (one_matched == 0) {
      newest = files[i];
      one_matched = 1;
      continue;
    }

    f1_time = _fs2.default.statSync(files[i]).mtime.getTime();
    f2_time = _fs2.default.statSync(newest).mtime.getTime();
    if (f1_time > f2_time) newest[i] = files[i];
  }

  if (newest != null) return dir + newest;
  return null;
};

exports.default = getNewestFile;