#!/usr/bin/env node
"use strict";

var _publish = _interopRequireDefault(require("../lib/publish"));

var _server = _interopRequireDefault(require("../lib/server"));

var _debug = _interopRequireDefault(require("debug"));

var _commander = _interopRequireDefault(require("commander"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-promise').polyfill();

const internalIp = require('internal-ip');

const exec = require('child_process').execSync;

var fs = require('fs');

var packageContents = fs.readFileSync('./node_modules/fl-cli/package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

_debug.default.enable('foyer*');

const d = (0, _debug.default)('foyer');

_commander.default.version(packageObject.version).option('-s, --start', 'Start developer environment').option('-r, --remote', 'Run dev-server on local IP', false).option('-t, --theme', 'Theme developer mode').option('-b, --build', 'Build for production environment', false).option('-a, --analyze', 'Analyze the build', false).option('-bv, --buildVersion', 'Add build number to the version', false).option('-nm, --noMinimize', 'Do not minimize the build', false).option('-pn, --packageName [name]', 'Override the package name').option('-pv, --packageVariation [name]', 'Provide a package variation').option('-p, --publish', 'Publish application').option('-e, --env [env]', 'Environment override', 'prod').option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081).option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/configs/webpack/webpack.config.prod.js').option('-d, --devconfig [config]', 'Override the dev config', './node_modules/fl-cli/lib/configs/webpack/webpack.config.dev.js').option('-n, --next-gen', 'Next gen building', true).parse(process.argv);

console.log('   _____                 ');
console.log('  |   __|___ _ _ ___ ___ ');
console.log('  |   __| . | | | -_|  _|');
console.log('  |__|  |___|_  |___|_|  ');
console.log('            |___|        ');
console.log(''); // Port shift...

if (_commander.default.port !== 9081) {
  process.env.FLDEVPORT = _commander.default.port;
} // Remote dev-server


if (_commander.default.remote) {
  process.env.FLDEVHOST = internalIp.v4.sync();
} // Get environment


let env = process.env; // Next-gen support
// Let theme mode pass a environment variable to the webpack config...

if (_commander.default.theme) {
  console.log('Theme mode enabled...');
  process.env.FLDEVTHEME = true;
} // Are we analyzing?


if (_commander.default.analyze) {
  process.env.WEBPACK_ANALYZE = true;
} // Are we adding a build version?


if (_commander.default.buildVersion) {
  process.env.WEBPACK_ADD_BUILD_VERSION = true;
} // Are we ignoring minimization?


if (_commander.default.noMinimize) {
  console.log('Will not minimize');
  process.env.WEBPACK_NO_MINIMIZE = true;
} // If we are overriding the package name, lets plug that into the environment now...


if (_commander.default.packageName) {
  process.env.PACKAGENAME = _commander.default.packageName;
  console.log('Setting package name to:', _commander.default.packageName);
} // If we are overriding the package variation, lets plug that into the environment now...


if (_commander.default.packageVariation) {
  process.env.PACKAGEVARIATION = _commander.default.packageVariation;
  console.log('Setting package variation to:', _commander.default.packageVariation);
} // Run the development environment


if (_commander.default.start) {
  console.log('Dev config:', _commander.default.devconfig);
  (0, _server.default)({
    config: _commander.default.devconfig,
    nextGen: _commander.default.nextGen
  });
} // Run the build...


if (_commander.default.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });
  console.log('Build config:', _commander.default.config);
  exec('NODE_ENV=production node --max_old_space_size=4096 ./node_modules/.bin/webpack --config ' + _commander.default.config, {
    stdio: 'inherit',
    env: env
  });
} // Run a publish...


if (_commander.default.publish) {
  (0, _publish.default)(_commander.default.env).catch(err => {
    console.error(err);
  });
}