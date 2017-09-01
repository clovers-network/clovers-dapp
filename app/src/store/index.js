import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import * as types from './mutation-types'
import BN from 'bignumber.js'
import contract from 'truffle-contract'

// import artifacts
import cloverTokenArtifacts from '../../../build/contracts/CloverToken.json'

Vue.use(Vuex)
import Web3 from 'web3'
let web3 = window.web3
const debug = process.env.NODE_ENV !== 'production'

const rootState = {
  name: null,
  symbol: null,
  CloverToken: false,
  account: '',
  balance: '0',
  decimals: 0,
  amount: '',
  address: '',
  status: ''
}

const getters = {
  name: state => state.name,
  symbol: state => state.symbol,
  account: state => state.account,
  balance: state => state.balance,
  amount: state => state.amount,
  address: state => state.address,
  status: state => state.status
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
  registerGame ({commit, dispatch, state}, moves) {
    state.CloverToken.deployed().then((instance) => {
      console.log(moves)

      var first32Moves = moves.slice(0, (32 * 7))
      var lastMoves = moves.slice((32 * 7))

      console.log(new BN(first32Moves, 2).toString(16))
      console.log(new BN(lastMoves, 2).toString(16))
      // instance.showGameConstant.call(new BN(first32Moves, 2), new BN(lastMoves, 2)).then((l, a) => {
      instance.showGameDebug(new BN(first32Moves, 2), new BN(lastMoves, 2), { from: state.account }).then((l, a) => {
      // instance.registerBoard(new BN(first32Moves, 2), new BN(lastMoves, 2), { from: state.account }).then((a) => {
      //   if (!a) {
      // instance.registerBoard(movesArray, { from: state.account }).then((a, b) => {
        console.log(l)
        // a = l
        // // l.logs.map(foo => {
        // //   var a = foo.args
        // //   console.log(a)
        // //   var b = new BN(a.board)
        // var b = new BN(a[4])
        // var missing = 128 - b.toString(2).length
        // missing = new Array(missing)
        // missing = missing.fill('0')
        // // console.log(missing)
        // missing = missing.join('') + b.toString(2)
        // missing = missing.match(/.{1,2}/g).map((i) => i === '00' ? '0' : i === '01' ? '1' : '2').join('')
        // console.log(missing.match(/.{1,8}/g))
        // if (typeof a === 'object' && a.length > 2) {
        //   var board = new BN(a[3])
        //   console.log(board.toString(2))
        // }
        // })
      }).catch((err) => {
        console.log(err)
      })
      //   } else {
      //     commit(types.UPDATE_STATUS, 'That Game is already registered')
      //   }
      // })
    })
  },
  setWatchers ({commit, dispatch, state}) {
    console.log('set watchers')
    state.CloverToken.deployed().then((instance) => {
      instance.DebugUint({fromBlock: 0}).watch(function (error, result) {
        console.log('watched DebugUint:')
        if (error == null) {
          console.log(result)
        } else {
          console.error(error)
        }
      })

      instance.DebugByte({fromBlock: 0}).watch(function (error, result) {
        console.log('watched DebugByte:')
        if (error == null) {
          console.log(result)
        } else {
          console.error(error)
        }
      })

      instance.DebugGame({fromBlock: 0}).watch(function (error, result) {
        console.log('watched DebugGame:')
        if (error == null) {
          console.log(result)
        } else {
          console.error(error)
        }
      })
      // event.get((error, result) => {
      //   console.log('previous DebugGame:')
      //   if (error == null) {
      //     console.log(result)
      //   } else {
      //     console.error(error)
      //   }
      // })
      instance.DebugMove({fromBlock: 'latest'}).watch((error, result) => {
        console.log('watched DebugMove')
        if (error == null) {
          console.log(result)
        } else {
          console.error(error)
        }
      })
    })
  },
  helloWorld ({commit, dispatch, state}, name) {
    state.CloverToken.deployed().then((instance) => {
      instance.updateName(name, { from: state.account }).then((response) => {
        console.log(response)
        // commit(types.UPDATE_NAME, name)
      }).catch((err) => {
        console.log(err)
      })
    })
  },
  tryFunction ({commit, dispatch, state}, [arr, row, col]) {
    state.CloverToken.deployed().then((instance) => {
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
    if (!state.decimals) {
      state.CloverToken.deployed().then(instance => {
        instance.decimals.call().then((decimals) => {
          console.log('decimals', decimals)
          commit(types.UPDATE_DECIMALS, parseInt(decimals))
        }).catch((err) => {
          console.error(err)
        })
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
    state.CloverToken.deployed().then(instance => (
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
    state.CloverToken = contract(cloverTokenArtifacts)
    state.CloverToken.setProvider(web3.currentProvider)
    // state.CloverToken.allEvents(function (error, log) {
    //   if (!error) console.log(log)
    // })
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
