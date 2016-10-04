function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import fetch from 'node-fetch';
import fs from 'fs';
import prompt from 'cli-prompt';

export const getAuth = (() => {
  var _ref = _asyncToGenerator(function* (env = '') {
    let fileRef = './.auth' + (env ? '.' + env : '');
    try {
      console.log('Stored Token Check: ' + fileRef);
      let authResult = fs.readFileSync(fileRef, 'utf8');
      return authResult;
    } catch (err) {
      let promptResult = yield requestAuth();
      let authRequest = yield sendAuth(promptResult, env);
      if (authRequest) {
        // Store that result...
        fs.writeFileSync(fileRef, authRequest);
      }
      return authRequest;
    }
  });

  return function getAuth(_x) {
    return _ref.apply(this, arguments);
  };
})();

const requestAuth = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    return new Promise(function (resolve, reject) {
      prompt.multi([{
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
      }], function (prompt) {
        return resolve(prompt);
      }, function (err) {
        return reject(err);
      });
    });
  });

  return function requestAuth() {
    return _ref2.apply(this, arguments);
  };
})();

const sendAuth = (() => {
  var _ref3 = _asyncToGenerator(function* (prompt, env = '') {
    let host;
    switch (env) {
      case 'local':
        host = 'http://internal.foyerlive.com:9030/api/auth';
        break;
      case 'test':
        host = 'https://staging.foyerlive.com/api/auth';
        break;
      default:
        host = 'https://api.foyerlive.com/api/auth';
        break;

    }
    return fetch(host, {
      method: 'POST', body: JSON.stringify({ _username: prompt.username, _password: prompt.password }), headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json.success) throw json.error;
      return json.data.key;
    }).catch(function (err) {
      console.error(err);
      return false;
    });
  });

  return function sendAuth(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
})();