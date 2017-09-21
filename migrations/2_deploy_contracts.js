var Reversi = artifacts.require("./Reversi.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Reversi).then(function () {
    return deployer.deploy(ClubToken).then(function (instance) {

    });
  });
  console.log('ADDRESS CHANGE CLOVER')
};
