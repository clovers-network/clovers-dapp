
var Reversi = artifacts.require("./Reversi.sol")
var Clovers = artifacts.require("./Clovers.sol")
var CloversFrontend = artifacts.require("./CloversFrontend.sol")
var CloversMetadata = artifacts.require("./CloversMetadata.sol")
var CloversController = artifacts.require("./CloversController.sol")
var ClubToken = artifacts.require("./ClubToken.sol")

let gasPrice = 100000000000

let stakeAmount = 100
let stakePeriod = 100
let multiplier = 100
let _ = '        '

contract('Clovers', async function(accounts)  {
  let clovers, cloversMetadata, clubToken, reversi, cloversController
  beforeEach(async () => {
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
      let _metadata = await cloversMetadata.tokenMetadata(666);
      assert(_metadata === metadata, '_metadata != metadata');
    })
  })

  describe('CloversController.sol', function() {
    it('should read values that were written', async function () {
      let _stakeAmount = await cloversController.currentStakeAmount()

      assert(_stakeAmount.toNumber() === stakeAmount);

      let _stakePeriod = await cloversController.currentStakePeriod()
      assert(_stakePeriod.toNumber() === stakePeriod);
      
      let _multiplier = await cloversController.getMultiplier()
      assert(_multiplier.toNumber() === multiplier);
    })
    it('should claim, wait, and recover stake', async function () {
      let _tokenId = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
      let balance = web3.eth.getBalance(accounts[0])
      var tx
      //make sure token doesn't exist
      try {
        await clovers.ownerOf(_tokenId)
      } catch (error) {
        assert(true, 'ownerOf should have failed while no one owns it');
      }

      // make sure claimClover is successful
      try {
        tx = await cloversController.claimClover(
          [
            '0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            '0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
          ],
          _tokenId, 
          '0x000000000000000000000000000000000000000000000000000000000000001F', 
          accounts[0], 
          {
            value: stakeAmount
          }
        )
        assert(tx.receipt.status === '0x01', 'claimClover tx receipt should have been 0x01 (successful) but was instead ' + tx.receipt.status);
      } catch (error) {
        asser(false, 'claimClover tx receipt should not have thrown an error')
      }

      // console.log(_+'Gas Used', tx.receipt.cumulativeGasUsed)

      // make sure token exists & is owned by this account
      try {
        let owner = await clovers.ownerOf(_tokenId)
        assert(accounts[0] === owner, 'owner of token should have been accounts[0] (' + accounts[0] + ') but was ' + owner)
      } catch (error) {
        asset(false, 'ownerOf should have succeeded')
        console.log(error)
      }

      // make sure stake amount was removed from your account
      let gasCost = tx.receipt.cumulativeGasUsed * gasPrice
      let _balance = web3.eth.getBalance(accounts[0])
      assert(balance.sub(_balance).sub(gasCost).eq(stakeAmount), 'original balance ' + web3.fromWei(balance).toString() + ' minus new balance ' + web3.fromWei(_balance).toString() + ' minus gas ' + web3.fromWei(gasCost).toString() + ' did not equal stakeAmount ' + web3.fromWei(stakeAmount).toString())
      
      // make sure it's not verified yet
      let isVerified = await cloversController.isVerified(_tokenId)      
      assert(!isVerified, 'clover is already verified somehow')

      // make sure it is verified after blocks increase
      await increaseBlocks(stakePeriod)
      isVerified = await cloversController.isVerified(_tokenId)
      assert(isVerified, 'clover wasn\'t verified when it should have been already')

      // make sure retrieveStake tx was successful
      try {
        tx = await cloversController.retrieveStake(_tokenId)
        assert(tx.receipt.status === '0x01', 'retrieveStake tx receipt should have been 0x01 (successful) but was instead ' + tx.receipt.status);
      } catch (error) {
        assert(false, 'retrieveStake tx should not have thrown an error')
      }
      // make sure stake amount was retured to your account
      balance = _balance
      gasCost = tx.receipt.cumulativeGasUsed * gasPrice
      _balance = web3.eth.getBalance(accounts[0])
      assert(_balance.sub(balance).add(gasCost).eq(stakeAmount), 'new balance ' + web3.fromWei(_balance).toString() + ' minus old balance ' + web3.fromWei(balance).toString() + ' plus gas ' + web3.fromWei(gasCost).toString() + ' did not equal stakeAmount ' + web3.fromWei(stakeAmount).toString() + ' but rather ' + _balance.sub(balance).add(gasCost).toString())
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