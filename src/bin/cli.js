#!/usr/bin/env babel-node
require('es6-promise').polyfill();
import fetch from 'node-fetch';

var FormData = require('form-data');
var fs = require('fs');

const exec = require('child_process').execSync;
const execFile = require('child_process').execFileSync;

import publish from '../lib/publish';

import program from 'commander';


program
  .version('1.0.2')
  .option('-s, --start', 'Start developer environment')
  .option('-t, --theme', 'Theme developer mode')
  .option('-b, --build', 'Build for production environment')
  .option('-p, --publish', 'Publish application')
  .option('-e, --env [env]', 'Environment override', 'prod')
  .option('-p, --port [port]', 'Override the development server port', 9081)
  .parse(process.argv);

console.log('FoyerLive CLI: ' + program.version());

// Port shift...
if (program.port !== 9081)
  process.env.FLDEVPORT = program.port;

// Get environment
let env = process.env;

// Let theme mode pass a environment variable to the webpack config...
if (program.theme)
  env = {...env, foyerThemeMode: true, foyerDevelopmentPort: 9082};

// Run the development environment
if (program.start) {
  execFile('./node_modules/fl-cli/lib/devServer.js', [], {
    stdio: 'inherit',
    env: env
  });
}
if (program.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });

  exec('NODE_ENV=production ./node_modules/.bin/webpack --config ./node_modules/fl-cli/lib/config/webpack.config.prod.js', {
    stdio: 'inherit',
    env: env
  });
}
if (program.publish) {
  publish(program.env).catch((err) => {
    console.error(err);
  });
}