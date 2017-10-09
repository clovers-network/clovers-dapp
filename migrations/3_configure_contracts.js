var Oracle = artifacts.require("./Oracle.sol");
var ClubToken = artifacts.require("./ClubToken.sol");
var utils = require('web3-utils')

module.exports = function(deployer, helper, accounts) {
  return Oracle.deployed().then(function (instance) {
    console.log('deployed')
    return instance.deposit({from: accounts[0], value: utils.toBN(utils.toWei(0.1))}).then(() => {
      console.log('deposit')
      return instance.setClubToken(ClubToken.address, {from: accounts[0]}).then(() => {
        console.log('setAddress', ClubToken.address)
        return instance.setOracleHash(getOracleEndpoint(), {from: accounts[0]}).then(() => {
          console.log('setHash success', getOracleEndpoint())
        })
      })
    })
  }).catch(function (error) {
    console.error(error)
  });
};

function getOracleEndpoint () {
    let validateEndpoint = 'json(https://api.infura.io/v1/jsonrpc/rinkeby).result'
    
    let functionName = utils.sha3('gameIsValid(bytes28,bytes28)')
    functionName = utils.hexToBytes(functionName)
    functionName = functionName.slice(0,4)
    functionName = utils.bytesToHex(functionName)

    let endpoint = utils.sha3('{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"to":"' + ClubToken.address + '","data":"' + functionName)
    // 0x9ba47857a924351e8e7627569697fc9c19de3cf05c4e0b363420e2b20b8078aa
    // let payload = '00000000d9b7774f9af573c5d69d4996a971f147dfac39f7e9f37785891dfee500000000bd9bb7ed12e559bfcaad69b5f04fa1061438927fc681167470000000'
    // let closing = '"},"latest"]}'


    return endpoint
}
