// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  lintOnSave: false,
  devServer: {
    allowedHosts: 'all'
    // https: true
  },
  configureWebpack: {
    plugins: [
     // new BundleAnalyzerPlugin(),
      new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ],
    resolve: {
      alias: {
        "bn.js": path.resolve(__dirname, 'node_modules/bn.js'),
        "underscore": path.resolve(__dirname, 'node_modules/underscore')
      },
      fallback: {
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/")
      }
    }
  },
  // (dev) force Safari not to cache
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config
        .output
        .filename('[name].[fullhash].js')
        .end()
    }
  }
}
