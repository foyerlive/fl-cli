var foyerHost = process.env.foyerHost || 'localhost.foyerlive.com';
var webpack = require('webpack');
var fs = require('fs');
var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse( packageContents );
console.log( 'Starting DEV webpack for %s - %s @ %s', packageObject.name, packageObject.version, foyerHost );

module.exports = {
  //devtool: 'cheap-module-eval-source-map',
  entry: {
    "dev": [
      'babel-polyfill',
      'webpack-hot-middleware/client?path=http://'+foyerHost+':9081/__webpack_hmr',
      './src/'
    ]
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js',
    publicPath: 'http://'+foyerHost+':9081/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __ISPROD__ : false,
      __FLPACKAGE__ : JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__ : JSON.stringify(packageObject.version)
    })
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass'
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
