"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAuth = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _fs = _interopRequireDefault(require("fs"));

var _cliPrompt = _interopRequireDefault(require("cli-prompt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getAuth = function getAuth() {
  var env,
      fileRef,
      authResult,
      promptResult,
      authRequest,
      _args = arguments;
  return regeneratorRuntime.async(function getAuth$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          env = _args.length > 0 && _args[0] !== undefined ? _args[0] : '';
          fileRef = './.auth' + (env ? '.' + env : '');
          _context.prev = 2;
          console.log('Stored Token Check: ' + fileRef);
          authResult = _fs["default"].readFileSync(fileRef, 'utf8');
          return _context.abrupt("return", authResult);

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](2);
          _context.next = 12;
          return regeneratorRuntime.awrap(requestAuth());

        case 12:
          promptResult = _context.sent;
          _context.next = 15;
          return regeneratorRuntime.awrap(sendAuth(promptResult, env));

        case 15:
          authRequest = _context.sent;

          if (authRequest) {
            // Store that result...
            _fs["default"].writeFileSync(fileRef, authRequest);
          }

          return _context.abrupt("return", authRequest);

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 8]]);
};

exports.getAuth = getAuth;

var requestAuth = function requestAuth() {
  return regeneratorRuntime.async(function requestAuth$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.abrupt("return", new Promise(function (resolve, reject) {
            _cliPrompt["default"].multi([{
              label: 'Username',
              key: 'username',
              "default": 'foyer@foyerlive.com'
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
        case "end":
          return _context2.stop();
      }
    }
  });
};

var sendAuth = function sendAuth(prompt) {
  var env,
      host,
      _args3 = arguments;
  return regeneratorRuntime.async(function sendAuth$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          env = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : '';
          _context3.t0 = env;
          _context3.next = _context3.t0 === 'local' ? 4 : _context3.t0 === 'stage' ? 6 : _context3.t0 === 'test' ? 8 : 10;
          break;

        case 4:
          host = 'http://localhost.foyerlive.com:9030/api/auth';
          return _context3.abrupt("break", 12);

        case 6:
          host = 'https://stage.foyerlive.com/api/auth';
          return _context3.abrupt("break", 12);

        case 8:
          host = 'https://staging.foyerlive.com/api/auth';
          return _context3.abrupt("break", 12);

        case 10:
          host = 'https://api.foyerlive.com/api/auth';
          return _context3.abrupt("break", 12);

        case 12:
          return _context3.abrupt("return", (0, _nodeFetch["default"])(host, {
            method: 'POST',
            body: JSON.stringify({
              _username: prompt.username,
              _password: prompt.password
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(function (res) {
            return res.json();
          }).then(function (json) {
            if (!json.success) throw json.error;
            return json.data.key;
          })["catch"](function (err) {
            console.error(err);
            return false;
          }));

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  });
};