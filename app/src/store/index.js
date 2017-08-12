import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import * as types from './mutation-types'
/* global web3:true */

import contract from 'truffle-contract'

// import artifacts
import cloverTokenArtifacts from '../../../build/contracts/CloverToken.json'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const rootState = {
  CloverToken: false,
  account: '',
  balance: '0',
  amount: '',
  address: '',
  status: ''
}

const getters = {
  account: state => state.account,
  balance: state => state.balance,
  amount: state => state.amount,
  address: state => state.address,
  status: state => state.status
}

const actions = {
  // action is dispatched when account is first set
  // this is where you can put your initialization calls
  setAccount ({ commit, dispatch, state }, account) {
    commit(types.UPDATE_ACCOUNT, account)
    dispatch('setContract')
    dispatch('getBalance')
  },
  setContract ({commit, dispatch, state}) {
    // create contracts
    commit(types.UPDATE_CONTRACT)
  },
  // action is dispatched when/if the account is updated
  // use this action to refresh the app with the new account's data
  updateAccount ({ commit, dispatch, state }, account) {
    commit(types.UPDATE_ACCOUNT, account)
    dispatch('getBalance')
  },
  sendToken ({ commit, dispatch, state }) {
    commit(types.UPDATE_STATUS, 'Initiating transaction... (please wait)')
    state.CloverToken.deployed().then(instance => (
      instance.transfer(state.address, parseInt(state.amount, 10), { from: state.account })
    )).then(() => {
      dispatch('getBalance')
      commit(types.UPDATE_STATUS, 'Transaction complete!')
    }).catch((err) => {
      console.error(err)
      commit(types.UPDATE_STATUS, 'Error sending coin; see log.')
    })
  },
  tryFunction ({commit, dispatch, state}) {
    state.CloverToken.deployed().then((instance) => {
      instance.stringToBytes.call('0xF5F6E6D6C7C6C4D3D7B4C5B6B5F7A5E3E7A6A4A3F4C8D8E8G6H7G4G5F8G8G3H4H3H2F3F2B3A2C3C2E2F1B8A8E1D1H6H5D2C1B2B7A7B1A1G1G2H1H8G7').then((response) => {
        console.log(response)
      //   dispatch('getBalance')
      // }).catch((err) => {
      //   console.log(err)
      // })

      // instance.getThrowaway({ from: state.account }).then((response) => {
      //   console.log(response)
        // instance.registerGame(response, { from: state.account }).then((response) => {
        //   console.log(response)
        // }).catch((err) => {
        //   console.log(err)
        // })
      }).catch((err) => {
        console.log(err)
      })
      // console.log(foo)
    //   instance.returnKeys.call()
    // )).then((response) => {
    //   console.log(response)
    // }).catch((err) => {
    //   console.error(err)
    })
  },
  getBalance ({ commit, dispatch, state }) {
    if (!state.account) {
      setTimeout(function () {
        dispatch('getBalance')
      }, 500)
      return
    }
    state.CloverToken.deployed().then(instance => (
      instance.balanceOf.call(state.account)
    )).then((balance) => {
      commit(types.UPDATE_BALANCE, balance.toString())
    }).catch((err) => {
      console.error(err)
      commit(types.UPDATE_STATUS, 'Error getting balance; see log.')
    })
  }
}

const mutations = {
  // this mutatation is called when the route changes
  [types.ROUTE_CHANGED] (state, { to, from }) {
    console.log('route changed from', from.name, 'to', to.name)
  },
  [types.UPDATE_ACCOUNT] (state, account) {
    state.account = account
  },
  [types.UPDATE_ADDRESS] (state, address) {
    state.address = address
  },
  [types.UPDATE_AMOUNT] (state, amount) {
    state.amount = amount
  },
  [types.UPDATE_BALANCE] (state, balance) {
    state.balance = balance
  },
  [types.UPDATE_STATUS] (state, status) {
    state.status = status
  },
  [types.UPDATE_CONTRACT] (state) {
    state.CloverToken = contract(cloverTokenArtifacts)
    return state.CloverToken.setProvider(web3.currentProvider)
  }
}

export default new Vuex.Store({
  state: rootState,
  getters,
  actions,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
