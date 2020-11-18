const { merge } = require('webpack-merge');
const commonConfig = require('./common');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

if (_.has(process, 'env.PACKAGENAME')) {
  packageObject.name = _.get(process, 'env.PACKAGENAME');
}

/* remove build number as build will be based on package version 
and publish wu=ill add uid by default */
if (_.get(process, 'env.WEBPACK_ADD_BUILD_VERSION', false)) {
  var build;
  try {
    build = fs.readFileSync('.build');
  } catch (err) {
    build = 0;
  }
  build++;
  fs.writeFileSync('.build', build.toString());
  packageObject.version += '.' + build;
  console.log('Setting build version: %s', packageObject.version);
}

const optimizationOptions = _.get(process, 'env.WEBPACK_NO_MINIMIZE', false)
  ? {
      minimize: false,
    }
  : {};

var filename = packageObject.name + '-' + packageObject.version;

const outputPath = path.join(process.env.INIT_CWD, './dist/');

const plugins = [
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1,
  }),
];

if (process.env.WEBPACK_ANALYZE) {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
    }),
  );
}

module.exports = merge(commonConfig, {
  mode: 'production',
  output: {
    path: outputPath,
    filename: filename + '.js',
  },
  plugins: plugins,
  optimization: optimizationOptions,
});
