const merge = require('webpack-merge');
const commonConfig = require('./common');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

if (_.has(process, 'env.PACKAGENAME')) {
  packageObject.name = _.get(process, 'env.PACKAGENAME');
}

var filename = packageObject.name + '-' + packageObject.version;

const outputPath = path.join(process.env.INIT_CWD, './dist/');

module.exports = merge(commonConfig, {
  mode: 'development',
  // mode: 'production',
  output: {
    path: outputPath,
    filename: filename + '.js',
  },
});
// RHL guide...
//https://github.com/gaearon/react-hot-loader
