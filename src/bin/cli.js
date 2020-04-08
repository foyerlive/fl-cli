#!/usr/bin/env node
require('es6-promise').polyfill();

const internalIp = require('internal-ip');
const exec = require('child_process').execSync;

var fs = require('fs');
var packageContents = fs.readFileSync('./node_modules/fl-cli/package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

import publish from '../lib/publish';
import server from '../lib/server';
import debug from 'debug';
debug.enable('foyer*');
const d = debug('foyer');

import program from 'commander';

program
  .version(packageObject.version)
  .option('-s, --start', 'Start developer environment')
  .option('-r, --remote', 'Run dev-server on local IP', false)
  .option('-t, --theme', 'Theme developer mode')
  .option('-b, --build', 'Build for production environment', false)
  .option('-a, --analyze', 'Analyze the build', false)
  .option('-bv, --buildVersion', 'Add build number to the version', false)
  .option('-pn, --packageName [name]', 'Override the package name')
  .option('-pv, --packageVariation [name]', 'Provide a package variation')
  .option('-p, --publish', 'Publish application')
  .option('-e, --env [env]', 'Environment override', 'prod')
  .option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081)
  .option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/configs/webpack/webpack.config.prod.js')
  .option('-d, --devconfig [config]', 'Override the dev config', './node_modules/fl-cli/lib/config/webpack.config.dev.js')
  .option('-n, --next-gen', 'Next gen building', true)
  .parse(process.argv);

console.log('   _____                 ');
console.log('  |   __|___ _ _ ___ ___ ');
console.log('  |   __| . | | | -_|  _|');
console.log('  |__|  |___|_  |___|_|  ');
console.log('            |___|        ');
console.log('');

// Port shift...
if (program.port !== 9081) {
  process.env.FLDEVPORT = program.port;
}

// Remote dev-server
if (program.remote) {
  process.env.FLDEVHOST = internalIp.v4.sync();
}

// Get environment
let env = process.env;

// Next-gen support
const devConfig = program.nextGen ? './node_modules/fl-cli/lib/configs/webpack/webpack.config.dev.js' : './node_modules/fl-cli/lib/webpack.config.dev.js';

// Let theme mode pass a environment variable to the webpack config...
if (program.theme) {
  console.log('Theme mode enabled...');
  process.env.FLDEVTHEME = true;
}

// Are we analyzing?
if (program.analyze) {
  process.env.WEBPACK_ANALYZE = true;
}

// Are we adding a build version?
if (program.buildVersion) {
  process.env.WEBPACK_ADD_BUILD_VERSION = true;
}

// If we are overriding the package name, lets plug that into the environment now...
if (program.packageName) {
  process.env.PACKAGENAME = program.packageName;
  console.log('Setting package name to:', program.packageName);
}

// If we are overriding the package variation, lets plug that into the environment now...
if (program.packageVariation) {
  process.env.PACKAGEVARIATION = program.packageVariation;
  console.log('Setting package variation to:', program.packageVariation);
}

// Run the development environment
if (program.start) {
  server({
    config: devConfig,
    nextGen: program.nextGen,
  });
}

// Run the build...
if (program.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit',
  });
  console.log('Build config:', program.config);
  exec('NODE_ENV=production node --max_old_space_size=4096 ./node_modules/.bin/webpack --config ' + program.config, {
    stdio: 'inherit',
    env: env,
  });
}

// Run a publish...
if (program.publish) {
  publish(program.env).catch((err) => {
    console.error(err);
  });
}
