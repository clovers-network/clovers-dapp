

//  // Allows us to use ES6 in our migrations and tests.
// require('babel-register')
// var bip39 = require("bip39");
// var hdkey = require('ethereumjs-wallet/hdkey');
// var ProviderEngine = require("web3-provider-engine");
// var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
// var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
// var Web3 = require("web3");

// // Get our mnemonic and create an hdwallet
// var mnemonic = "correct hover crystal skill brass similar lock bone salon joke caught error";
// var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

// // Get the first account using the standard hd path.
// var wallet_hdpath = "m/44'/60'/0'/0/";
// var wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
// var address = "0x" + wallet.getAddress().toString("hex");
// console.log(address)



// var providerUrl = "https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d";
// var engine = new ProviderEngine();

// const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
// engine.addProvider(new FilterSubprovider())

// engine.addProvider(new WalletSubprovider(wallet, {}));
// engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));


// // log new blocks
// engine.on('block', function(block){
//   console.log('================================')
//   console.log('BLOCK CHANGED:', '#'+block.number.toString('hex'), '0x'+block.hash.toString('hex'))
//   console.log('================================')
// })

// // network connectivity error
// engine.on('error', function(err){
//   // report connectivity errors
//   console.error(err)
// })

// // network connectivity error
// engine.on('readystatechange', function(chg){
//   // report connectivity errors
//   console.error(chg)
// })


// engine.start(); // Required by the provider engine.
// // // ***REMOVED***
module.exports = {
  networks: {
    // rinkeby: {
    //   network_id: 4,    // Official rinkeby network id
    //   provider: engine, // Use our custom provider
    //   from: address,     // Use the address we derived
    //   // gas: 4700000
    // },
    rinkeby: {
      network_id: 4,    // Official rinkeby network id
      host: "localhost", // Use our custom provider
      port: "8545", // Use our custom provider
      from: '0xcDE232e835330daFA2Ebc629219BbF4fc92cfa24',     // Use the address we derived
      gas: 4700000
    },
    // ethermint: {
    //   host: "0.0.0.0",
    //   port: 8545,
    //   network_id: "*",
    //   from: '0x7eFf122b94897EA5b0E2A9abf47B86337FAfebdC'
    // },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
  },
  // rpc: {
  //   // Use the default host and port when not using ropsten
  //   host: "localhost",
  //   port: 8545,
  //   network_id: "*" // Match any network id
  // }
};