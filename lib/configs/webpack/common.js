// shared config (dev and prod)
const webpack = require('webpack');
const { resolve, join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// Features
var mode = process.env.FLDEVTHEME ? 'theme' : 'dev';

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  entry: {
    [mode]: ['@babel/polyfill', resolve(join(__dirname, '../../src/'), 'index.js')],
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
                    browsers: 'last 2 versions',
                  },
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
        test: /\.(ttf|eot|woff2?|svg|png|jpe?g|gif|otf)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // new CopyWebpackPlugin(['index.html']),
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      memoryLimit: 5120,
    }),
  ],
  performance: {
    hints: false,
  },
};
