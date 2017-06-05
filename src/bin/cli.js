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
.option('-p, --publish', 'Publish application')
.option('-e, --env [env]', 'Environment override', 'prod')
.option('-p, --port [port]', 'Override the development server port (Not available for themes)', 9081)
.option('-c, --config [config]', 'Override the build config', './node_modules/fl-cli/lib/config/webpack.config.prod.js')
.parse(process.argv);

console.log('FoyerLive CLI: ' + program.version());

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

// Run the development environment
if (program.start) {
  server();
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
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });
  console.log('Build config:', program.config);
  console.log('Memory: 4096');
  exec('NODE_ENV=production node --max_old_space_size=4096 ./node_modules/.bin/webpack --config ' + program.config, {
    stdio: 'inherit',
    env: env
  });
}

// Run a publish...
if (program.publish) {
  publish(program.env).catch((err) => {
    console.error(err);
  });
}