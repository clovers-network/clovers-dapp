import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import actions from './actions'
import mutations from './mutations'

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
  registeredClovers: []
}

const getters = {
  name: state => state.name,
  symbol: state => state.symbol,
  account: state => state.account,
  balance: state => state.balance,
  amount: state => state.amount,
  address: state => state.address,
  status: state => state.status,
  hashRate: state => state.hashRate,
  mining: state => state.mining,
  miningPower: state => state.miningPower
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
