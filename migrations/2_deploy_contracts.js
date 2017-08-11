var CloverToken = artifacts.require("./CloverToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CloverToken);
};
