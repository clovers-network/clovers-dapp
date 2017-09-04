var ClubToken = artifacts.require("./ClubToken.sol");

module.exports = function(deployer) {
  let address = deployer.deploy(ClubToken);
  console.log('ADDRESS CHANGE CLOVER')
};
