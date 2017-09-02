var ClubToken = artifacts.require("./ClubToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ClubToken);
};
