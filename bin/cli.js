#!/usr/bin/env babel-node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _auth = require('../lib/auth');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('es6-promise').polyfill();


var FormData = require('form-data');
var fs = require('fs');

var exec = require('child_process').execSync;
var execFile = require('child_process').execFileSync;

_commander2.default.version('1.0.2').option('-s, --start', 'Start developer environment').option('-t, --theme', 'Theme developer mode').option('-b, --build', 'Build for production environment').option('-p, --publish', 'Publish application').option('-e, --env [env]', 'Environment override', 'prod').option('-p, --port [port]', 'Override the development server port', 9081).parse(process.argv);

console.log('FoyerLive CLI: ' + _commander2.default.version());

// Port shift...
if (_commander2.default.port !== 9081) process.env.FLDEVPORT = _commander2.default.port;

// Get environment
var env = process.env;

// Let theme mode pass a environment variable to the webpack config...
if (_commander2.default.theme) env = _extends({}, env, { foyerThemeMode: true, foyerDevelopmentPort: 9082 });

// Run the development environment
if (_commander2.default.start) {
  execFile('./node_modules/fl-cli/lib/devServer.js', [], {
    stdio: 'inherit',
    env: env
  });
}
if (_commander2.default.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });

  exec('NODE_ENV=production ./node_modules/.bin/webpack --config ./node_modules/fl-cli/lib/config/webpack.config.prod.js', {
    stdio: 'inherit',
    env: env
  });
}
if (_commander2.default.publish) {
  publish(_commander2.default.env).catch(function (err) {
    console.error(err);
  });
}

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
            file = getNewestFile('./dist/', new RegExp('.*\.js$'));

            console.log('Deploying file: ' + file);

            packageContents = fs.readFileSync('./package.json', 'utf8');
            packageObject = JSON.parse(packageContents);
            fileContents = fs.readFileSync(file, 'utf8');
            form = new FormData();

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
            _context.next = _context.t0 === 'local' ? 22 : _context.t0 === 'test' ? 24 : 26;
            break;

          case 22:
            host = 'http://internal.foyerlive.com:9030/api/app/publish';
            return _context.abrupt('break', 28);

          case 24:
            host = 'https://staging.foyerlive.com/api/app/publish';
            return _context.abrupt('break', 28);

          case 26:
            host = 'https://api.foyerlive.com/api/app/publish';
            return _context.abrupt('break', 28);

          case 28:
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

          case 29:
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

var getNewestFile = function getNewestFile(dir, regexp) {
  var newest = null;
  var files = fs.readdirSync(dir);
  var one_matched = 0;

  for (var i = 0; i < files.length; i++) {

    if (regexp.test(files[i]) == false) continue;else if (one_matched == 0) {
      newest = files[i];
      one_matched = 1;
      continue;
    }

    f1_time = fs.statSync(files[i]).mtime.getTime();
    f2_time = fs.statSync(newest).mtime.getTime();
    if (f1_time > f2_time) newest[i] = files[i];
  }

  if (newest != null) return dir + newest;
  return null;
};