import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import utils from 'web3-utils'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'

global.Reversi = new Reversi()

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const state = {
  // stored signin tokens
  tokens: getTokens(),

  account: null,
  accountData: null,

  pagedClovers: {},

  // web3 stuff
  enabled: false,
  waitToPing: true,
  unlocked: false,
  querying: false,
  tryAgain: false,
  networkId: null,
  correctNetwork: 4,
  contractsDeployed: false,
  nullAddress: '0x0000000000000000000000000000000000000000',

  miningStats: getMiningStats(),

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
  ethPrice: '0',
  clubTokenPrice: '0',
  market: null,
  orders: [],

  // allUsers: [],

  // new log items from socket
  logs: [],

  messages: [],
  submittingBoards: [],
  basePrice: utils.toWei('0.001'),
  stakeAmount: new BigNumber(96842)
    .mul(1000000000)
    .mul(40)
    .toString(10)
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
  if (!window.localStorage) return null
  return JSON.parse(window.localStorage.getItem(key))
}

function getSavedClovers (key = 'saved_clovers') {
  if (!window.localStorage) return []
  let stored = JSON.parse(window.localStorage.getItem(key))
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
  if (!window.localStorage) return empty
  return JSON.parse(window.localStorage.getItem(key)) || empty
}
