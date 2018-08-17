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

  // web3 stuff
  waitToPing: true,
  unlocked: false,
  querying: false,
  tryAgain: false,
  account: null,
  networkId: null,
  correctNetwork: 4,

  miningStats: getMiningStats(),

  // socket events pushed to clover queue
  newClovers: [],
  // all pages get pushed to full list
  allClovers: [],
  feedFilter: 'all', // 'all' || 'market'
  sortBy: 'modified', // 'modified' || 'price'

  // saved clovers, organized by account ID
  // use getter 'picks' in views
  allSavedClovers: getSavedClovers(),

  allUsers: [],
  logs: [],
  messages: [],
  submittingBoards: [],
  basePrice: utils.toWei('0.001'),
  stakeAmount: new BigNumber(96842)
    .mul(1000000000)
    .mul(40)
    .toString()
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
  if (!window.localStorage) return {}
  let all = JSON.parse(window.localStorage.getItem(key)) || {}
  if (Object.keys(all).length === 0) {
    all['anon'] = []
  }
  return all
}

function getMiningStats (key = 'clover_pig_stats') {
  let empty = { mineTime: 0, totalMined: 0, symms: 0 }
  if (!window.localStorage) return empty
  return JSON.parse(window.localStorage.getItem(key)) || empty
}
