var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

var build;
try {
  build = fs.readFileSync('.build');
} catch (err) {
  build = 0;
}
build++;
fs.writeFileSync('.build', build);
packageObject.version += '.' + build;

// Support overridden package name..
if (_.has(process, 'env.PACKAGENAME')) {
  packageObject.name = _.get(process, 'env.PACKAGENAME');
}

var filename = packageObject.name + '-' + packageObject.version;

// Support additional build variation flag...
let packageVariation = _.get(process, 'env.PACKAGEVARIATION', 'default');

console.log('Building: %s, Version: %s, Production: %s, Variation: %s', packageObject.name, packageObject.version, process.env.NODE_ENV, packageVariation);

var parts = [];
if (!process.env.FLDEVTHEME) parts.push('babel-polyfill');

// Build variation - entry support!
if (packageVariation !== 'default' && fs.existsSync('./src/' + packageVariation + '.js')) {
  parts.push('./src/' + packageVariation + '.js');
} else {
  parts.push('./src/');
}

// Custom externals for theme mode
// These libraries include their own react and cause errors etc...
let externals = {};
if (process.env.FLDEVTHEME) {
  externals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-addons-css-transition-group': 'ReactAddonsCssTransitionGroup',
    'redux-form': 'ReduxForm',
  };
}
module.exports = {
  entry: {
    app: parts,
  },
  output: {
    path: path.join(__dirname, '../../../../dist/'),
    filename: filename + '.js',
  },
  externals: externals,
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __ISPROD__: JSON.stringify(true),
      __FLPACKAGE__: JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__: JSON.stringify(packageObject.version),
      __FLVARIATION__: JSON.stringify(packageVariation),
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compressor: {
        warnings: false,
      },
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      append: '\n//# sourceURL=[url]',
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.(ttf|eot|woff2?|svg|png|jpe?g|gif|otf)(\?.*)?$/, //the last ? part is for query strings in eg font awesome
        loader: 'url-loader?limit=10000000', // Inline for JT
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
