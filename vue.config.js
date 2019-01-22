// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    // optimization: {
    //   splitChunks: {
    //     maxSize: 500000
    //   }
    // },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    output: {
      globalObject: 'this'
    },
    resolve: {
      alias: {
        "bn.js": path.resolve(__dirname, 'node_modules/bn.js'),
        "underscore": path.resolve(__dirname, 'node_modules/underscore')
      }
    }
  }
}
