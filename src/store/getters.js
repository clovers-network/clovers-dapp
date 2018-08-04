import Reversi from 'clovers-reversi'
import { CurationMarket } from 'clovers-contracts'

export default {
  notRinkeby: state => state.networkId !== state.correctNetwork,

  curationMarketAddress ({ correctNetwork }) {
    return CurationMarket.networks[correctNetwork].address
  },

  username (state, getters) {
    console.log('username calculated')
    return (
      state.users.find(
        u =>
          getters.account &&
          u.address.toLowerCase() === getters.account.toLowerCase()
      ) || { address: getters.account, name: getters.account }
    )
  },
  registeredEvents (state) {
    return state.logs.filter(log => log.name === 'Registered')
  },
  minedClovers (state) {
    console.log('mined clovers calculated')
    // return state.allSavedClovers || []
    return (
      (state.allSavedClovers.length &&
        state.allSavedClovers.map(c => {
          let clover =
            state.allClovers &&
            state.allClovers.find(ac => ac.board === '0x' + c.byteBoard)
          if (clover) {
            c.claimed = clover.created
          }
          return c
        })) ||
      []
    )
  },
  symmetries (state) {
    console.log('symmetries calculated')
    // return {Symmetricals: 0, RotSym: 0, X0Sym: 0, Y0Sym: 0, XYSym: 0, XnYSym: 0, PayMultiplier: 100}
    let Symmetricals = 0
    let RotSym = 0
    let X0Sym = 0
    let Y0Sym = 0
    let XYSym = 0
    let XnYSym = 0
    let reversi = new Reversi()
    for (let i = 0; i < state.allClovers.length; i++) {
      let clover = state.allClovers[i]
      reversi.byteBoard = clover.board
      reversi.byteBoardPopulateBoard()
      reversi.isSymmetrical()
      Symmetricals += reversi.symmetrical
      RotSym += reversi.RotSym
      X0Sym += reversi.X0Sym
      Y0Sym += reversi.Y0Sym
      XYSym += reversi.XYSym
      XnYSym += reversi.XnYSym
    }
    return {
      Symmetricals,
      RotSym,
      X0Sym,
      Y0Sym,
      XYSym,
      XnYSym,
      PayMultiplier: 100
    }
  },

  newCloversCount ({ newClovers }) {
    return newClovers.length
  },

  picks ({ account, allSavedClovers }) {
    return allSavedClovers[account || 'anon'] || []
  },
  pickCount (_, { picks }) {
    return picks.length
  },

  authHeader ({ account, tokens }) {
    if (!account || !tokens || !tokens[account]) return null
    return `Basic ${btoa(`${account}:${tokens[account]}`)}`
  }
}
