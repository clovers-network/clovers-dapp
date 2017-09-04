import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import * as types from './mutation-types'
import BN from 'bignumber.js'
import contract from 'truffle-contract'

// import artifacts
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'

Vue.use(Vuex)
import Web3 from 'web3'
let web3 = window.web3
// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const rootState = {
  name: null,
  symbol: null,
  ClubToken: false,
  account: '',
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
  minedClovers: []
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

const actions = {
  connect ({commit, dispatch, state}) {
    if (web3) {
      // Use Mist/MetaMask's provider
      var web3Provider = web3.currentProvider
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/Q5I7AA6unRLULsLTYd6d')
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    web3 = new Web3(web3Provider)
    dispatch('setAccount', web3.eth.accounts[0])
  },
  checkAccounts ({ commit, dispatch, state }) {
    const account = web3.eth.accounts[0]
    if (account !== state.account) {
      dispatch('updateAccount', account)
    }
  },
  // action is dispatched when account is first set
  // this is where you can put your initialization calls
  setAccount ({ commit, dispatch, state }, account) {
    commit(types.UPDATE_ACCOUNT, account)
    dispatch('setContract')
    dispatch('setWatchers')
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
    state.ClubToken.deployed().then(instance => (
      instance.transfer(state.address, parseInt(state.amount, 10), { from: state.account })
    )).then(() => {
      dispatch('getBalance')
      commit(types.UPDATE_STATUS, 'Transaction complete!')
    }).catch((err) => {
      console.error(err)
      commit(types.UPDATE_STATUS, 'Error sending coin; see log.')
    })
  },
  setWatchers ({commit, dispatch, state}) {
    state.ClubToken.deployed().then((instance) => {
      instance.DebugGame({fromBlock: 0}).watch(function (error, result) {
        console.log('watched DebugGame:')
        if (error == null) {
          console.log(result)
        } else {
          console.error(error)
        }
      })
    })
  },
  helloWorld ({commit, dispatch, state}, name) {
    state.ClubToken.deployed().then((instance) => {
      instance.updateName(name, { from: state.account }).then((response) => {
        console.log(response)
        // commit(types.UPDATE_NAME, name)
      }).catch((err) => {
        console.log(err)
      })
    })
  },
  tryFunction ({commit, dispatch, state}, [arr, row, col]) {
    state.ClubToken.deployed().then((instance) => {
      // instance.boardToByte(arr, { from: state.account }).then((response) => {
      // instance.shiftLeft.call('0x0000000000000011', 2).then((response) => {
      // function returnTile(bytes16 board, uint8 col, uint8 row) public constant returns (uint8){
      console.log(arr)
      console.log(row)
      console.log(col)
      // instance.turnTile.call(new BN(arr, 2), 2, row, col).then((response) => {
      instance.testMul.call(12).then((response) => {
        console.log(response)
        // var foo = new BN(response, 16)
        // console.log(foo.toString(2))
      // var start = 3
      // var push = 12
      // console.log(start.toString(16))
      // console.log(start.toString(2))
      // instance.shiftLeft.call(start, push).then((response) => {
      // // instance.testMoves(arr).then((response) => {
      //   console.log(response)
      //   // var foo = new BN(response)
      //   // console.log(foo.toString(2))
      }).catch((err) => {
        console.log(err)
      })
    })
  },
  getBalance ({ commit, dispatch, state }) {
    if (!state.account) {
      setTimeout(function () {
        dispatch('getBalance')
      }, 500)
      return
    }
    if (!state.symbol) {
      state.ClubToken.deployed().then(instance => {
        instance.name.call().then((name) => {
          commit(types.UPDATE_NAME, name)
        })
        instance.symbol.call().then((symbol) => {
          commit(types.UPDATE_SYMBOL, symbol)
        })
      }).catch((err) => {
        console.error(err)
        commit(types.UPDATE_STATUS, 'Error getting balance; see log.')
      })
    }
    state.ClubToken.deployed().then(instance => (
      instance.balanceOf.call(state.account)
    )).then((balance) => {
      var digits = new BN(10).toPower(state.decimals)
      commit(types.UPDATE_BALANCE, balance.div(digits).toFixed(state.decimals).toString())
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
  [types.UPDATE_NAME] (state, name) {
    state.name = name
  },
  [types.UPDATE_SYMBOL] (state, symbol) {
    state.symbol = symbol
  },
  [types.UPDATE_DECIMALS] (state, decimals) {
    state.decimals = decimals
  },
  [types.UPDATE_BALANCE] (state, balance) {
    state.balance = balance
  },
  [types.UPDATE_STATUS] (state, status) {
    state.status = status
  },
  [types.UPDATE_CONTRACT] (state) {
    state.ClubToken = contract(clubTokenArtifacts)
    state.ClubToken.setProvider(web3.currentProvider)
    // state.ClubToken.allEvents(function (error, log) {
    //   if (!error) console.log(log)
    // })
  },

  [types.TOGGLE_MINER] (state, bool) {
    state.mining = !!bool
  },
  [types.HASH_RATE] (state, rate) {
    state.hashRate = rate * state.miningPower
  },
  [types.MINE_INCREMENT] (state, increment) {
    if (!increment) return
    state.totalMined = state.totalMined + increment
  },
  [types.TIME_INCREMENT] (state, inc) {
    if (!inc) return
    state.mineTime = state.mineTime + parseInt(inc)
  },
  [types.CORE_COUNT] (state, count) {
    state.miningPower = count
  },

  [types.MINED_CLOVER] (state, clover) {
    state.cloversFound = state.cloversFound + 1
    state.minedClovers.unshift(clover)
    if (window.localstorage) {
      window.localStorage.setItem('cloversFound', JSON.stringify(state.cloversFound))
    }
  },
  [types.EXISTING_CLOVERS] (state, clovers) {
    state.minedClovers.push(...clovers)
  },
  [types.CLAIMED_CLOVER] (state, clover) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === clover.byteBoard)
    Vue.set(state.minedClovers[i], 'claimed', new Date())
  },
  [types.UPDATE_CLOVER_PRICE] (state, { clover, newVal }) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === clover.byteBoard)
    Vue.set(state.minedClovers[i], 'startPrice', newVal)
  },
  [types.REMOVE_MINED_CLOVER] (state, { byteBoard }) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    if (i > -1) state.minedClovers.splice(i, 1)
  },

  [types.STORED_CLOVERS] (state, clovers) {
    state.minedClovers = clovers
  },
  [types.STORED_COUNT] (state, total) {
    state.totalMined = total
  },
  [types.STORED_DURATION] (state, duration) {
    state.mineTime = duration
  },
  [types.STORED_CLOVERS_FOUND] (state, count) {
    if (count < state.minedClovers.length) {
      state.cloversFound = state.minedClovers.length
    }
    state.cloversFound = count
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
