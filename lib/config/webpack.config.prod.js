var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var TerserPlugin = require('terser-webpack-plugin');

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

/* remove build number as build will be based on package version 
and publish wu=ill add uid by default */
/* var build;
try {
  build = fs.readFileSync('.build');
} catch (err) {
  build = 0;
}
build++;
fs.writeFileSync('.build', build);
packageObject.version += '.' + build;
 */
// Support overridden package name..
if (_.has(process, 'env.PACKAGENAME')) {
  packageObject.name = _.get(process, 'env.PACKAGENAME');
}

var filename = packageObject.name + '-' + packageObject.version;

// Support additional build variation flag...
let packageVariation = _.get(process, 'env.PACKAGEVARIATION', 'default');

console.log('Building: %s, Version: %s, Production: %s, Variation: %s', packageObject.name, packageObject.version, process.env.NODE_ENV, packageVariation);

var parts = [];
if (!process.env.FLDEVTHEME) parts.push('@babel/polyfill');

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
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  entry: {
    app: parts,
  },
  output: {
    path: path.join(__dirname, '../../../../dist/'),
    filename: filename + '.js',
  },
  externals: externals,
  mode: 'production',
  optimization: {
    minimize: true,
    // "natural" | "named" | "size" | "total-size" | false
    // chunkIds: false, // To keep filename consistent between different modes (for example building only)
    // minimizer: [new UglifyJsPlugin()],
    minimizer: [
      new TerserPlugin({
        cache: false,
        parallel: true,
        sourceMap: false, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __ISPROD__: JSON.stringify(true),
      __FLPACKAGE__: JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__: JSON.stringify(packageObject.version),
      __FLVARIATION__: JSON.stringify(packageVariation),
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      append: '\n//# sourceURL=[url]',
    }),
  ],
  module: {
    rules: [
      {
        // A loader specifically for theme mode...
        test: /\.scss$/,
        include: [/\/scss/],
        exclude: [/node_modules/],
        loader: 'style-loader!css-loader!postcss-loader!sass-loader',
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/, /\/scss/],
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader',
      },
      {
        test: /\.scss$/,
        include: /node_modules/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(ttf|eot|woff2?|svg|png|jpe?g|gif|otf)(\?.*)?$/, //the last ? part is for query strings in eg font awesome
        loader: 'url-loader?limit=10000000', // Inline for JT
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: 'last 12 versions',
                },
              }, // or whatever your project requires
            ],
            '@babel/preset-react',
          ],
          plugins: [
            // '@babel/plugin-syntax-dynamic-import',
            // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
            // ['@babel/plugin-proposal-decorators', { legacy: true }],
            [
              '@babel/plugin-proposal-class-properties',
              {
                loose: true,
              },
            ],
            '@babel/plugin-proposal-export-default-from',
            'jsx-control-statements',
            'react-hot-loader/babel',
          ],
        },
      },
    ],
  },
  performance: {
    hints: false,
  },
};
