const merge = require('webpack-merge')
const commonConfig = require('./common')
module.exports = merge(commonConfig, {
  mode: 'production',
})
// RHL guide...
//https://github.com/gaearon/react-hot-loader
