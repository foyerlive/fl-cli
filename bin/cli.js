#!/usr/bin/env babel-node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _publish = require('../lib/publish');

var _publish2 = _interopRequireDefault(_publish);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-promise').polyfill();

var exec = require('child_process').execSync;
var execFile = require('child_process').execFileSync;

var fs = require('fs');
var packageContents = fs.readFileSync('./node_modules/fl-cli/package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

_commander2.default.version(packageObject.version).option('-s, --start', 'Start developer environment').option('-t, --theme', 'Theme developer mode').option('-b, --build', 'Build for production environment', false).option('-p, --publish', 'Publish application').option('-e, --env [env]', 'Environment override', 'prod').option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081).option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/config/webpack.config.prod.js').parse(process.argv);

console.log('FoyerLive CLI: ' + _commander2.default.version());

// Port shift...
if (_commander2.default.port !== 9081) {
  process.env.FLDEVPORT = _commander2.default.port;
}

// Get environment
var env = process.env;

// Let theme mode pass a environment variable to the webpack config...
if (_commander2.default.theme) {
  console.log('Theme mode enabled...');
  env = _extends({}, env, { foyerThemeMode: true, FLDEVPORT: 9082 });
}

// Run the development environment
if (_commander2.default.start) {
  execFile('./node_modules/fl-cli/lib/devServer.js', [], {
    stdio: 'inherit',
    env: env
  });
}

// Run the build...
if (_commander2.default.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });
  console.log('Build config:', _commander2.default.config);
  console.log('Memory: 4096');
  exec('NODE_ENV=production node --max_old_space_size=4096 ./node_modules/.bin/webpack --config ' + _commander2.default.config, {
    stdio: 'inherit',
    env: env
  });
}

// Run a publish...
if (_commander2.default.publish) {
  (0, _publish2.default)(_commander2.default.env).catch(function (err) {
    console.error(err);
  });
}