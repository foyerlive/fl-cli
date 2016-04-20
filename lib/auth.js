import fetch from 'node-fetch';
import fs from 'fs';
import prompt from 'cli-prompt';


export async function haveAuth() {
  try {
    let authResult = fs.readFileSync('./.auth', 'utf8');
  } catch (err) {
    let promptResult = await requestAuth();
    let authRequest = await sendAuth( promptResult );
    console.log( 'LALA', authRequest );
    return true;
  }
}

async function requestAuth() {
  return new Promise((resolve, reject) => {
    prompt.multi([
      {
        label: 'Username',
        key: 'username',
        default: 'foyer@foyerlive.com'
      },
      {
        label: 'Password',
        key: 'password',
        type: 'password',
        validate: function (val) {
          if (val.length < 5) throw new Error('password must be at least 5 characters long');
        }
      }
    ], (prompt) => {
      return resolve(prompt);
    }, (err) => {
      return reject(err);
    });
  });
}

async function sendAuth(prompt) {
  let host = 'http://internal.foyerlive.com:9030/api/auth';
  return fetch(host, {
    method: 'POST', body: JSON.stringify({_username: prompt.username, _password: prompt.password}), headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json.success) throw json.error;
      return json.data.key;
    }).catch((err) => {
      return false;
    });

}