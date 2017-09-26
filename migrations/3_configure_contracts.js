var Oracle = artifacts.require("./Oracle.sol");
var ClubToken = artifacts.require("./ClubToken.sol");
var utils = require('web3-utils')

module.exports = function(deployer, helper, accounts) {
  return Oracle.deployed().then(function (instance) {
    return instance.deposit({from: accounts[0], value: utils.toBN(utils.toWei(0.1))}).then(() => {
      return instance.setClubToken(ClubToken.address, {from: accounts[0]}).then(() => {
        return instance.setOracleHash(getOracleEndpoint(), {from: accounts[0]})
      })
    })
  }).catch(function (error) {
    console.error(error)
  });
};

function getOracleEndpoint () {
    let validateEndpoint = 'json(https://api.infura.io/v1/jsonrpc/rinkeby/eth_call?to='
    let address = ClubToken.address + '&data='
    let functionName = utils.sha3('gameIsValid(bytes28,bytes28)')
    functionName = utils.hexToBytes(functionName)
    functionName = functionName.slice(0,4)
    functionName = utils.bytesToHex(functionName)
    return validateEndpoint + address + '&data=' + functionName
}
