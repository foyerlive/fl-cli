var foyerHost = process.env.foyerHost || 'localhost.foyerlive.com';
var mode = process.env.FLDEVTHEME ? 'theme' : 'dev';
var foyerPort = process.env.FLDEVPORT || 9081;
var webpack = require('webpack');
var fs = require('fs');
var _ = require('lodash');

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);
console.log('Starting DEV webpack for %s - %s @ %s', packageObject.name, packageObject.version, foyerHost + ':' + foyerPort);
console.log('Mode: ' + mode, process.env.FLDEVTHEME);
var parts = [];
if (!process.env.FLDEVTHEME) parts.push('@babel/polyfill');
parts.push('webpack-hot-middleware/client?path=http://' + foyerHost + ':' + foyerPort + '/__webpack_hmr');

// Support additional build variation flag... (Bonus entry support!)
let packageVariation = _.get(process, 'env.PACKAGEVARIATION', 'default');
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
    [mode]: parts,
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js',
    publicPath: 'http://' + foyerHost + ':' + foyerPort + '/',
  },
  externals: externals,
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      __ISPROD__: JSON.stringify(false),
      __FLDEVHOST__: JSON.stringify(foyerHost),
      __FLPACKAGE__: JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__: JSON.stringify(packageObject.version),
      __FLVARIATION__: JSON.stringify(packageVariation),
    }),
  ],
  module: {
    rules: [
      {
        // A loader specifically for theme mode...
        test: /\.scss$/,
        include: [/\/scss/, /\\scss/],
        exclude: [/node_modules/],
        loader: 'style-loader!css-loader!postcss-loader!sass-loader',
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/, /\/scss/, /\\scss/],
        loaders: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: { localIdentName: '[name]__[local]___[hash:base64:5]' },
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
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
