module.exports = {
  lintOnSave: false,
  configureWebpack: () => {
     return {
      "resolve": {
        "alias": {
          // given that basscss has been installed with npm
          "basscss-base": "../node_modules/basscss-base",
          "basscss-utilities": "../node_modules/basscss-utilities",
          "basscss-positions": "../node_modules/basscss-positions"
          // and so on...
        }
      },
    }
  }
}
