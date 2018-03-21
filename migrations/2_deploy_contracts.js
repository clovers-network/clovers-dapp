
var Reversi = artifacts.require("./Reversi.sol");
var Clovers = artifacts.require("./Clovers.sol");
var CloversFrontend = artifacts.require("./CloversFrontend.sol");
var CloversMetadata = artifacts.require("./CloversMetadata.sol");
var CloversController = artifacts.require("./CloversController.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

let stakeAmount = 100
let stakePeriod = 100
let multiplier = 100

module.exports = function(deployer, helper, accounts) async {

  let a = await deployer.then(() => Contract.new())
// Deploy Clovers.sol (NFT)
  let Clovers_ = await Clovers.deployed()

// Deploy CloversMetadata.sol
// -w Clovers address
  console.log(Clovers_.address)
  let CloversMetadata_ = await CloversMetadata_.deployed(Clovers_.address)

// Update Clovers.sol 
// -w CloversMetadata address
  await Clovers_.updateCloversMetadataAddress(CloversMetadata_.address)

// Deploy ClubToken.sol (ERC20)
  let ClubToken_ = await ClubToken.deployed()

// Deploy Reversi.sol
// -link w CloversController_
  Reversi = await Reversi.deployed();
  await deployer.link(Reversi, CloversController);

// Deploy CloversController.sol
// -w Clovers address
// -w ClubToken address
  let CloversController_ = await CloversController.deployed(Clovers_.address, ClubToken_.address)

// Update Clovers.sol
// -w CloversController address
  await Clovers_.updateCloversControllerAddress(CloversController_.address)

// Update ClubToken.sol
// -w CloversController address
  await ClubToken_.updateCloversControllerAddress(CloversController_.address)

// Deploy CloversFrontend.sol
// -w CloversController address

// Update CloversController.sol
// -w stakeAmount
// -w stakePeriod
// -w payMultiplier
  await CloversController_.updateStakeAmount(stakeAmount)
  await CloversController_.updateStakePeriod(stakePeriod)
  await CloversController_.updatePayMultipier(multiplier)
};
