import Reversi from 'clovers-reversi'
import utils from 'web3-utils'
import { Clovers } from 'clovers-contracts'
import { prettyBigNumber, abbrvAddr, abbrvNum, cloverImage } from '@/utils'
import BigNumber from 'bignumber.js'

export default {
  apiBase ({networkId}) {
    var apiBase = process.env.VUE_APP_API_URL
    if (apiBase.indexOf(":4444") < 0) {
      apiBase =  '//' + (networkId === 4 ? 'api2' : 'api') + '.clovers.network'
    }
    return apiBase
  },
  baseURL: (_, {apiBase}) => (path) => {
    return apiBase + path
  },
  user ({ account, accountData }) {
    if (!account) return { address: null, name: 'anon', clovers: [], balance: '0', image: '' }
    return accountData || {
      address: account,
      name: account,
      clovers: [],
      balance: '0'
    }
  },

  userBalance (_, { user }) {
    return utils.fromWei(user.balance || '0')
  },
  userBalanceWei (_, { user }) {
    return new BigNumber(user.balance || '0')
  },
  prettyUserBalance (_, { userBalance }) {
    return parseInt(userBalance || 0).toFixed(0).toLocaleString()
  },
  userBalanceInETH ({ clubTokenPrice }, { userBalanceWei }) {
    if (!clubTokenPrice) return 0
    let ctp = new BigNumber(clubTokenPrice)
    return abbrvNum(userBalanceWei.div(ctp).toString(10))
  },
  userName: ({ nullAddress }, { cloversBankAddress, curationMarketAddress }) => (user, truncate = true) => {
    if (!user) return null
    if (typeof user === 'string') {
      user = { address: user }
    }
    let { address } = user
    let name = address === cloversBankAddress ? 'Clovers'
      : address === curationMarketAddress ? 'Curation Mrkt.'
        : address === nullAddress ? 'Nobody' : null
    if (name) return name
    name = user.name && user.name.trim() !== '' ? user.name
      : user.ens ? user.ens : address

    if (utils.isAddress(name) && truncate) {
      name = abbrvAddr(name)
    }
    return name
  },
  userImage: (_, { userName }) => (user, size = 200) => {
    if (typeof user === 'string') {
      return cloverImage(user || '0', size)
    }
    const str = user.image || user.address // || userName(user, false)
    return cloverImage(str || '0', size)
  },
  sortedClovers ({ sortBy, feedFilter, allClovers }, { curationMarketAddress }) {
    return allClovers
      .slice(0)
      .sort((a, b) => {
        if (!a[sortBy]) return 1
        if (typeof a[sortBy] === 'object') {
          return a[sortBy].gt(b[sortBy]) ? -1 : a[sortBy].lt(b[sortBy]) ? 1 : 0
        }
        return Number(b[sortBy]) - Number(a[sortBy])
      })
      .filter(clover => {
        if (feedFilter === 'market') {
          if (typeof clover.price !== 'object') {
            clover.price = new BigNumber(clover.price)
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
    if (!allClovers.length) return []
    return allClovers.filter((c) => {
      return user.address.toLowerCase() === c.owner.toLowerCase()
    }).sort((a, b) => Number(b.modified) - Number(a.modified))
    // return user.clovers
    //   .slice(0)
    //   .map(id => {
    //     return allClovers.find(c => c.board.toLowerCase() === id.toLowerCase())
    //   })
    //   .sort((a, b) => {
    //     return Number(b.modified) - Number(a.modified)
    //   })
  },
  userAlbums ({ allAlbums }, { user }) {
    return allAlbums.filter(a => a.userAddress === user.address)
  },
  newCloversCount ({ newClovers }) {
    return newClovers.length
  },

  picks ({ allSavedClovers }) {
    return allSavedClovers || []
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
    return null // CurationMarket.networks[correctNetwork].address.toLowerCase()
  },
  cloversBankAddress ({ networkId, correctNetwork }) {
    return Clovers.networks[networkId || correctNetwork].address.toLowerCase()
  },
  priceInCollateral ({ orders }) {
    if (!orders.length) return new BigNumber(0)
    let recent = orders[0]
    return new BigNumber(recent.value).div(new BigNumber(recent.tokens))
  },
  clubTokenInUSD ({ ethPrice }, { priceInCollateral }) {
    return priceInCollateral.times(new BigNumber(ethPrice))
  },
  symmetries () {
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
