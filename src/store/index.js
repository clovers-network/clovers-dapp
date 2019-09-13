import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import utils from 'web3-utils'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import demoAlbums from '@/demo-albums'

import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'

global.Reversi = new Reversi()

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const state = {
  // demo !!
  albums: demoAlbums,

  web3Enabled: false,
  // stored signin tokens
  tokens: getTokens(),

  account: null,
  accountData: null,

  pagedClovers: {},
  allAlbums: [],
  pagedAlbums: [],
  currentAlbum: {},

  // web3 stuff
  enabled: false,
  waitToPing: true,
  unlocked: false,
  querying: false,
  tryAgain: false,
  networkId: null,
  correctNetwork: 1,
  contractsDeployed: false,
  nullAddress: '0x0000000000000000000000000000000000000000',

  miningStats: getMiningStats(),

  newSyms: [],
  // socket events pushed to clover queue
  newClovers: [],
  // all pages get pushed to full list
  allClovers: [],
  currentPage: {},
  currentClover: {},
  otherUser: null,

  // use getter 'picks' in views
  allSavedClovers: getSavedClovers(),

  // orders
  gasPrice: null,
  ethPrice: '0',
  clubTokenPrice: '0',
  market: null,
  orders: [],

  // allUsers: [],
  pagedUsers: [],

  // new log items from socket
  logs: [],

  messages: [],
  submittingBoards: [],
  basePrice: utils.toWei('3'),
  stakeAmount: new BigNumber(96842)
    .mul(1000000000)
    .mul(40)
    .toString(10),

  // pig
  miners: [],
  hashrate: 0,
  mined: 0
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: false, // debug,
  plugins: debug ? [createLogger()] : []
})

function getTokens (key = 'clover_tokens') {
  if (window.localStorage) {
    return JSON.parse(window.localStorage.getItem(key))
  } else if (localStorage) {
    return JSON.parse(localStorage.getItem(key))
  }
}

function getSavedClovers (key = 'saved_clovers') {
  let stored
  if (window.localStorage) {
    stored = JSON.parse(window.localStorage.getItem(key))
  } else if (localStorage) {
    stored = JSON.parse(localStorage.getItem(key))
  } else {
    return []
  }
  if (!Array.isArray(stored)) {
    let all = []
    for (var foo in stored) {
      if (stored.hasOwnProperty(foo)) {
        all = all.concat(stored[foo])
      }
    }
    stored = all
  }
  return stored || []
}

function getMiningStats (key = 'clover_pig_stats') {
  let empty = { mineTime: 0, totalMined: 0, symms: 0 }
  if (window.localStorage) {
    return JSON.parse(window.localStorage.getItem(key)) || empty
  } else if (localStorage) {
    return JSON.parse(localStorage.getItem(key)) || empty
  }
  return empty
}
