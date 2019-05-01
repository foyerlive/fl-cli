import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import getNewestFile from './getNewestFile';
import { getAuth } from './auth';
import _ from 'lodash';

const publish = async env => {
  console.log('Publishing Time: ' + env);
  console.log('Checking authentication...');
  let authResult = await getAuth(env).catch(err => {
    console.log('Caught an error', err);
    return false;
  });

  if (!authResult) throw 'No auth available...';

  console.log('Using token: ' + authResult);
  var file = getNewestFile('./dist/', new RegExp('.*.js$'));
  console.log('Deploying file: ' + file);

  var packageContents = fs.readFileSync('./package.json', 'utf8');
  var packageObject = JSON.parse(packageContents);
  var fileContents = fs.readFileSync(file, 'utf8');

  var form = new FormData();

  // Support additional build variation flag...
  let packageName = _.get(process, 'env.PACKAGENAME', 'default');
  if (packageName !== 'default') {
    console.log('Package Name Override:', packageName);
    form.append('app', packageName);
  } else {
    form.append('app', packageObject.name);
  }

  form.append('filename', file.substring(7));
  form.append('file', fileContents);
  var headers = {
    Accept: 'application/json',
    'Content-Type': form.getHeaders()['content-type'],
    Authorization: authResult,
  };

  let host;
  switch (env) {
    case 'local':
      host = 'http://localhost.foyerlive.com:9030/api/app/publish';
      break;
    case 'stage':
      host = 'https://stage.foyerlive.com/api/app/publish';
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
    body: form,
  })
    .then(response => {
      return response.json();
    })
    .then(json => {
      if (json.success) {
        console.log('Success!');
        if (json.hasOwnProperty('message')) console.log(json.message);
        if (json.hasOwnProperty('data') && json.data.hasOwnProperty('message')) console.log(json.data.message);
        console.log(json);
      } else {
        console.log('Error!', json);
      }
    })
    .catch(err => {
      console.error('An error has occurred', err);
    });
};

export default publish;
