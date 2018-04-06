import BN from 'bignumber.js'
import clubTokenArtifacts from './ClubToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'
import {Clovers, ClubToken, CloversController} from 'clovers-contracts'

const ProviderEngine = require('web3-provider-engine/index.js')
const ZeroClientProvider = require('web3-provider-engine/zero.js')

let web3 = self && self.web3
let _web3 = false
class Clover extends Reversi {

  constructor (events = false) {
    super()
    this.network = null
    this.error = false
    this.loading = false
    this.retryConnection = false
    this.readOnly = false
    this.connected = false
  }

  // Connections

  initWeb3 () {
    return new Promise((resolve, reject) => {
      web3 = self && self.web3
      let web3Provider = false
      if (web3) {
        web3Provider = web3.currentProvider
      } else if (!this.retryConnection){
        this.retryConnection = true
        this.resetConnection()
        setTimeout(() => {
          this.initWeb3().then((network = this.network) => {
            resolve(network, this.readOnly)
          }).catch((error) => {
            reject(error)
          })
        }, 1000)
      } else {
        this.readOnly = true
        web3Provider = ZeroClientProvider({
          getAccounts: function(){},
          rpcUrl: 'https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d',
        })
      }
      if (web3Provider) {
        _web3 = new Web3(web3Provider)
        _web3.eth.net.getId((err, netId) => {
          if (!err){
            this.network = netId
            if (CloversController.networks[this.network] && Clovers.networks[this.network] && ClubToken.networks[this.network]) {
              this.deployContracts()
              resolve(this.network, this.readOnly)
            } else {
              reject(new Error('Contracts not deployed'))
            }
          } else {
            reject(new Error(err))
          }
        })
      } else {
        reject(new Error('No web3Provider'))
      }
    })
  }

  getAccounts () {
    return new Promise((resolve, reject) => {
      _web3.eth.getAccounts((err, accounts) => {
        if (err) {
          this.account = null
          reject(err)
        } else {
          if (accounts.length > 0 && !this.account) this.account = accounts[0]
          if (accounts.length == 0 && this.account) this.account = null
          resolve(accounts)
        }
      })
    })
  }

  resetConnection () {
    _web3 = false
    this.network = null
    return this.initWeb3()
  }


  deployContracts () {
    console.log('ClubToken', ClubToken.networks[this.network].address)
    console.log('Clovers', Clovers.networks[this.network].address)
    console.log('CloversController', CloversController.networks[this.network].address)
    this.ClubToken = new _web3.eth.Contract(ClubToken.abi, ClubToken.networks[this.network].address)
    this.Clovers = new _web3.eth.Contract(Clovers.abi, Clovers.networks[this.network].address)
    this.CloversController = new _web3.eth.Contract(CloversController.abi, CloversController.networks[this.network].address)
  }


  /*
   *
   * Constant Functions (CloversController.sol)
   *
   */

  cloversControllerOwner () {
    return this.CloversController.methods.owner().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  currentStakeAmount () {
    return this.CloversController.methods.currentStakeAmount().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  currentStakePeriod () {
    return this.CloversController.methods.currentStakePeriod().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getMultiplier () {
    return this.CloversController.methods.getMultiplier().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getMovesHash (_tokenId) {
    return this.CloversController.methods.getMovesHash(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  isValid (moves) {
    return this.CloversController.methods.isValid(moves).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  isVerified (_tokenId) {
    return this.CloversController.methods.isVerified(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  calculateReward (_symmetries) {
    return this.CloversController.methods.calculateReward(_symmetries).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  /*
   *
   * Transaction Functions (CloversController)
   *
   */

  claimClover (moves, _tokenId, _symmetries, _to, stakeAmount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.claimClover(moves, _tokenId, _symmetries, _to).send({
      from: this.account,
      value: stakeAmount
    })
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  claimCloverCommit (movesHash, _to, stakeAmount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.claimCloverCommit(movesHash, _to).send({
      from: this.account,
      value: stakeAmount
    })
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }

  reclaimToken (token) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.reclaimToken(token).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  reclaimEther () {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.reclaimEther().send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  tokenFallback (from_, value_, data_) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.tokenFallback(from_, new BN(value_, 10), data_).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  cloversControllerTransferOwnership (newOwner) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.transferOwnership(newOwner).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  claimCloverReveal (moves, _tokenId, _symmetries) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.claimCloverReveal(moves, new BN(_tokenId, 10), _symmetries).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  retrieveStake (_tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.retrieveStake(new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  challengeClover (_tokenId, _to) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.challengeClover(new BN(_tokenId, 10), _to).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  updateStakeAmount (_stakeAmount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.updateStakeAmount(new BN(_stakeAmount, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  updateStakePeriod (_stakePeriod) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.updateStakePeriod(new BN(_stakePeriod, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  updatePayMultipier (_payMultiplier) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.CloversController.methods.updatePayMultipier(new BN(_payMultiplier, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }

  // ---------------------------------------------------------------------------

  /*
   *
   * Constant Functions (Clovers)
   *
   */

  cloversName () {
    return this.Clovers.methods.name().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getApproved (_tokenId) {
    return this.Clovers.methods.getApproved(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  cloversTotalSupply () {
    return this.Clovers.methods.totalSupply().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  tokenOfOwnerByIndex (_owner, _index) {
    return this.Clovers.methods.tokenOfOwnerByIndex(_owner, new BN(_index, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  commits () {
    return this.Clovers.methods.commits().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  exists (_tokenId) {
    return this.Clovers.methods.exists(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  tokenByIndex (_index) {
    return this.Clovers.methods.tokenByIndex(new BN(_index, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  ownerOf (_tokenId) {
    return this.Clovers.methods.ownerOf(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  clovers () {
    return this.Clovers.methods.clovers().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  cloversBalanceOf (_owner) {
    return this.Clovers.methods.balanceOf(_owner).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  cloversOwner () {
    return this.Clovers.methods.owner().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  stakes () {
    return this.Clovers.methods.stakes().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  cloversSymbol () {
    return this.Clovers.methods.symbol().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  tokenURI (_tokenId) {
    return this.Clovers.methods.tokenURI(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  isApprovedForAll (_owner, _operator) {
    return this.Clovers.methods.isApprovedForAll(_owner, _operator).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  implementation () {
    return this.Clovers.methods.implementation().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getHash (moves) {
    return this.Clovers.methods.getHash(moves).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getStake (movesHash) {
    return this.Clovers.methods.getStake(movesHash).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getCommit (movesHash) {
    return this.Clovers.methods.getCommit(movesHash).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getBlockMinted (_tokenId) {
    return this.Clovers.methods.getBlockMinted(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getCloverMoves (_tokenId) {
    return this.Clovers.methods.getCloverMoves(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getReward (_tokenId) {
    return this.Clovers.methods.getReward(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getSymmetries (_tokenId) {
    return this.Clovers.methods.getSymmetries(new BN(_tokenId, 10)).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getAllSymmetries () {
    return this.Clovers.methods.getAllSymmetries().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  /*
   *
   * Transaction Functions (Clovers.sol)
   *
   */

  cloversApprove (_to, _tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.approve(_to, new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  cloversTransferFrom (_from, _to, _tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.transferFrom(_from, _to, new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  safeTransferFrom (_from, _to, _tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.safeTransferFrom(_from, _to, new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setApprovalForAll (_to, _approved) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setApprovalForAll(_to, _approved).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  safeTransferFromWithData (_from, _to, _tokenId, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.safeTransferFrom(_from, _to, new BN(_tokenId, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  cloversTransferOwnership (newOwner) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.transferOwnership(newOwner).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  moveEth (_to, amount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.moveEth(_to, new BN(amount, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  moveToken (amount, _to, token) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.moveToken(new BN(amount, 10), _to, token).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  approveToken (amount, _to, token) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.approveToken(new BN(amount, 10), _to, token).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setStake (movesHash, stake) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setStake(movesHash, new BN(stake, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setCommit (movesHash, commiter) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setCommit(movesHash, commiter).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setBlockMinted (_tokenId, value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setBlockMinted(new BN(_tokenId, 10), new BN(value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setCloverMoves (_tokenId, moves) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setCloverMoves(new BN(_tokenId, 10), moves).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setReward (_tokenId, _amount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setReward(new BN(_tokenId, 10), new BN(_amount, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setSymmetries (_tokenId, _symmetries) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setSymmetries(new BN(_tokenId, 10), _symmetries).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setAllSymmetries (_totalSymmetries, RotSym, Y0Sym, X0Sym, XYSym, XnYSym) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.setAllSymmetries(new BN(_totalSymmetries, 10), new BN(RotSym, 10), new BN(Y0Sym, 10), new BN(X0Sym, 10), new BN(XYSym, 10), new BN(XnYSym, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  deleteClover (_tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.deleteClover(new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  cloversUpdateCloversControllerAddress (_cloversController) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.updateCloversControllerAddress(_cloversController).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  updateCloversMetadataAddress (_cloversMetadata) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.updateCloversMetadataAddress(_cloversMetadata).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  cloversMint (_to, _tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.mint(_to, new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  unmint (_tokenId) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.Clovers.methods.unmint(new BN(_tokenId, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }

  // --------------------------------------------------------------------------------------

  /*
   *
   * Constant Functions (ClubToken)
   *
   */

  clubTokenName () {
    return this.ClubToken.methods.name().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  clubTokenSymbol () {
    return this.ClubToken.methods.symbol().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  decimals () {
    return this.ClubToken.methods.decimals().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  clubTokenTotalSupply () {
    return this.ClubToken.methods.totalSupply().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  clubTokenBalanceOf (_owner) {
    return this.ClubToken.methods.balanceOf(_owner).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  clubTokenOwner () {
    return this.ClubToken.methods.owner().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  allowance (_owner, _spender) {
    return this.ClubToken.methods.allowance(_owner, _spender).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  /*
   *
   * Transaction Functions (ClubToken)
   *
   */

  clubTokenApprove (_spender, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.approve(_spender, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  increaseApprovalWithData (_spender, _addedValue, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.increaseApproval(_spender, new BN(_addedValue, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenTransferFrom (_from, _to, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.transferFrom(_from, _to, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenApproveWithData (_spender, _value, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.approve(_spender, new BN(_value, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  decreaseApproval (_spender, _subtractedValue) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.decreaseApproval(_spender, new BN(_subtractedValue, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  decreaseApprovalWithData (_spender, _subtractedValue, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.decreaseApproval(_spender, new BN(_subtractedValue, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  transfer (_to, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.transfer(_to, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenTransferFromWithData (_from, _to, _value, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.transferFrom(_from, _to, new BN(_value, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  transferWithData (_to, _value, _data) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.transfer(_to, new BN(_value, 10), _data).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  increaseApproval (_spender, _addedValue) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.increaseApproval(_spender, new BN(_addedValue, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenTransferOwnership (newOwner) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.transferOwnership(newOwner).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenUpdateCloversControllerAddress (_cloversController) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.updateCloversControllerAddress(_cloversController).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  burn (_from, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.burn(_from, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  clubTokenMint (_to, _amount) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.ClubToken.methods.mint(_to, new BN(_amount, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }


  // ---------------------------------------------------------------------------

  currentBlock () {
    return new Promise((resolve, reject) => {
      _web3.eth.getBlock('latest', (error, results) => {
        if (error) reject(error)
        resolve(results)
      })
    })
  }

  // calcFindersFees (tallys = Array(), RotSym = this.RotSym, Y0Sym = this.Y0Sym, X0Sym = this.X0Sym, XYSym = this.XYSym, XnYSym = this.XnYSym) {
  //   let base = 0
  //   if(this.symmetrical && !RotSym && !Y0Sym && !X0Sym && !XYSym && !XnYSym) {
  //     this.isSymmetrical()
  //     return this.calcFindersFees(tallys)
  //   }

  //   if (RotSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.RotSym + 1 )
  //   if (Y0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.Y0Sym + 1 )
  //   if (X0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.X0Sym + 1 )
  //   if (XYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XYSym + 1 )
  //   if (XnYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XnYSym + 1 )

  //   return Math.floor(base)
  // }

  // formatClover (contractArray = new Array(5)) {
  //   return {
  //     byteBoard: contractArray[0],
  //     arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
  //     currentPrice: contractArray[1].mul(2).toNumber(),
  //     numberOfOwners: contractArray[2].toNumber(),
  //     mostRecentOwner: contractArray[3],
  //     byteFirst32Moves: contractArray[4],
  //     byteLastMoves: contractArray[5],
  //     moves: this.byteMovesToStringMoves(contractArray[4].toString(16), contractArray[5].toString(16))
  //   }
  // }


}

export default Clover
