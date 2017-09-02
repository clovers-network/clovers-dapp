import BN from 'bignumber.js'
import cloverTokenArtifacts from '../../../build/contracts/CloverToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'

let web3 = self && self.web3

class Clover extends Reversi {

  constructor (startVal) {
    super()
    this.CloverToken = false
    this.account = false
    this.accountInterval = false
    this.stop = false
    this.end = false
    this.start = false
    this.increment = 0
    this.registeredBoards = []
  }


  initWeb3 () {
    let web3Provider
    if (web3) {
      // Use Mist/MetaMask's provider
      web3Provider = web3.currentProvider
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/Q5I7AA6unRLULsLTYd6d')
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    web3 = new Web3(web3Provider)
    this.setAccountInterval()
  }

  setAccountInterval () {
    this.account = web3.eth.accounts && web3.eth.accounts[0]
    if (this.accountInterval) {
      clearInterval(this.accountInterval)
    }
    this.accountInterval = setInterval(() => {
      this.account = web3.eth.accounts && web3.eth.accounts[0]
    }, 5000)
  }

  setContract () {
    this.initWeb3()
    this.CloverToken = contract(cloverTokenArtifacts)
    this.CloverToken.setProvider(web3.currentProvider)
  }

  showGameDebug (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.CloverToken) this.setContract()
    if (!this.account) return
    this.CloverToken.deployed().then((instance) => {
      instance.showGameDebug(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account}).then((result) => {
        console.log(result)
      })
    })
  }

  showGameConstant (byteFirst32Moves = 0, byteLastMoves = 0) {
      if (!this.CloverToken) this.setContract()
      return this.CloverToken.deployed().then((instance) => {
        return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
          console.log(result)
          return result
        })
      })
  }

  listClovers () {
    if (!this.CloverToken) this.setContract()
    this.CloverToken.deployed().then((instance) => {
      instance.getCloversCount().then((result) => {
        if (result.toNumber() !== this.registeredBoards.length) {
          console.log('diff results')
          this.registeredBoards = []
          for (let i = 0; i < result.toNumber(); i++) {
            instance.getClover(i).then((result) => {
              this.registeredBoards[i] = result
            })
          }
        }
      })
    })
  }


  registerGameMovesString (moves = '') {
    moves = this.sliceMovesStringToBytes(moves)
    this.registerGame(moves[0], moves[1])
  }

  registerGame (byteFirst32Moves = 0, byteLastMoves = 0) {
    this.playGameByteMoves(byteFirst32Moves, byteLastMoves)
    if (this.error) {
      alert('Game is not valid')
    } else if (!this.complete) {
      alert('Game is not complete')
    } else if (!this.symmetrical) {
      alert('Game is not symmetrical')
    } else {
      console.log(this)
      if (!this.CloverToken) this.setContract()
      return this.CloverToken.deployed().then((instance) => {
        return instance.registerGame(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account} ).then((result) => {
          console.log(result)
        }).catch((err) => {
          console.log('adminRegisterGame err', err.toString())
        })
      }).catch((err) => {
        console.log('deploy err', err)
      })
    }
  }

  adminRegisterGame (byteFirst32Moves = 0, byteLastMoves = 0, byteBoard = 0) {
    if (!this.CloverToken) this.setContract()
    return this.CloverToken.deployed().then((instance) => {
      return instance.adminRegisterGame(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), {from: this.account} ).then((result) => {

      }).catch((err) => {
        console.log('adminRegisterGame err', err.toString())
      })
    }).catch((err) => {
      console.log('deploy err', err)
    })
  }

  stopIt () {
    this.stop = true
    this.end = new Date()
    console.log('seconds:', (this.end - this.start) / 1000)
    console.log('ms per game:', (this.end - this.start) / this.increment)
  }


}

export default Clover
