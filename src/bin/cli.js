#!/usr/bin/env babel-node
require('es6-promise').polyfill();
import fetch from 'node-fetch';

var FormData = require('form-data');
var fs = require('fs');

const exec = require('child_process').execSync;
const execFile = require('child_process').execFileSync;

import {getAuth} from '../lib/auth';

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

const publish = async(env) => {
  console.log('Publishing Time: ' + env);
  console.log('Checking authentication...');
  let authResult = await getAuth(env).catch((err) => {
    console.log('Caught an error', err);
    return false;
  });

  if (!authResult)
    throw 'No auth available...';

  console.log('Using token: ' + authResult);
  var file = getNewestFile('./dist/', new RegExp('.*\.js$'));
  console.log('Deploying file: ' + file);

  var packageContents = fs.readFileSync('./package.json', 'utf8');
  var packageObject = JSON.parse(packageContents);
  var fileContents = fs.readFileSync(file, 'utf8');

  var form = new FormData();
  form.append('app', packageObject.name);
  form.append('file', fileContents);
  form.append('filename', file.substring(7));

  var headers = {
    'Accept': 'application/json',
    'Content-Type': form.getHeaders()['content-type'],
    'Authorization': authResult
  };

  let host;
  switch (env) {
    case 'local':
      host = 'http://internal.foyerlive.com:9030/api/app/publish';
      break;
    case 'test':
      host = 'https://staging.foyerlive.com/api/app/publish';
      break;
    default:
      host = 'https://api.foyerlive.com/api/app/publish';
      break;

  }
  fetch(host, {
    method: 'POST',
    headers: headers,
    body: form
  }).then((response) => {
    return response.json();
  }).then((json) => {
    if (json.success) {
      console.log('Success!');
      if (json.hasOwnProperty('message'))
        console.log(json.message);
      if (json.hasOwnProperty('data') && json.data.hasOwnProperty('message'))
        console.log(json.data.message);
    } else {
      console.log('Error!', json);
    }
  }).catch((err) => {
    console.error('An error has occurred', err);
  });

};


const getNewestFile = (dir, regexp) => {
  let newest = null;
  let files = fs.readdirSync(dir)
  let one_matched = 0;

  for (let i = 0; i < files.length; i++) {

    if (regexp.test(files[i]) == false)
      continue
    else if (one_matched == 0) {
      newest = files[i];
      one_matched = 1;
      continue
    }

    f1_time = fs.statSync(files[i]).mtime.getTime();
    f2_time = fs.statSync(newest).mtime.getTime();
    if (f1_time > f2_time)
      newest[i] = files[i]
  }

  if (newest != null)
    return (dir + newest);
  return null
};