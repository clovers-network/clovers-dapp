module.exports = {
  lintOnSave: false,
  devServer: {
    https: true,
    proxy: {
      '/socket.io': {
        target: 'http://api.clovers.network',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
