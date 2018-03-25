
var Clovers = artifacts.require("./Clovers.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

var OldToken = artifacts.require('../contracts/OldToken.sol');

module.exports = async function(deployer, helper, accounts)  {
  if (deployer.network === 'rinkeby'){
    try {
      var oldToken = await OldToken.at('0xcc0604514f71b8d39e13315d59f4115702b42646')
      // listPlayerCount
    } catch (error) {
      console.log(error)
    }
  } else {
      let oldToken = await OldToken.new()
      for (var i = 0; i < 10; i ++) {

        var tx = await oldToken.adminMineClover(
          new web3.BigNumber(i).add('0xFFF'),
          new web3.BigNumber(i).add('0xFFF'),
          new web3.BigNumber(i).add('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
          new web3.BigNumber(i)
        )
        console.log(tx)
      }
  }
};
