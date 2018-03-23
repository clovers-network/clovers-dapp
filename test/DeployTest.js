// assertRevert = require('./helpers/assertRevert.js');
var utils = require('web3-utils')
var Reversi = artifacts.require("./Reversi.sol")
var Clovers = artifacts.require("./Clovers.sol")
var CloversFrontend = artifacts.require("./CloversFrontend.sol")
var CloversMetadata = artifacts.require("./CloversMetadata.sol")
var CloversController = artifacts.require("./CloversController.sol")
var ClubToken = artifacts.require("./ClubToken.sol")

let gasPrice = 1000000000 // 1GWEI

let stakeAmount = 100
let stakePeriod = 100
let multiplier = 10
let _ = '        '

contract('Clovers', async function(accounts)  {
  let clovers, cloversMetadata, clubToken, reversi, cloversController
  before(async () => {
    try {
      // Deploy Clovers.sol (NFT)
      clovers = await Clovers.new()
      // console.log('clovers', clovers.address)

      // Deploy CloversMetadata.sol
      // -w Clovers address
      cloversMetadata = await CloversMetadata.new(clovers.address)
      // console.log('cloversMetadata', cloversMetadata.address)

      // Update Clovers.sol 
      // -w CloversMetadata address
      await clovers.updateCloversMetadataAddress(cloversMetadata.address)

      // Deploy ClubToken.sol (ERC20)
      clubToken = await ClubToken.new()
      // console.log('clubToken', clubToken.address)

      // Deploy Reversi.sol
      // -link w cloversController
      // console.log(Reversi)
      reversi = await Reversi.new();
      await CloversController.link('Reversi', reversi.address)
      // await deployer.link(Reversi, CloversController);
      // await deployer.link(Reversi);
      // await CloversController.link(reversi);
      // console.log('Reversi', Reversi.address)

      // Deploy CloversController.sol
      // -w Clovers address
      // -w ClubToken address
      cloversController = await CloversController.new(clovers.address, clubToken.address)
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

  describe('Clovers.sol', function () {
    it('should be able to read metadata', async function () {
      let metadata = await clovers.tokenMetadata(666)
      let _metadata = await cloversMetadata.tokenMetadata(666)
      assert(_metadata === metadata, '_metadata != metadata')
    })
  })

  describe('CloversController.sol', function() {

    let balance, _balance, tx, clubBalance, gasEstimate, newStakeAmount, gasSpent
    let _tokenId = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
    let _moves = [
      new web3.BigNumber('0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16),
      new web3.BigNumber('0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)
    ]

    it('should read parameters that were set', async function () {
      let _stakeAmount = await cloversController.currentStakeAmount()

      assert(_stakeAmount.toNumber() === stakeAmount, 'stake amount not equal');

      let _stakePeriod = await cloversController.currentStakePeriod()
      assert(_stakePeriod.toNumber() === stakePeriod, 'stake period not equal');
      
      let _multiplier = await cloversController.getMultiplier()
      assert(_multiplier.toNumber() === multiplier, 'multiplier not equal');
    })

    it('should make sure token doesn\'t exist', async function () {
      balance = web3.eth.getBalance(accounts[0])
      try {
        await clovers.ownerOf(_tokenId)
      } catch (error) {
        assert(true, 'ownerOf should have failed while no one owns it');
      }
    })

    it('should make sure claimClover is successful', async function () {
      try {
        let options = [
          _moves,
          new web3.BigNumber(_tokenId, 16), 
          new web3.BigNumber('0x000000000000000000000000000000000000000000000000000000000000001F', 16),
          accounts[0], 
          {
            value: new web3.BigNumber(stakeAmount)
          }
        ]
        tx = await cloversController.claimClover(...options)
        console.log(_+'claimClover gasCost ' + tx.receipt.cumulativeGasUsed)
        gasSpent = tx.receipt.cumulativeGasUsed
        assert(tx.receipt.status === '0x01', 'claimClover tx receipt should have been 0x01 (successful) but was instead ' + tx.receipt.status);
      } catch (error) {
        console.log(error)
        assert(false, 'claimClover tx receipt should not have thrown an error')
      }
    })

    it('should make sure token exists & is owned by this account', async function () {
      try {
        let owner = await clovers.ownerOf(_tokenId)
        assert(accounts[0] === owner, 'owner of token should have been accounts[0] (' + accounts[0] + ') but was ' + owner)
      } catch (error) {
        console.log(error)
        assert(false, 'ownerOf should have succeeded')
      }
    })

    it('should make sure stake amount was removed from your account', async function () {
      let gasCost = gasSpent * gasPrice
      _balance = web3.eth.getBalance(accounts[0])
      assert(balance.sub(_balance).sub(gasCost).eq(stakeAmount), 'original balance ' + web3.fromWei(balance).toString() + ' minus new balance ' + web3.fromWei(_balance).toString() + ' minus gas ' + web3.fromWei(gasCost).toString() + ' did not equal stakeAmount ' + web3.fromWei(stakeAmount).toString())
    })

    it('should make sure it\'s not verified yet', async function () {
      let isVerified = await cloversController.isVerified(_tokenId)      
      assert(!isVerified, 'clover is already verified somehow')
    })

    it('should check the cost of challenging this fake clover', async function () {
      gasEstimate = await cloversController.challengeClover.estimateGas(_tokenId, accounts[0])
      console.log(_+'challengeClover gasEstimate', gasEstimate.toString())
    })

    it('should update the stake amount with the gas Estimate from challengeClover', async function () {
       try {
        newStakeAmount = new web3.BigNumber(gasEstimate).mul(gasPrice).mul(40)
        tx = await cloversController.updateStakeAmount(stakeAmount)
        console.log(_+'updateStakeAmount gasCost ' + tx.receipt.cumulativeGasUsed)
        gasSpent += tx.receipt.cumulativeGasUsed

        assert(tx.receipt.status === '0x01', 'updateStakeAmount tx receipt should have been 0x01 (successful) but was instead ' + tx.receipt.status);
      } catch (error) {
        console.log(error)
        assert(false, 'updateStakeAmount tx should not have thrown an error')
      }
    })

    it('should check the stake amount for the token in question', async function () {
      // let _movesHashJS = utils.soliditySha3({type: 'array', value: _moves})
      let _movesHashSol = await cloversController.getMovesHash(_tokenId)
      // console.log(_+_movesHashJS)
      // console.log(_+_movesHashSol)
      let currentStake = await clovers.getStake(_movesHashSol)
      assert(currentStake.toNumber() === stakeAmount, 'currentStake ' + currentStake.toString() + ' doest not equal stakeAmount ' + stakeAmount)
    })

    it('should make sure it is verified after blocks increase', async function () {
      // console.log(_+'token block', await clovers.getBlockMinted())
      // console.log(_+'block', await cloversController.returnBlock())
      await increaseBlocks(stakePeriod)
      // console.log(_+'block', await cloversController.returnBlock())
      isVerified = await cloversController.isVerified(_tokenId)
      assert(isVerified, 'clover wasn\'t verified when it should have been already')

      clubBalance = await clubToken.balanceOf(accounts[0])
    })

    it('should make sure retrieveStake tx was successful', async function () {
      try {
        tx = await cloversController.retrieveStake(_tokenId)
        console.log(_+'retrieveStake gasCost ' + tx.receipt.cumulativeGasUsed)
        gasSpent += tx.receipt.cumulativeGasUsed
        assert(tx.receipt.status === '0x01', 'retrieveStake tx receipt should have been 0x01 (successful) but was instead ' + tx.receipt.status);
      } catch (error) {
        console.log(error)
        assert(false, 'retrieveStake tx should not have thrown an error')
      }
    })

    it('should make sure reward was received', async function () {
      let _clubBalance = await clubToken.balanceOf(accounts[0])
      console.log(_+'reward was ' + _clubBalance.toString())
      assert(_clubBalance.gt(clubBalance), 'new balance of ' + _clubBalance.toString() + ' is not more than previous Balance of ' + clubBalance.toString())
    })

    it('should make sure stake amount was retured to your account', async function () {
      // balance = _balance
      gasCost = gasSpent * gasPrice
      _balance = web3.eth.getBalance(accounts[0])
      let result = balance.minus(gasCost)
      assert(result.eq(_balance), 'original balance ' + web3.fromWei(balance).toString() + ' minus all gas costs ' + web3.fromWei(gasCost).toString() + ' did not equal new balance ' + web3.fromWei(_balance).toString() + ' but rather ' + result.toString())
    })

  })

})

function getBlockNumber () {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) reject(error)
      resolve(result)
    })
  })
}

function increaseBlocks (blocks) {
  return new Promise((resolve, reject) => {
    increaseBlock().then(() => {
      blocks -= 1;
      if (blocks == 0){
        resolve()
      } else {
        increaseBlocks(blocks).then(resolve)
      }
    })
  })
}


function increaseBlock() {
  return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "evm_mine",
        id: 12345
      }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      });
  })
}