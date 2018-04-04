// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('precss')(),
    require('postcss-custom-properties')(),
    require('postcss-custom-media')(),
    require('postcss-calc')(),
    require('postcss-nested')(),
    require('postcss-color-function')(),
    require('postcss-discard-comments')(),
    require('postcss-reporter')(),
    require('autoprefixer')()
  ]
}
