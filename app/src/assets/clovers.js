import BN from 'bignumber.js'
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'

let web3 = self && self.web3

class Clover extends Reversi {
  constructor (startVal) {
    super()
    this.ClubToken = false
    this.account = false
    this.accountInterval = false
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

  deploy () {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().catch((err) => {
      console.error(err)
    })
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
    this.ClubToken = contract(clubTokenArtifacts)
    this.ClubToken.setProvider(web3.currentProvider)
  }

  showGameDebug (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.ClubToken) this.setContract()
    if (!this.account) return
    this.ClubToken.deployed().then((instance) => {
      instance.showGameDebug(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account}).then((result) => {
        console.log(result)
      })
    })
  }

  showGameConstant (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        console.log(result)
        return result
      })
    })
  }

  listClovers () {
    if (!this.ClubToken) this.setContract()
    this.ClubToken.deployed().then((instance) => {
      instance.getCloversCount().then((result) => {
        if (result.toNumber() !== this.registeredBoards.length) {
          this.registeredBoards = []
          for (let i = 0; i < result.toNumber(); i++) {
            instance.getCloverByKey(i).then((result) => {
              this.registeredBoards.splice(i, 1, result)
            })
          }
        }
      })
    })
  }

  buildString (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    if (!this.ClubToken) this.setContract()
    this.ClubToken.deployed().then((instance) => {
      // instance.returnAddress().then((result) => {
      //   console.log(result)
      // })
      instance.buildString(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        console.log(result);
      })
    })
  }

  buyClover (board = this.byteBoard) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.cloverExists.call(new BN(board, 16)).then((result) => {
        console.log(result)
        if (!result) {
          alert('game doesn\'t exist')
        } else {
          return instance.buyClover(new BN(board, 16), {from: this.account} ).then((result) => {
            console.log(result)
          }).catch((err) => {
            console.log('buyClover err', err.toString())
          })
        }
      })
    }).catch((err) => {
      console.log('deploy err', err)
    })
  }

  cloverExists (byteBoard = this.byteBoard) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.cloverExists(new BN(byteBoard, 16)).then(response => response)
    })
  }

  buildMovesString () {
    this.movesString = this.moves.map((move) => {
      return this.arrayToMove(move[0], move[1])
    }).join('')
  }

  pickRandomMove () {
    let validMoves = this.getValidMoves()
    if (!validMoves.length) {
      this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
      validMoves = this.getValidMoves()
    }
    return validMoves.length !== 0 && validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  registerGameMovesString (moves = '', startPrice = 100) {
    moves = this.sliceMovesStringToBytes(moves)
    this.mineClover(moves[0], moves[1], startPrice)
  }

  mineClover (byteFirst32Moves = 0, byteLastMoves = 0, startPrice = 100) {
    this.playGameByteMoves(byteFirst32Moves, byteLastMoves)
    if (this.error) {
      alert('Game is not valid')
    } else if (!this.complete) {
      alert('Game is not complete')
    } else if (!this.symmetrical) {
      alert('Game is not symmetrical')
    } else {
      console.log(this)
      if (!this.ClubToken) this.setContract()
      return this.ClubToken.deployed().then((instance) => {
        return instance.mineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), startPrice, {from: this.account} ).then((result) => {
          console.log(result)
        }).catch((err) => {
          console.log('mineClover err', err.toString())
        })
      }).catch((err) => {
        console.log('deploy err', err)
      })
    }
  }

  adminRegisterGame (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, byteBoard = this.byteBoard, startPrice = this.startPrice) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.adminRegisterGame(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), new BN(startPrice, 10), {from: this.account})
    })
  }


  // Contract Management

  addAdmin (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.isAdmin().then((isAdmin) => {
        if (isAdmin) {
          return instance.addAdmin(address, {from: this.account})
        } else {
          console.error('Can\'t add an admin if not an admin')
        }
      })
    })
  }


  // Player Management

  // read only

  listPlayerCount () {
    return this.deploy().then((instance) => {
      return instance.listPlayerCount()
    })
  }

  playerAddressByKey (key = 0) {
    return this.deploy().then((instance) => {
      return instance.playerAddressByKey(new BN(key, 10))
    })
  }

  playerExists (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerExists(address)
    })
  }

  playerCurrentCount (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerCurrentCount(address)
    })
  }

  playerAllCount (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerAllCount(address)
    })
  }

  playerCloverByKey (address = '0x0', cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(cloverKey, 10))
    })
  }

  playerOwnsClover (address = '0x0', board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(board, 16))
    })
  }


  // Clover Management

  // read only / calls


  cloverExists (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.cloverExists(new BN(board, 16))
    })
  }

  getCloversCount () {
    return this.deploy().then((instance) => {
      return instance.getCloversCount()
    })
  }

  getCloverByKey (cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverByKey(new BN(cloverKey, 10)).then((clover) => {
        return this.cloverObjectFromContract(clover)
      })
    })
  }

  getClover (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getClover(new BN(board, 16)).then((clover) => {
        return this.cloverObjectFromContract(clover)
      })
    })
  }

  getCloverOwner (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getCloverOwner(new BN(board, 16)).then((clover) => {
        console.log(clover)
        return this.ownerObjectFromContract(clover)
      })
    })
  }

  getCloverOwnerAtKeyByBoard (board = '0x0', ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoard(new BN(board, 16), new BN(ownerKey, 10)).then((clover) => {
        return this.ownerObjectFromContract(clover)
      })
    })
  }

  getCloverOwnerAtKeyByBoardKey (boardKey = 0, ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoardKey(new BN(boardKey, 10), new BN(ownerKey, 10)).then((clover) => {
        return this.ownerObjectFromContract(clover)
      })
    })
  }

  ownerObjectFromContract (contractArray) {
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      owner: contractArray[1]
    }
  }

  cloverObjectFromContract (contractArray) {
    // contractArray =  [board, lastPaidAmount, numberOfOwners, mostRecentOwner, first32Moves, lastMoves]
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      currentPrice: contractArray[1].mul(2).toNumber(),
      numberOfOwners: contractArray[2].toNumber(),
      mostRecentOwner: contractArray[3],
      byteFirst32Moves: contractArray[4],
      byteLastMoves: contractArray[5],
      moves: this.byteMovesToStringMoves(contractArray[4].toString(16), contractArray[5].toString(16))
    }
  }

  // write / transactions


  renameClover (board = '0x0', name = false) {
    if (!name) throw new Error('Can\'t give a clover an empty name')
    return this.deploy().then((instance) => {
      return instance.getCloverOwner().then((owner) => {
        if (owner !== this.account) {
          throw new Error('Can\'t name a clover you don\'t own')
        } else {
          return instance.renameClover(new BN(board, 16), name, {from: this.account})
        }
      })
    })
  }

  // function changeStartPrice(bytes16 board, uint256 startPrice) public exists(board) {
  //   if(clovers[board].previousOwners[0] != msg.sender) revert();
  //   if(clovers[board].previousOwners.length > 1) revert();
  //   clovers[board].lastPaidAmount = startPrice;
  // }

  // function mineClover(bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public returns(uint) {

  // }

  // function buyClover (bytes16 b) public returns(bool) {

  // }
}

export default Clover
