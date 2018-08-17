import Reversi from 'clovers-reversi'
import { Clovers, CurationMarket } from 'clovers-contracts'
import { prettyBigNumber } from '@/utils'

export default {
  userBalance (_, { user }) {
    return user && user.balance
  },
  prettyUserBalance (_, { user }) {
    if (!user) return '0'
    return prettyBigNumber(user.balance, 0)
  },
  sortedClovers ({ sortBy, feedFilter, allClovers }, { curationMarketAddress }) {
    return allClovers
      .slice(0)
      .sort((a, b) => {
        if (typeof a[sortBy] === 'object') {
          return a[sortBy].gt(b[sortBy]) ? -1 : a[sortBy].lt(b[sortBy]) ? 1 : 0
        }
        return Number(b[sortBy]) - Number(a[sortBy])
      })
      .filter(clover => {
        if (feedFilter === 'market') {
          if (clover.board === '0x955565555995665965956565565a5556') {
            console.log(clover.price)
            console.log(clover.price.toString(10))
            console.log(clover.price.gt(0))
          }
          return clover.price.gt(0)
        } else if (feedFilter === 'curationMarket') {
          return (
            clover.owner.toLowerCase() === curationMarketAddress.toLowerCase()
          )
        }
        return true
      })
  },
  userClovers ({ allClovers }, { user }) {
    if (!user) return []
    return user.clovers
      .slice(0)
      .map(id => {
        return allClovers.find(c => c.board.toLowerCase() === id.toLowerCase())
      })
      .sort((a, b) => {
        return Number(b.modified) - Number(a.modified)
      })
  },
  user ({ allUsers, account }) {
    if (!account) return { address: null, name: 'anon', clovers: [] }
    let current = allUsers.find(
      u => u.address.toLowerCase() === account.toLowerCase()
    )
    if (!current) {
      return {
        address: account,
        name: account,
        clovers: []
      }
    }
    return current
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
  },

  wrongNetwork: state => state.networkId !== state.correctNetwork,

  curationMarketAddress ({ correctNetwork }) {
    return CurationMarket.networks[correctNetwork].address.toLowerCase()
  },
  cloversBankAddress ({ correctNetwork }) {
    return Clovers.networks[correctNetwork].address.toLowerCase()
  },
  registeredEvents (state) {
    // return state.logs.filter(log => log.name === 'Registered')
  },
  symmetries (state) {
    // console.log('symmetries calculated')
    // // return {Symmetricals: 0, RotSym: 0, X0Sym: 0, Y0Sym: 0, XYSym: 0, XnYSym: 0, PayMultiplier: 100}
    // let Symmetricals = 0
    // let RotSym = 0
    // let X0Sym = 0
    // let Y0Sym = 0
    // let XYSym = 0
    // let XnYSym = 0
    // let reversi = new Reversi()
    // for (let i = 0; i < state.allClovers.length; i++) {
    //   let clover = state.allClovers[i]
    //   reversi.byteBoard = clover.board
    //   reversi.byteBoardPopulateBoard()
    //   reversi.isSymmetrical()
    //   Symmetricals += reversi.symmetrical
    //   RotSym += reversi.RotSym
    //   X0Sym += reversi.X0Sym
    //   Y0Sym += reversi.Y0Sym
    //   XYSym += reversi.XYSym
    //   XnYSym += reversi.XnYSym
    // }
    // return {
    //   Symmetricals,
    //   RotSym,
    //   X0Sym,
    //   Y0Sym,
    //   XYSym,
    //   XnYSym,
    //   PayMultiplier: 100
    // }
  }
}
