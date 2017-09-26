var Oracle = artifacts.require("./Oracle.sol");
var Reversi = artifacts.require("./Reversi.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

module.exports = function(deployer, helper, accounts) {
  return deployer.deploy(Oracle).then(function () {
    return deployer.deploy(Reversi).then(function () {
      return deployer.deploy(ClubToken, Oracle.address);
    });
  });
};
