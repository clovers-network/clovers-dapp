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
    this.registeredEvents = []
    this.events = events
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
  }

  stopEvents () {
    this.deploy().then((instance) => {
      instance.Registered().stopWatching()
    })
  }

  setEvents () {
    this.deploy().then((instance) => {
      instance.Registered({}, {fromBlock: 848335}).get(function (error, result) {
        if (error) console.error(error)
        if (result)
          window.dispatchEvent(new CustomEvent('eventsRegistered', {detail: result}))
          // result.forEach((e) => window.dispatchEvent(new CustomEvent('eventRegistered', {detail: e})))
      })

      let newEvents = instance.Registered({}, {fromBlock: 'latest'})
      newEvents.watch((error, registeredEvent) => {
        if (error) console.error(error)
        else {
          window.dispatchEvent(new CustomEvent('eventRegistered', {detail: registeredEvent}))
        }
      })

    })
  }

  deploy () {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed()
  }


  // Contract Management

  // contract read only / calls

  isAdmin () {
    return this.deploy().then((instance) => {
      return instance.isAdmin({from: this.account})
    })
  }

  adminLen () {
    return this.deploy().then((instance) => {
      return instance.adminLen().then((num) => new BN(num).toNumber())
    })
  }

  adminAt (adminKey = 0) {
    return this.deploy().then((instance) => {
      return instance.adminAt(new BN(adminKey, 10))
    })
  }

  myAddress () {
    return this.deploy().then((instance) => {
      return instance.myAddress({from: this.account})
    })
  }

  getTallys () {
    return this.deploy().then((instance) => {
      return instance.getTallys().then((result) => {
        return this.formatTallys(result)
      })
    })
  }

  testTallys (byteBoard = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.testTallys(new BN(byteBoard, 16)).then((tallys) => {
        return this.formatTallys(tallys)
      })
    })
  }

  // contract write / transactions

  addAdmin (address = '0x0') {
    return this.isAdmin().then((isAdmin) => {
      if (isAdmin) {
        return this.deploy().then((instance) => {
          return instance.addAdmin(address, {from: this.account})
        })
      } else {
        throw new Error('Can\'t addAdmin() if not an admin')
      }
    })

  }

  updateMultiplier (multiplier = 100) {
    return this.isAdmin().then((isAdmin) => {
      if (isAdmin) {
        return this.deploy().then((instance) => {
          return instance.updateMultiplier(new BN(multiplier, 10), {from: this.account})
        })
      } else {
        throw new Error('Can\'t updateModifier() if not an admin')
      }
    })
  }

  // formatting

  formatTallys (contractArray = Array(6)) {
    // console.log(contractArray)
    let tallys = {
      Symmetricals: contractArray[0].toNumber(),
      RotSym: contractArray[1].toNumber(),
      Y0Sym: contractArray[2].toNumber(),
      X0Sym: contractArray[3].toNumber(),
      XYSym: contractArray[4].toNumber(),
      XnYSym: contractArray[5].toNumber(),
      PayMultiplier: contractArray[6].toNumber()
    }
    return {tallys, findersFee: this.symmetrical && this.calcFindersFees(tallys)}
  }

  calcFindersFees (tallys = Array(), RotSym = this.RotSym, Y0Sym = this.Y0Sym, X0Sym = this.X0Sym, XYSym = this.XYSym, XnYSym = this.XnYSym) {
    let base = 0
    if(this.symmetrical && !RotSym && !Y0Sym && !X0Sym && !XYSym && !XnYSym) {
      this.isSymmetrical()
      return this.calcFindersFees(tallys)
    }

    if (RotSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.RotSym + 1 )
    if (Y0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.Y0Sym + 1 )
    if (X0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.X0Sym + 1 )
    if (XYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XYSym + 1 )
    if (XnYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XnYSym + 1 )

    return Math.floor(base)
  }



  // Player Management

  // contract read only / calls

  listPlayerCount () {
    return this.deploy().then((instance) => {
      return instance.listPlayerCount().then((num) => new BN(num).toNumber())
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
      return instance.playerCurrentCount(address).then((num) => new BN(num).toNumber())
    })
  }

  playerAllCount (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerAllCount(address).then((num) => new BN(num).toNumber())
    })
  }

  playerCloverByKey (address = '0x0', cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(cloverKey, 10))
    })
  }

  playerOwnsClover (address = '0x0', board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(board, 16))
    })
  }



  // Clover Management

  // app calls

  // listClovers () {
  //   if (!this.ClubToken) this.setContract()
  //   this.ClubToken.deployed().then((instance) => {
  //     instance.getCloversCount().then((result) => {
  //       if (result.toNumber() !== this.registeredBoards.length) {
  //         this.registeredBoards = []
  //         for (let i = 0; i < result.toNumber(); i++) {
  //           instance.getCloverByKey(i).then((result) => {
  //             this.registeredBoards.splice(i, 1, result)
  //           })
  //         }
  //       }
  //     })
  //   })
  // }

  register (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, startPrice = this.startPrice, byteBoard = this.byteBoard) {
    return this.isAdmin().then((isAdmin) => {
      return this.deploy().then((instance) => {
        if (isAdmin) {
          return this.adminMineClover(byteFirst32Moves, byteLastMoves, byteBoard, startPrice)
        } else {
          return this.mineClover(byteFirst32Moves, byteLastMoves, startPrice)
        }
      })
    })
  }

  // contract read only / calls

  cloverExists (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.cloverExists(new BN(board, 16))
    })
  }

  getCloversCount () {
    return this.deploy().then((instance) => {
      return instance.getCloversCount().then((num) => new BN(num).toNumber())
    })
  }

  getCloverByKey (cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverByKey(new BN(cloverKey, 10)).then((clover) => {
        return this.formatClover(clover)
      })
    })
  }

  getClover (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getClover(new BN(board, 16)).then((clover) => {
        return this.formatClover(clover)
      })
    })
  }

  getCloverOwnersLength (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnersLength(new BN(board, 16)).then((num) => new BN(num).toNumber())
    })
  }

  getCloverOwner (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwner(new BN(board, 16)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }

  getCloverOwnerAtKeyByBoard (board = this.byteBoard, ownerKey = 0) {
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

  changeStartPrice (board = this.byteBoard, startPrice = 100) {
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

  mineClover (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, startPrice = 100) {
    this.playGameByteMoves(byteFirst32Moves, byteLastMoves)
    if (this.error) {
      throw new Error('Game is not valid')
    } else if (!this.complete) {
      throw new Error('Game is not complete')
    } else if (!this.symmetrical) {
      throw new Error('Game is not symmetrical')
    } else {
      return this.deploy().then((instance) => {
        return instance.mineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), startPrice, {from: this.account}).then(() => byteBoard)
      })
    }
  }

  adminMineClover (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, byteBoard = this.byteBoard, startPrice = 100) {
    return this.deploy().then((instance) => {
      return instance.adminMineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), new BN(startPrice, 10), {from: this.account}).then(() => byteBoard)
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

  formatOwner (contractArray = new Array(5)) {
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      owner: contractArray[1]
    }
  }

  formatClover (contractArray = new Array(5)) {
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

  gameIsValid (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.gameIsValid(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }

  gameExists (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.gameExists(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }

  getSymmetry (byteBoard = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getSymmetry(new BN(byteBoard, 16)).then((game) => {
        return this.formatGame(game)
      })
    })
  }

  getFindersFee (byteBoard = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getFindersFee(new BN(byteBoard, 16)).then((num) => new BN(num).toNumber())
    })
  }

  showGameConstant (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      console.log(this.binaryMovesToStringMoves(new BN(byteFirst32Moves, 16).toString(2)))
      console.log(this.binaryMovesToStringMoves(new BN(byteLastMoves, 16).toString(2)))
      return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        return this.formatGame(result)
      })
    })
  }

  showGameBoard (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.showGameBoard(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        return this.byteBoardToRowArray(result)
      })
    })
  }

  // contract write / transactions

  showGameDebug (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    if (!this.account) return
    return this.deploy().then((instance) => {
      return instance.showGameDebug(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account})
    })
  }

  formatGame (contractArray = []) {
    // console.log(contractArray)
    //    DebugGame(game.board, game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
    return {
      error: contractArray[0],
      complete: contractArray[1],
      symmetrical: contractArray[2],
      RotSym: contractArray[3],
      Y0Sym: contractArray[4],
      X0Sym: contractArray[5],
      XYSym: contractArray[6],
      XnYSym: contractArray[7]
    }
  }


}

export default Clover
