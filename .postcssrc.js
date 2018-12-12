// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-preset-env')({stage: 0}),
    require('autoprefixer')()
  ]
}
