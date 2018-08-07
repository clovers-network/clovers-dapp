var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  lintOnSave: false,
  configureWebpack: {
  	plugins: [new BundleAnalyzerPlugin()],
    output: {
      globalObject: 'this'
    }
  }
}
