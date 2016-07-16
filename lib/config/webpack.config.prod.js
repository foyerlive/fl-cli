var webpack = require('webpack');
var fs = require('fs');

var packageContents = fs.readFileSync('./package.json', 'utf8');
var packageObject = JSON.parse( packageContents );

var build;
try {
  build = fs.readFileSync('.build');
} catch ( err ) {
  build = 0;
}
build++;
fs.writeFileSync('.build', build );
packageObject.version += '.' + build;

var filename = packageObject.name + '-' + packageObject.version;

console.log( 'Building: %s, Version: %s, Production: %s', packageObject.name, packageObject.version, process.env.NODE_ENV );

module.exports = {
  //devtool: 'source-map',
  entry: {
    app: [
      'babel-polyfill',
      './src/'
    ]
  },
  output: {
    path: './dist/',
    filename: filename + '.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      __ISPROD__ : true,
      __FLPACKAGE__ : JSON.stringify(packageObject.name),
      __FLPACKAGEVERSION__ : JSON.stringify(packageObject.version)
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
