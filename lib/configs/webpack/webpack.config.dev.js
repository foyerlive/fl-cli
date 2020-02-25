const { resolve, join } = require("path");
const merge = require("webpack-merge");
const commonConfig = require("./common");
module.exports = merge(commonConfig, {
  devtool: "inline-source-map",
  resolve: {
    alias: {
      "react-dom": "@hot-loader/react-dom"
    }
  },
  mode: "development",
  devServer: {
    contentBase: "./dist",
    overlay: true,
    hot: false,
    hotOnly: true,
    disableHostCheck: true,
    port: 9081,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization"
    }
  },
  output: {
    filename: "dev.js",
    path: resolve(join(__dirname, "../../dist")),
    publicPath: "http://localhost.foyerlive.com:9081/"
  }
});
