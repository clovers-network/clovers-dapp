import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const state = {
  // stored signin tokens
  tokens: getTokens(),

  currentBlock: null,
  clubTokenSymbol: '♣',
  network: null,
  account: null,
  readOnly: null,
  balance: 0,
  hashRate: 0,
  mineTime: 0,
  totalMined: 0,
  mining: false,
  miningPower: 0,

  // socket events pushed to clover queue
  newClovers: [],
  // all pages get pushed to full list
  allClovers: [],
  // saved clovers, organized by account ID
  // use getter savedClovers in views
  allSavedClovers: getSavedClovers(),

  users: [],
  logs: [],
  messages: [],
  submittingBoards: []
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
