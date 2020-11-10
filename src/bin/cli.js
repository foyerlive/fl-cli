#!/usr/bin/env babel-node
require('es6-promise').polyfill();

var path = require('path');
const exec = require('child_process').execSync;
const execFile = require('child_process').execFileSync;

var fs = require('fs');
var packageContents = fs.readFileSync('./node_modules/fl-cli/package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

import publish from '../lib/publish';
import server from '../lib/server';

import program from 'commander';

program
  .version(packageObject.version)
  .option('-s, --start', 'Start developer environment')
  .option('-t, --theme', 'Theme developer mode')
  .option('-b, --build', 'Build for production environment', false)
  .option('-pn, --packageName [name]', 'Override the package name')
  .option('-pv, --packageVariation [name]', 'Provide a package variation')
  .option('-p, --publish', 'Publish application')
  .option('-e, --env [env]', 'Environment override', 'prod')
  .option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081)
  .option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/config/webpack.config.prod.js')
  .option('-d, --devconfig [config]', 'Override the dev config', './node_modules/fl-cli/lib/config/webpack.config.dev.js')
  .parse(process.argv);

console.log('FoyerLive CLI: ' + program.version() + ' - ENV ' + process.env);

// Port shift...
if (program.port !== 9081) {
  process.env.FLDEVPORT = program.port;
}

// Get environment
let env = process.env;

// Let theme mode pass a environment variable to the webpack config...
if (program.theme) {
  console.log('Theme mode enabled...');
  process.env.FLDEVTHEME = true;
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
    config: program.devconfig,
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
if (program.build) {
  exec(`${path.normalize('./node_modules/.bin/eslint')} ${path.normalize('src/')} && ${path.normalize('./node_modules/.bin/rimraf')} dist`, {
    stdio: 'inherit',
  });
  console.log('Build config:', program.config);
  exec(`NODE_ENV=production node --max_old_space_size=4096 ${path.normalize('./node_modules/.bin/webpack')} --config ` + program.config, {
    stdio: 'inherit',
    env: env,
  });
}

// Run a publish...
if (program.publish) {
  publish(program.env).catch(err => {
    console.error(err);
  });
}
