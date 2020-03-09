const { resolve, join } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./common');
const internalIp = require('internal-ip');

const mode = process.env.FLDEVTHEME ? 'theme' : 'dev';

const myIP = internalIp.v4.sync();
const devHost = myIP; //'localhost.foyerlive.com';
const devPort = mode == 'theme' ? 9082 : 9081;
const sockHost = myIP;

const fileRef = mode == 'theme' ? 'theme.js' : 'dev.js';

var foyerHost = process.env.foyerHost || myIP;
var foyerPort = process.env.FLDEVPORT || 9081;

module.exports = merge(commonConfig, {
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  mode: 'development',
  devServer: {
    contentBase: './dist',
    overlay: true,
    hot: false,
    hotOnly: true,
    disableHostCheck: true,
    host: foyerHost,
    port: devPort,
    sockHost: sockHost,
    sockPort: 9081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  output: {
    filename: fileRef,
    path: resolve(join(__dirname, '../../dist')),
    publicPath: 'http://' + devHost + ':' + devPort + '/',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
