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
  .version('0.0.1')
  .option('-s, --start', 'Start developer environment')
  .option('-b, --build', 'Build for production environment')
  .option('-p, --publish', 'Publish application')
  .option('-e, --env [env]', 'Environment override', 'prod')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

console.log('FoyerLive CLI: ' + program.version());
if (program.start) {
  // Run the development environment
  execFile('./node_modules/fl-cli/lib/devServer.js', [], {
    stdio: 'inherit'
  });
}
if (program.build) {
  exec('./node_modules/.bin/eslint src/ && ./node_modules/.bin/rimraf dist', {
    stdio: 'inherit'
  });

  exec('NODE_ENV=prod ./node_modules/.bin/webpack --config ./node_modules/fl-cli/lib/config/webpack.config.prod.js', {
    stdio: 'inherit'
  });
}
if (program.publish) {
  publish( program.env ).catch( (err) => {
    console.error( err );
  });
}

async function publish( env ) {
  console.log( 'Publishing Time: ' + env );
  console.log( 'Checking authentication...' );
  let authResult = await getAuth( env ).catch((err) => {
    console.log( 'Caught an error', err );
    return false;
  });

  if( !authResult )
    throw 'No auth available...';

  console.log( 'Using token: ' + authResult );
  var file = getNewestFile('./dist/', new RegExp('.*\.js$'));
  console.log( 'Deploying file: ' + file );

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
  switch( env )
  {
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
  }).then((data) => {
    console.log('Response', data);
  }).catch((err) => {
    console.error('An error has occurred', err);
  });

}


function getNewestFile(dir, regexp) {
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
}