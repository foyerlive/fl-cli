"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var path = require('path');

var express = require('express');

var webpack = require('webpack');

var devServer = require('webpack-dev-server');

var _ = require('lodash');

const exec = require('child_process').execSync;

const startServer = options => {
  if (_.get(options, 'nextGen', false)) {
    exec('./node_modules/.bin/webpack-dev-server --config ' + options.config, {
      stdio: 'inherit',
      env: process.env
    });
    return;
  }

  var config;
  if (options && options.hasOwnProperty('config') && options.config) config = require(path.resolve(process.cwd(), options.config));else config = require(path.resolve(__dirname, './config/webpack.config.dev'));
  var port = 9081;
  if (process.env.hasOwnProperty('FLDEVPORT')) port = process.env.FLDEVPORT;
  var app = express();
  var compiler = webpack(config);
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
  app.listen(port, '0.0.0.0', function (err) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Listening at http://0.0.0.0:' + port + ' - visit http://developer.foyerlive.com/#/dev to access...');
  });
};

var _default = startServer;
exports.default = _default;