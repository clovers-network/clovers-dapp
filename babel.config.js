module.exports = {
  presets: ['@vue/app'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ],
  overrides: [
    {
      // Convert ESM imports/exports to CJS for WalletConnect v2 packages and
      // their dependencies so webpack 4 doesn't treat them as ES modules
      // (which would leave `exports` undefined at runtime).
      include: [
        /node_modules\/@walletconnect\//,
        /node_modules\/unstorage\//
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }
  ]
}
