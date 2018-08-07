// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')

module.exports = {
  lintOnSave: false,
  configureWebpack: {
  	plugins: [
  		// new BundleAnalyzerPlugin(),
  		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  	],
    output: {
      globalObject: 'this'
    }
  }
}
