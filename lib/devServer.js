#!/usr/bin/env babel-node
var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./config/webpack.config.dev');

var app = express();
var compiler = webpack(config);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.listen(9081, '0.0.0.0', function(err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://0.0.0.0:9081 - visit http://developer.foyerlive.com/#/dev to access...');
});
