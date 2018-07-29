module.exports = {
  lintOnSave: false,
  devServer: {
    // https: true,
    proxy: {
      "api.clovers.network": {
        target: "http://localhost:3333",
        changeOrigin: true
      }
    }
  }
};
