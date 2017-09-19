import Clover from '../assets/clovers'

import xss from 'xss'

export default {
  submittingBoards: state => state.submittingBoards,
  clover: state => state.clover,
  readOnly: state => state.clover.readOnly,
  notRinkeby: state => state.clover.notRinkeby,
  error: state => state.clover.error,
  name: state => state.clover.name,
  symbol: state => state.clover.symbol,
  account: state => state.clover.account,
  username: (state, getters) => {
    return getters.usernames.find((u) => u.address === getters.account) || {address: getters.account, name: getters.account}
  },
  registeredEvents: state => state.registeredEvents,
  usernameEvents: state => state.usernameEvents,
  clovernameEvents: state => state.clovernameEvents,
  balance: state => state.clover.balance,
  hashRate: state => state.hashRate,
  mining: state => state.mining,
  messages: state => state.messages,
  miningPower: state => state.miningPower,
  minedClovers: (state, getters) => {
    console.log('mined clovers calced')
    return (state.allMinedClovers.length && state.allMinedClovers.map((c) => {
      let clover = getters.allClovers && getters.allClovers.find((ac) => ac.board === '0x' + c.byteBoard)
      if (clover) {
        c.claimed = clover.created
      }
      return c
    })) || []
  },
  usernames: state => {
    console.log('user names calculated')
    let usernames = []
    state.usernameEvents.forEach((event) => {
      let userKey = usernames.findIndex((user) => user.address === event.args.player)
      if (userKey > -1) {
        let username = usernames[userKey]
        username.name = xss(event.args.name)
        usernames.splice(userKey, 1, username)
      } else {
        usernames.push({address: event.args.player, name: xss(event.args.name)})
      }
    })
    return usernames
  },
  clovernames: state => {
    console.log('clover names calculated')
    let clovernames = []
    state.clovernameEvents.forEach((event) => {
      let cloverKey = clovernames.findIndex((clover) => clover.board === event.args.board)
      if (cloverKey > -1) {
        let clover = clovernames[cloverKey]
        clover.name = xss(event.args.name)
        clovernames.splice(cloverKey, 1, clover)
      } else {
        clovernames.push({board: event.args.board, name: xss(event.args.name)})
      }
    })
    return clovernames
  },
  symmetries: (state, getters) => {
    console.log('symmetries calculated')
    let Symmetricals = 0
    let RotSym = 0
    let X0Sym = 0
    let Y0Sym = 0
    let XYSym = 0
    let XnYSym = 0
    let reversi = new Clover()
    getters.allClovers.forEach((clover) => {
      reversi.byteBoard = clover.board
      reversi.byteBoardPopulateBoard()
      reversi.isSymmetrical()
      Symmetricals += reversi.symmetrical
      RotSym += reversi.RotSym
      X0Sym += reversi.X0Sym
      Y0Sym += reversi.Y0Sym
      XYSym += reversi.XYSym
      XnYSym += reversi.XnYSym
    })
    return {Symmetricals, RotSym, X0Sym, Y0Sym, XYSym, XnYSym, PayMultiplier: 100}
  },
  allClovers: (state, getters) => {
    // if (!getters.clover.eventsComplete) return []
    console.log('all clovers calculated')
    if (getters.clover.allClovers.length) {
      return getters.clover.allClovers.map((c) => {
        return c
      })
    }
    let clovers = []
    JSON.parse(JSON.stringify(state.registeredEvents))
    .sort((a, b) => {
      let first = a
      let second = b
      let returnVal = first.blockNumber === second.blockNumber ? parseInt(first.args.modified) - parseInt(second.args.modified) : parseInt(first.blockNumber) - parseInt(second.blockNumber)
      // console.log(first, second, returnVal)
      return returnVal
    })
    .forEach((e) => {
      if (e.event !== 'Registered') return
      if (e.args.newBoard) {
        clovers.push({
          board: e.args.board,
          first32Moves: e.args.first32Moves,
          lastMoves: e.args.lastMoves,
          lastPaidAmount: parseInt(e.args.lastPaidAmount),
          previousOwners: [e.args.newOwner],
          created: parseInt(e.args.modified),
          modified: parseInt(e.args.modified),
          findersFee: parseInt(e.args.findersFee)
        })
      } else {
        let cloverKey = clovers.findIndex((c) => c.board === e.args.board)
        if (cloverKey > -1) {
          let clover = clovers[cloverKey]
          clover.modified = parseInt(e.args.modified)
          clover.lastPaidAmount = parseInt(e.args.lastPaidAmount)
          clover.previousOwners.push(e.args.newOwner)
          clovers.splice(cloverKey, 1, clover)
        } else {
          console.log(e.args.board)
          console.log(clovers.map((cl) => cl.board))
          console.error('Registered Event for board not yet in array', e)
        }
      }
    })
    return clovers.map((c) => {
      let nameIndex = getters.clovernames.findIndex((cn) => cn.board === c.board)
      if (nameIndex > -1) c.name = getters.clovernames[nameIndex].name
      c.previousOwners = c.previousOwners.map((po) => (getters.allUsers && getters.allUsers.find((u) => u.address === po)) || po)
      return c
    })
  },
  allUsers: (state, getters) => {
    console.log('all users calculated')
    let users = []
    JSON.parse(JSON.stringify(state.registeredEvents))
    .forEach((e) => {
      if (e.event !== 'Registered') return

      let userKey = users.findIndex((u) => u.address === e.args.newOwner)
      if (userKey > -1) {
        let user = users[userKey]
        user.clovers.push(e.args.board)
        users.splice(userKey, 1, user)
      } else {
        users.push({
          address: e.args.newOwner,
          clovers: [e.args.board]
        })
      }
    })
    return users.map((u) => {
      let nameIndex = getters.usernames.findIndex((un) => un.address === u.address)
      if (nameIndex > -1) u.name = getters.usernames[nameIndex].name
      else u.name = u.address
      return u
    })
  }
}
