// shared config (dev and prod)
const _ = require('lodash');
const webpack = require('webpack');
const fs = require('fs');
const { resolve, join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// Features
var mode = process.env.FLDEVTHEME ? 'theme' : 'dev';
var foyerHost = process.env.foyerHost || 'localhost.foyerlive.com';

var parts = [];
if (!process.env.FLDEVTHEME) {
  // parts.push('@babel/polyfill');
}
// parts.push('webpack-hot-middleware/client?path=http://' + foyerHost + ':' + foyerPort + '/__webpack_hmr');
// Support additional build variation flag... (Bonus entry support!)
let packageVariation = _.get(process, 'env.PACKAGEVARIATION', 'default');
if (packageVariation !== 'default' && fs.existsSync('./src/' + packageVariation + '.js')) {
  parts.push('./src/' + packageVariation + '.js');
} else {
  parts.push('./src/');
}

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse(packageContents);

// Figure out if we're doing a dev or production build...
const _ISPROD_ = JSON.stringify(process.env.NODE_ENV === 'production');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  entry: {
    [mode]: parts,
  },
  output: {
    filename: 'main.bundle.js',
    path: resolve(join(__dirname, '../../dist')),
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    // chrome: '80',
                    browsers: 'last 12 versions', //'80',
                  },
                  useBuiltIns: 'entry',
                  corejs: 3,
                }, // or whatever your project requires
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              // ['@babel/plugin-proposal-decorators', { legacy: true }],
              [
                '@babel/plugin-proposal-class-properties',
                {
                  loose: true,
                },
              ],
              'jsx-control-statements',
              'react-hot-loader/babel',
            ],
          },
        },
      },
      {
        // A loader specifically for theme mode...
        test: /\.scss$/,
        include: [/\/scss/, /\\scss/],
        exclude: [/node_modules/],
        use: [
          'style-loader', // ok...
          'css-loader',
          'postcss-loader',
          // 'sass-loader',
        ],
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/, /\/scss/, /\\scss/],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: { localIdentName: '[name]__[local]___[hash:base64:5]' },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              /*
              plugins: loader => [
                require('postcss-import')({ root: loader.resourcePath }), // RTP
                require('postcss-preset-env')(),
                require('postcss-node-sass')(),
                require('cssnano')(),
              ],
              */
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.scss$/,
        include: /node_modules/,
        use: [
          'style-loader', // ok...
          'css-loader',
          // 'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(ttf|eot|woff2?|svg|png|jpe?g|gif|otf)$/,
        use: ['url-loader'],
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader', // ok...
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __ISPROD__: _ISPROD_,
      __FLDEVHOST__: JSON.stringify(foyerHost),
      __FLPACKAGE__: JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__: JSON.stringify(packageObject.version),
      __FLVARIATION__: JSON.stringify(packageVariation),
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      memoryLimit: 5120,
    }),
  ],
  performance: {
    hints: false,
  },
};
