import BN from 'bignumber.js'
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'

let web3 = self && self.web3

class Clover extends Reversi {

  constructor (events = false) {
    super()
    this.ClubToken = false
    this.account = false
    this.accountInterval = false
    this.registeredBoards = []
    this.event = events
    this.findersFee = this.startPrice = 0
  }

  // Connections

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
    this.ClubToken = contract(clubTokenArtifacts)
    this.ClubToken.setProvider(web3.currentProvider)
    if (this.events) {
      this.deploy().then((instance) => {
        instance.DebugGame({fromBlock: 'latest'}).watch((error, result) => {
          console.log('DebugGame Event')
          if (error) console.error(error)
          if (result) console.log(result)
        })
        instance.DebugBoard({fromBlock: 'latest'}).watch((error, result) => {
          console.log('DebugBoard Event')
          if (error) console.error(error)
          if (result) console.log(result)
        })
        instance.Registered({fromBlock: 'latest'}).watch((error, result) => {
          console.log('Registered Event')
          if (error) console.error(error)
          if (result) console.log(result)
        })
      })
    }
  }

  deploy () {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().catch((err) => {
      console.error(err)
    })
  }



  // Contract Management

  // contract read only / calls

  adminLen () {
    return this.deploy().then((instance) => {
      return instance.adminLen()
    })
  }

  adminAt (adminKey = 0) {
    return this.deploy().then((instance) => {
      return instance.adminAt(new BN(adminKey, 10))
    })
  }

  // contract write / transactions

  addAdmin (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.isAdmin().then((isAdmin) => {
        if (isAdmin) {
          return instance.addAdmin(address, {from: this.account})
        } else {
          console.error('Can\'t addAdmin() if not an admin')
        }
      })
    })
  }

  updateMultiplier (multiplier = 100) {
    return this.deploy().then((instance) => {
      return instance.isAdmin().then((isAdmin) => {
        if (isAdmin) {
          return instance.updateMultiplier(new BN(multiplier, 10), {from: this.account})
        } else {
          console.error('Can\'t updateModifier() if not an admin')
        }
      })
    })
  }



  // Player Management

  // contract read only / calls

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

  // app calls

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

  registerGameMovesString (moves = '', startPrice = 100) {
    moves = this.sliceMovesStringToBytes(moves)
    this.mineClover(moves[0], moves[1], startPrice)
  }

  // contract read only / calls

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
        return this.formatClover(clover)
      })
    })
  }

  getClover (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getClover(new BN(board, 16)).then((clover) => {
        return this.formatClover(clover)
      })
    })
  }

  getCloverOwnersLength (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnersLength(new BN(board, 16))
    })
  }

  getCloverOwner (board = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getCloverOwner(new BN(board, 16)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }

  getCloverOwnerAtKeyByBoard (board = '0x0', ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoard(new BN(board, 16), new BN(ownerKey, 10)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }

  getCloverOwnerAtKeyByBoardKey (boardKey = 0, ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoardKey(new BN(boardKey, 10), new BN(ownerKey, 10)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }


  // contract write / transactions

  // renameClover (board = '0x0', name = false) {
  //   if (!name) throw new Error('Can\'t give a clover an empty name')
  //   return this.deploy().then((instance) => {
  //     return instance.getCloverOwner().then((owner) => {
  //       if (owner !== this.account) {
  //         throw new Error('Can\'t name a clover you don\'t own')
  //       } else {
  //         return instance.renameClover(new BN(board, 16), name, {from: this.account})
  //       }
  //     })
  //   })
  // }

  changeStartPrice (board = '0x0', startPrice = 0) {
    if (!startPrice === 0) throw new Error('Can\'t give a clover a start price of 0')
    return this.deploy().then((instance) => {
      return instance.getCloverOwner().then((owner) => {
        if (owner !== this.account) {
          throw new Error('Can\'t change start price of clover you dont\' own')
        } else {
          return instance.getCloverOwnersLength().then((len) => {
            if (len > 1) {
              throw new Error('Can\'t change start price of an already flipped clover')
            } else {
              return instance.changeStartPrice(new BN(board, 16), new BN(startPrice, 10), {from: this.account})
            }
          })
        }
      })
    })
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
      return this.deploy().then((instance) => {
        return instance.mineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), startPrice, {from: this.account} )
      })
    }
  }

  adminMineClover (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, byteBoard = this.byteBoard, startPrice = 100) {
    return this.deploy().then((instance) => {
      return instance.adminMineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), new BN(startPrice, 10), {from: this.account})
    })
  }

  buyClover (board = this.byteBoard) {
    return this.deploy.then((instance) => {
      return instance.cloverExists.call(new BN(board, 16)).then((result) => {
        if (!result) {
          throw new Error('Can\'t buy a clover that hasn\'t been found')
        } else {
          return instance.buyClover(new BN(board, 16), {from: this.account} )
        }
      })
    })
  }

  // formatting

  formatOwner (contractArray) {
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      owner: contractArray[1]
    }
  }

  formatClover (contractArray) {
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



  // Game Management

  // contract read only / calls

  gameIsValid (byteFirst32Moves = '0x0', byteLastMoves = '0x0') {
    return this.deploy().then((instance) => {
      return instance.gameIsValid(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }
  
  gameExists (byteFirst32Moves = '0x0', byteLastMoves = '0x0') {
    return this.deploy().then((instance) => {
      return instance.gameExists(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }
  
  getFindersFee (byteBoard = '0x0') {
    return this.deploy().then((instance) => {
      return instance.getFindersFee(new BN(byteBoard, 16))
    })
  }

//returns(uint8 moveKey, bool error, bool complete, uint8 currentPlayer, bytes16 board)
  showGameConstant (byteFirst32Moves = 0, byteLastMoves = 0) {
    return this.deploy().then((instance) => {
      return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        return formatGame(result)
      })
    })
  }

  // contract write / transactions

  showGameDebug (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.ClubToken) this.setContract()
    if (!this.account) return
    this.ClubToken.deployed().then((instance) => {
      instance.showGameDebug(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account})
    })
  }

  formatGame (contractArray = []) {
    return {
      moveKey: contractArray[0],
      error: contractArray[1],
      complete: contractArray[2],
      currentPlayer: contractArray[3],
      byteBoard: contractArray[4],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0])
    }
  }


}

export default Clover
