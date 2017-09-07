import Clover from '../assets/clovers'

export default {
  clover: state => state.clover,
  error: state => state.clover.error,
  name: state => state.clover.name,
  symbol: state => state.clover.symbol,
  account: state => state.clover.account,
  balance: state => state.clover.balance,
  hashRate: state => state.hashRate,
  mining: state => state.mining,
  miningPower: state => state.miningPower,
  symmetries: (state, getters) => {
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
  allClovers: state => {
    console.log('re calc allClovers')
    let clovers = []
    JSON.parse(JSON.stringify(state.registeredEvents))
    .sort((a, b) => {
      return a.args.registeredEvent - b.args.registeredEvent
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
          console.error('Registered Event for board not yet in array', e)
        }
      }
    })
    return clovers
  },
  allUsers: state => {
    console.log('re calc allUsers')
    let users = []
    JSON.parse(JSON.stringify(state.registeredEvents))
    .sort((a, b) => {
      return a.args.registeredEvent - b.args.registeredEvent
    })
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
    return users
  }
}
