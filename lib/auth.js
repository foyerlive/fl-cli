"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAuth = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _fs = _interopRequireDefault(require("fs"));

var _cliPrompt = _interopRequireDefault(require("cli-prompt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getAuth = async (env = '') => {
  let fileRef = './.auth' + (env ? '.' + env : '');

  try {
    console.log('Stored Token Check: ' + fileRef);

    let authResult = _fs.default.readFileSync(fileRef, 'utf8');

    return authResult;
  } catch (err) {
    let promptResult = await requestAuth();
    let authRequest = await sendAuth(promptResult, env);

    if (authRequest) {
      // Store that result...
      _fs.default.writeFileSync(fileRef, authRequest);
    }

    return authRequest;
  }
};

exports.getAuth = getAuth;

const requestAuth = async () => {
  return new Promise((resolve, reject) => {
    _cliPrompt.default.multi([{
      label: 'Username',
      key: 'username',
      default: 'foyer@foyerlive.com'
    }, {
      label: 'Password',
      key: 'password',
      type: 'password',
      validate: function (val) {
        if (val.length < 5) throw new Error('password must be at least 5 characters long');
      }
    }], prompt => {
      return resolve(prompt);
    }, err => {
      return reject(err);
    });
  });
};

const sendAuth = async (prompt, env = '') => {
  let host;

  switch (env) {
    case 'local':
      host = 'http://localhost.foyerlive.com:9030/api/auth';
      break;

    case 'stage':
      host = 'https://stage.foyerlive.com/api/auth';
      break;

    case 'test':
      host = 'https://staging.foyerlive.com/api/auth';
      break;

    default:
      host = 'https://api.foyerlive.com/api/auth';
      break;
  }

  return (0, _nodeFetch.default)(host, {
    method: 'POST',
    body: JSON.stringify({
      _username: prompt.username,
      _password: prompt.password
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (res) {
    return res.json();
  }).then(function (json) {
    if (!json.success) throw json.error;
    return json.data.key;
  }).catch(err => {
    console.error(err);
    return false;
  });
};