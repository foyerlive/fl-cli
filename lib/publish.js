"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _fs = _interopRequireDefault(require("fs"));

var _formData = _interopRequireDefault(require("form-data"));

var _getNewestFile = _interopRequireDefault(require("./getNewestFile"));

var _auth = require("./auth");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var publish = function publish(env) {
  var authResult, file, packageContents, packageObject, fileContents, form, packageName, headers, host;
  return regeneratorRuntime.async(function publish$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('Publishing Time: ' + env);
          console.log('Checking authentication...');
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _auth.getAuth)(env)["catch"](function (err) {
            console.log('Caught an error', err);
            return false;
          }));

        case 4:
          authResult = _context.sent;

          if (authResult) {
            _context.next = 7;
            break;
          }

          throw 'No auth available...';

        case 7:
          console.log('Using token: ' + authResult);
          file = (0, _getNewestFile["default"])('./dist/', new RegExp('.*.js$'));
          console.log('Deploying file: ' + file);
          packageContents = _fs["default"].readFileSync('./package.json', 'utf8');
          packageObject = JSON.parse(packageContents);
          fileContents = _fs["default"].readFileSync(file, 'utf8');
          form = new _formData["default"](); // Support additional build variation flag...

          packageName = _lodash["default"].get(process, 'env.PACKAGENAME', 'default');

          if (packageName !== 'default') {
            console.log('Package Name Override:', packageName);
            form.append('app', packageName);
          } else {
            form.append('app', packageObject.name);
          }

          form.append('filename', file.substring(7));
          form.append('file', fileContents);
          headers = {
            Accept: 'application/json',
            'Content-Type': form.getHeaders()['content-type'],
            Authorization: authResult
          };
          _context.t0 = env;
          _context.next = _context.t0 === 'local' ? 22 : _context.t0 === 'stage' ? 24 : _context.t0 === 'test' ? 26 : 28;
          break;

        case 22:
          host = 'http://localhost.foyerlive.com:9030/api/app/publish';
          return _context.abrupt("break", 30);

        case 24:
          host = 'https://stage.foyerlive.com/api/app/publish';
          return _context.abrupt("break", 30);

        case 26:
          host = 'https://staging.foyerlive.com/api/app/publish';
          return _context.abrupt("break", 30);

        case 28:
          host = 'https://api.foyerlive.com/api/app/publish';
          return _context.abrupt("break", 30);

        case 30:
          (0, _nodeFetch["default"])(host, {
            method: 'POST',
            headers: headers,
            body: form
          }).then(function (response) {
            return response.json();
          }).then(function (json) {
            if (json.success) {
              console.log('Success!');
              if (json.hasOwnProperty('message')) console.log(json.message);
              if (json.hasOwnProperty('data') && json.data.hasOwnProperty('message')) console.log(json.data.message);
              console.log(json);
            } else {
              console.log('Error!', json);
            }
          })["catch"](function (err) {
            console.error('An error has occurred', err);
          });

        case 31:
        case "end":
          return _context.stop();
      }
    }
  });
};

var _default = publish;
exports["default"] = _default;