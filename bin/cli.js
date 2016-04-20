#!/usr/bin/env babel-node
require('es6-promise').polyfill();
import fetch from 'node-fetch';

import {haveAuth} from '../lib/auth';

console.log( 'FoyerLive CLI...' );

// Look for current credentials...
init();

export async function init()
{
  let authResult = await haveAuth().catch((err) => {
    return false;
  });
  console.log( 'AuthResult', authResult );
}
// Test them

// Login

//var host = 'http://internal.foyerlive.com:9030/api/auth';
//
//fetch(host, { method: 'POST', body: JSON.stringify({_username:'foyer@foyerlive.com',_password:'foyertest'}),headers: {
//  'Content-Type': 'application/json'
//} })//{_username:'foyer@foyerlive.com',_password:'foyertest'} })
//  .then(function(res) {
//    return res.json();
//  }).then(function(json) {
//  if( !json.success ) throw json.error;
//  console.log(json);
//}).catch( (err) => {
//  console.log('Response: %s',err);
//
//});

//return;
//
////console.log( fetchThis );
//fetch( host, {
//  headers: {
//    Authorization: '769595075562e4d225362c3.71428856'
//  }
//}).then( (res) => {
//  return res.json();
//}).then( (json) => {
//  console.log( 'Got IT', json );
//}).catch( (err) => {
//  console.log( 'Error!', err );
//})