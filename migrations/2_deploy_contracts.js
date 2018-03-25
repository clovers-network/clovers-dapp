
var Reversi = artifacts.require("./Reversi.sol");
var Clovers = artifacts.require("./Clovers.sol");
var CloversFrontend = artifacts.require("./CloversFrontend.sol");
var CloversMetadata = artifacts.require("./CloversMetadata.sol");
var CloversController = artifacts.require("./CloversController.sol");
var ClubToken = artifacts.require("./ClubToken.sol");

let stakeAmount = 529271 * 1000000000 * 40 // gasPrice * 1GWEI * 40
let stakePeriod = 100
let multiplier = 10

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy Clovers.sol (NFT)
      await deployer.deploy(Clovers)
      let clovers = await Clovers.deployed()

      // console.log('clovers', clovers.address)

      // Deploy CloversMetadata.sol
      // -w Clovers address
      await deployer.deploy(CloversMetadata, clovers.address)
      let cloversMetadata = await CloversMetadata.deployed()
      // console.log('cloversMetadata', cloversMetadata.address)

      // Update Clovers.sol 
      // -w CloversMetadata address
      await clovers.updateCloversMetadataAddress(cloversMetadata.address)

      // Deploy ClubToken.sol (ERC20)
      await deployer.deploy(ClubToken)
      let clubToken = await ClubToken.deployed()
      // console.log('clubToken', clubToken.address)

      // Deploy Reversi.sol
      // -link w cloversController
      await deployer.deploy(Reversi);
      let reversi = await Reversi.deployed();

      await CloversController.link('Reversi', reversi.address)
      // await deployer.link(Reversi, CloversController);
      // await deployer.link(Reversi);
      // await CloversController.link(reversi);
      // console.log('Reversi', Reversi.address)

      // Deploy CloversController.sol
      // -w Clovers address
      // -w ClubToken address
      await deployer.deploy(CloversController, clovers.address, clubToken.address)
      let cloversController = await CloversController.deployed()
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
  })
};
