import Web3 from 'web3'
let web3 = window.web3
import contract from 'truffle-contract'

// import artifacts
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'

export default {
  connect ({commit, dispatch, state}) {
    if (web3) {
      // Use Mist/MetaMask's provider
      var web3Provider = web3.currentProvider
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d')
      // web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
      setTimeout(() => {
        dispatch('connect')
      }, 1000)
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
    commit('UPDATE_ACCOUNT', account)
    dispatch('setContract')
    dispatch('getBalance')
  },
  setContract ({commit, dispatch, state}) {
    // create contracts

    let c = contract(clubTokenArtifacts)
    c.setProvider(web3.currentProvider)
    commit('UPDATE_CONTRACT', c)
  },
  // action is dispatched when/if the account is updated
  // use this action to refresh the app with the new account's data
  updateAccount ({ commit, dispatch, state }, account) {
    if (account !== state.account) commit('UPDATE_ACCOUNT', account)
    dispatch('getBalance')
  },
  sendToken ({ commit, dispatch, state }) {
    commit('UPDATE_STATUS', 'Initiating transaction... (please wait)')
    state.ClubToken.deployed().then(instance => (
      instance.transfer(state.address, parseInt(state.amount, 10), { from: state.account })
    )).then(() => {
      dispatch('getBalance')
      commit('UPDATE_STATUS', 'Transaction complete!')
    }).catch((err) => {
      console.error(err)
      commit('UPDATE_STATUS', 'Error sending coin; see log.')
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
          if (name !== state.name) commit('UPDATE_NAME', name)
        })
        instance.symbol.call().then((symbol) => {
          if (symbol !== state.symbol) commit('UPDATE_SYMBOL', symbol)
        })
      }).catch((err) => {
        console.error(err)
        commit('UPDATE_STATUS', 'Error getting balance; see log.')
      })
    }
    state.ClubToken.deployed().then(instance => (
      instance.balanceOf.call(state.account)
    )).then((balance) => {
      if (balance.toNumber() !== state.balance) commit('UPDATE_BALANCE', balance.toNumber())
    }).catch((err) => {
      console.error(err)
      commit('UPDATE_STATUS', 'Error getting balance; see log.')
    })
  }
}
