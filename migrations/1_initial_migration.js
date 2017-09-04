var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  let address = deployer.deploy(Migrations);
  console.log('ADDRESS CHANGE MIGRATE')
};
