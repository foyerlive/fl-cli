'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _getNewestFile = require('./getNewestFile');

var _getNewestFile2 = _interopRequireDefault(_getNewestFile);

var _auth = require('./auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var publish = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(env) {
    var authResult, file, packageContents, packageObject, fileContents, form, headers, host;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('Publishing Time: ' + env);
            console.log('Checking authentication...');
            _context.next = 4;
            return (0, _auth.getAuth)(env).catch(function (err) {
              console.log('Caught an error', err);
              return false;
            });

          case 4:
            authResult = _context.sent;

            if (authResult) {
              _context.next = 7;
              break;
            }

            throw 'No auth available...';

          case 7:

            console.log('Using token: ' + authResult);
            file = (0, _getNewestFile2.default)('./dist/', new RegExp('.*\.js$'));

            console.log('Deploying file: ' + file);

            packageContents = _fs2.default.readFileSync('./package.json', 'utf8');
            packageObject = JSON.parse(packageContents);
            fileContents = _fs2.default.readFileSync(file, 'utf8');
            form = new _formData2.default();

            form.append('app', packageObject.name);
            form.append('file', fileContents);
            form.append('filename', file.substring(7));

            headers = {
              'Accept': 'application/json',
              'Content-Type': form.getHeaders()['content-type'],
              'Authorization': authResult
            };
            host = void 0;
            _context.t0 = env;
            _context.next = _context.t0 === 'local' ? 22 : _context.t0 === 'stage' ? 24 : _context.t0 === 'test' ? 26 : 28;
            break;

          case 22:
            host = 'http://internal.foyerlive.com:9030/api/app/publish';
            return _context.abrupt('break', 30);

          case 24:
            host = 'https://stage.foyerlive.com/api/app/publish';
            return _context.abrupt('break', 30);

          case 26:
            host = 'https://staging.foyerlive.com/api/app/publish';
            return _context.abrupt('break', 30);

          case 28:
            host = 'https://api.foyerlive.com/api/app/publish';
            return _context.abrupt('break', 30);

          case 30:
            (0, _nodeFetch2.default)(host, {
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
              } else {
                console.log('Error!', json);
              }
            }).catch(function (err) {
              console.error('An error has occurred', err);
            });

          case 31:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function publish(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = publish;