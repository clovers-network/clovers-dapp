module.exports = {
  presets: ['@vue/app'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ],
  overrides: [
    {
      include: [
        /node_modules\/@walletconnect\//,
        /node_modules\/unstorage\//
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }
  ]
}
