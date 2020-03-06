"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _fs = _interopRequireDefault(require("fs"));

var _formData = _interopRequireDefault(require("form-data"));

var _getNewestFile = _interopRequireDefault(require("./getNewestFile"));

var _auth = require("./auth");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const publish = async env => {
  console.log('Publishing Time: ' + env);
  console.log('Checking authentication...');
  let authResult = await (0, _auth.getAuth)(env).catch(err => {
    console.log('Caught an error', err);
    return false;
  });
  if (!authResult) throw 'No auth available...';
  console.log('Using token: ' + authResult);
  var file = (0, _getNewestFile.default)('./dist/', new RegExp('.*.js$'));
  console.log('Deploying file: ' + file);

  var packageContents = _fs.default.readFileSync('./package.json', 'utf8');

  var packageObject = JSON.parse(packageContents);

  var fileContents = _fs.default.readFileSync(file, 'utf8');

  var form = new _formData.default(); // Support additional build variation flag...

  let packageName = _lodash.default.get(process, 'env.PACKAGENAME', 'default');

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
    Authorization: authResult
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

  (0, _nodeFetch.default)(host, {
    method: 'POST',
    headers: headers,
    body: form
  }).then(response => {
    return response.json();
  }).then(json => {
    if (json.success) {
      console.log('Success!');
      if (json.hasOwnProperty('message')) console.log(json.message);
      if (json.hasOwnProperty('data') && json.data.hasOwnProperty('message')) console.log(json.data.message);
      console.log(json);
    } else {
      console.log('Error!', json);
    }
  }).catch(err => {
    console.error('An error has occurred', err);
  });
};

var _default = publish;
exports.default = _default;