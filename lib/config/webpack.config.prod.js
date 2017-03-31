var webpack = require('webpack');
var fs = require('fs');
var path = require('path');

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

var filename = packageObject.name + '-' + packageObject.version;

console.log('Building: %s, Version: %s, Production: %s', packageObject.name, packageObject.version, process.env.NODE_ENV);

var parts = [];
if (!process.env.foyerThemeMode)
  parts.push('babel-polyfill');
parts.push('./src/');

// Custom externals for theme mode
// These libraries include their own react and cause errors etc...
let externals = {};
if (process.env.foyerThemeMode) {
  externals = {
    "react": "React",
    "react-addons-css-transition-group": "ReactAddonsCssTransitionGroup",
    "redux-form": "ReduxForm"
  };
}

module.exports = {
  entry: {
    app: parts
  },
  output: {
    path: path.join(__dirname, "../../../../dist/"),
    filename: filename + '.js'
  },
  externals: externals,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      __ISPROD__: JSON.stringify(true),
      __FLPACKAGE__: JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__: JSON.stringify(packageObject.version)
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        // A loader specifically for theme mode...
        test: /\.scss$/,
        include: [/\/scss/],
        exclude: [/node_modules/],
        loader: "style-loader!css-loader!postcss-loader!sass-loader"
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/, /\/scss/],
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader'
      },
      {
        test: /\.scss$/,
        include: /node_modules/,
        loader: "style-loader!css-loader!postcss-loader!sass-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.(ttf|eot|woff2?|svg|png|jpe?g|gif|eot)(\?.*)?$/, //the last ? part is for query strings in eg font awesome
        loader: "url-loader?limit=10000000" // Inline for JT
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  }
};
