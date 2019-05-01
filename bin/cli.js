#!/usr/bin/env babel-node
'use strict';

var _publish = require('../lib/publish');

var _publish2 = _interopRequireDefault(_publish);

var _server = require('../lib/server');

var _server2 = _interopRequireDefault(_server);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-promise').polyfill();

var path = require('path');
var exec = require('child_process').execSync;
var execFile = require('child_process').execFileSync;

var fs = require('fs');
var packageContents = fs.readFileSync('./node_modules/fl-cli/package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

_commander2.default.version(packageObject.version).option('-s, --start', 'Start developer environment').option('-t, --theme', 'Theme developer mode').option('-b, --build', 'Build for production environment', false).option('-pn, --packageName [name]', 'Override the package name').option('-pv, --packageVariation [name]', 'Provide a package variation').option('-p, --publish', 'Publish application').option('-e, --env [env]', 'Environment override', 'prod').option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081).option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/config/webpack.config.prod.js').option('-d, --devconfig [config]', 'Override the dev config', './node_modules/fl-cli/lib/config/webpack.config.dev.js').parse(process.argv);

console.log('FoyerLive CLI: ' + _commander2.default.version() + ' - ENV ' + process.env);

// Port shift...
if (_commander2.default.port !== 9081) {
  process.env.FLDEVPORT = _commander2.default.port;
}

// Get environment
var env = process.env;

// Let theme mode pass a environment variable to the webpack config...
if (_commander2.default.theme) {
  console.log('Theme mode enabled...');
  process.env.FLDEVTHEME = true;
}

// If we are overriding the package name, lets plug that into the environment now...
if (_commander2.default.packageName) {
  process.env.PACKAGENAME = _commander2.default.packageName;
  console.log('Setting package name to:', _commander2.default.packageName);
}

// If we are overriding the package variation, lets plug that into the environment now...
if (_commander2.default.packageVariation) {
  process.env.PACKAGEVARIATION = _commander2.default.packageVariation;
  console.log('Setting package variation to:', _commander2.default.packageVariation);
}

// Run the development environment
if (_commander2.default.start) {
  (0, _server2.default)({
    config: _commander2.default.devconfig
  });
  /*try {
    let serverPath = path.join(path.resolve('./'), path.normalize('./node_modules/fl-cli/lib/devServer.js'));
    console.log('Server Path: ' + serverPath);
    execFile(serverPath, [], {
      stdio: 'inherit',
      env: env
    });
  } catch (err) {
    console.log('Failed');
    console.log('Error:');
    console.log(err);
  }*/
}

// Run the build...
if (_commander2.default.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });
  console.log('Build config:', _commander2.default.config);
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