
var Reversi = artifacts.require("./Reversi.sol");
var Clovers = artifacts.require("./Clovers.sol");
var CloversFrontend = artifacts.require("./CloversFrontend.sol");
var CloversMetadata = artifacts.require("./CloversMetadata.sol");
var CloversController = artifacts.require("./CloversController.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

let stakeAmount = 100
let stakePeriod = 100
let multiplier = 100

module.exports = async function(deployer, helper, accounts)  {
  try {
    // Deploy Clovers.sol (NFT)
    let clovers = await Clovers.new()
    // console.log('clovers', clovers.address)

    // Deploy CloversMetadata.sol
    // -w Clovers address
    let cloversMetadata = await CloversMetadata.new(clovers.address)
    // console.log('cloversMetadata', cloversMetadata.address)

    // Update Clovers.sol 
    // -w CloversMetadata address
    await clovers.updateCloversMetadataAddress(cloversMetadata.address)

    // Deploy ClubToken.sol (ERC20)
    let clubToken = await ClubToken.new()
    // console.log('clubToken', clubToken.address)

    // Deploy Reversi.sol
    // -link w cloversController
    reversi = await Reversi.new();
    await CloversController.link('Reversi', reversi.address)
    // await deployer.link(Reversi, CloversController);
    // await deployer.link(Reversi);
    // await CloversController.link(reversi);
    // console.log('Reversi', Reversi.address)

    // Deploy CloversController.sol
    // -w Clovers address
    // -w ClubToken address
    let cloversController = await CloversController.new(clovers.address, clubToken.address)
    // console.log('cloversController', cloversController.address)

    // Update Clovers.sol
    // -w CloversController address
    await clovers.updateCloversControllerAddress(cloversController.address)

    // Update ClubToken.sol
    // -w CloversController address
    await clubToken.updateCloversControllerAddress(cloversController.address)

    // Deploy CloversFrontend.sol
    // -w CloversController address

    // Update CloversController.sol
    // -w stakeAmount
    // -w stakePeriod
    // -w payMultiplier
    await cloversController.updateStakeAmount(stakeAmount)
    await cloversController.updateStakePeriod(stakePeriod)
    await cloversController.updatePayMultipier(multiplier)
  } catch (error) {
    console.log(error)
  }
};
