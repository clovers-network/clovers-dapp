import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

import Clover from '../assets/clovers'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const state = {
  name: null,
  symbol: null,
  ClubToken: false,
  account: '0x0',
  balance: '0',
  decimals: 0,
  amount: '',
  address: '',
  status: '',
  hashRate: 0,
  mineTime: 0,
  totalMined: 0,
  cloversFound: 0,
  mining: false,
  miningPower: 0,
  minedClovers: [],
  registeredEvents: [],
  clover: new Clover()
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: false, // debug,
  plugins: debug ? [createLogger()] : []
})
