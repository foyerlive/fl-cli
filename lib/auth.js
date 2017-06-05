'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAuth = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cliPrompt = require('cli-prompt');

var _cliPrompt2 = _interopRequireDefault(_cliPrompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getAuth = exports.getAuth = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var fileRef, authResult, promptResult, authRequest;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fileRef = './.auth' + (env ? '.' + env : '');
            _context.prev = 1;

            console.log('Stored Token Check: ' + fileRef);
            authResult = _fs2.default.readFileSync(fileRef, 'utf8');
            return _context.abrupt('return', authResult);

          case 7:
            _context.prev = 7;
            _context.t0 = _context['catch'](1);
            _context.next = 11;
            return requestAuth();

          case 11:
            promptResult = _context.sent;
            _context.next = 14;
            return sendAuth(promptResult, env);

          case 14:
            authRequest = _context.sent;

            if (authRequest) {
              // Store that result...
              _fs2.default.writeFileSync(fileRef, authRequest);
            }
            return _context.abrupt('return', authRequest);

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[1, 7]]);
  }));

  return function getAuth() {
    return _ref.apply(this, arguments);
  };
}();

var requestAuth = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', new Promise(function (resolve, reject) {
              _cliPrompt2.default.multi([{
                label: 'Username',
                key: 'username',
                default: 'foyer@foyerlive.com'
              }, {
                label: 'Password',
                key: 'password',
                type: 'password',
                validate: function validate(val) {
                  if (val.length < 5) throw new Error('password must be at least 5 characters long');
                }
              }], function (prompt) {
                return resolve(prompt);
              }, function (err) {
                return reject(err);
              });
            }));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function requestAuth() {
    return _ref2.apply(this, arguments);
  };
}();

var sendAuth = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(prompt) {
    var env = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var host;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            host = void 0;
            _context3.t0 = env;
            _context3.next = _context3.t0 === 'local' ? 4 : _context3.t0 === 'test' ? 6 : 8;
            break;

          case 4:
            host = 'http://internal.foyerlive.com:9030/api/auth';
            return _context3.abrupt('break', 10);

          case 6:
            host = 'https://staging.foyerlive.com/api/auth';
            return _context3.abrupt('break', 10);

          case 8:
            host = 'https://api.foyerlive.com/api/auth';
            return _context3.abrupt('break', 10);

          case 10:
            return _context3.abrupt('return', (0, _nodeFetch2.default)(host, {
              method: 'POST', body: JSON.stringify({ _username: prompt.username, _password: prompt.password }), headers: {
                'Content-Type': 'application/json'
              }
            }).then(function (res) {
              return res.json();
            }).then(function (json) {
              if (!json.success) throw json.error;
              return json.data.key;
            }).catch(function (err) {
              console.error(err);
              return false;
            }));

          case 11:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function sendAuth(_x2) {
    return _ref3.apply(this, arguments);
  };
}();