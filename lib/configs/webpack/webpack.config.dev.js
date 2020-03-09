const { resolve, join } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./common');

const mode = process.env.FLDEVTHEME ? 'theme' : 'dev';

const devPort = mode == 'theme' ? 9082 : 9081;

const fileRef = mode == 'theme' ? 'theme.js' : 'dev.js';

var foyerHost = process.env.FLDEVHOST || 'localhost.foyerlive.com';

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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  output: {
    filename: fileRef,
    path: resolve(join(__dirname, '../../dist')),
    publicPath: 'http://' + foyerHost + ':' + devPort + '/',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
