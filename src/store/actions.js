import io from 'socket.io-client'

import * as contracts from 'clovers-contracts'
import axios from 'axios'

const apiBase = process.env.VUE_APP_API_URL
const signingParams = [
  {
    type: 'string',
    name: 'Message',
    value: 'To avoid bad things, sign below to authenticate with Clovers'
  }
]

export default {
  // web3 stuff
  async begin ({ commit, dispatch }) {
    console.log('begin')
    try {
      dispatch('poll')
    } catch (error) {
      console.log('begin failed')
      console.error(error)
    }
  },
  async reset ({ state, commit, dispatch }) {
    if (state.querying) {
      commit('setTryAgain', true)
      return
    }
    console.log('reset')
    commit('setQuerying', true)
    try {
      dispatch('getContracts')
      commit('setQuerying', false)
      if (state.tryAgain) {
        commit('setTryAgain', false)
        dispatch('reset')
      }
    } catch (error) {
      console.log('begin failed')
      console.error(error)
    }
  },
  async poll ({ state, commit, dispatch }) {
    try {
      let networkId = parseInt(state.networkId) + 0
      await dispatch('getNetwork')
      if (networkId !== state.networkId) dispatch('reset')
      await dispatch('getAccount')
      setTimeout(() => {
        dispatch('poll')
      }, 3000)
    } catch (error) {
      console.error(error)
      let title, body
      let poll = true
      switch (error.message) {
        case 'User denied transaction signature.':
          title = 'Error Connecting To The Network'
          body = `Looks like you aren't connected to the Ethereum Network.
            The popup you just dismissed is a free wallet service called
            <a target='_blank' href='https://portis.io/'>Portis</a> that you
            can use by refreshing the page. If you'd like to hear about other
            wallet options including <a target='_blank' href='https://metamask.io/'>
            Metamask</a> and <a target='_blank' href='https://www.uport.me/'>
            uPort</a> please check out our help section.`
          poll = false
          break
        case 'account-locked':
          title = 'Wallet is Locked'
          body = `Looks like your wallet is locked. Please unlock it if you'd like to
             interact with the contracts. If you'd like more information about
             this error, please see out help page.`
          break
        default:
          title = 'Error Connecting To The Network'
          body = error.message
      }
      console.log({ title, body })
      if (poll) {
        setTimeout(() => {
          dispatch('poll')
        }, 3000)
      } else {
        // user deined portis popup...
      }
    }
  },
  async getNetwork ({ commit, state }) {
    const networkId = await global.web3.eth.net.getId()
    if (state.networkId !== networkId) {
      commit('setNetwork', networkId)
    }
  },
  async getAccount ({ commit, state }) {
    let accounts = await global.web3.eth.getAccounts()
    if (accounts.length && state.account !== accounts[0]) {
      commit('setUnlocked', true)
      commit('setAccount', accounts[0])
    } else if (!accounts.length && (state.account || state.unlocked)) {
      commit('setUnlocked', false)
      commit('setAccount', null)
      return new Error('account-locked')
    }
  },
  getContracts ({ state, commit }) {
    for (var name in contracts) {
      if (!contracts.hasOwnProperty(name)) return
      let contract = contracts[name]
      if (contract.networks[state.networkId]) {
        contract.instance = new global.web3.eth.Contract(
          contract.abi,
          contract.networks[state.networkId].address
        )
      } else {
        new Error('No contract on that network')
      }
    }
  },

  // api stuff
  setUpSocket ({ commit }) {
    const socket = io(process.env.VUE_APP_API_URL)
    socket.on('disconnect', () => {
      console.log('disconnected')
    })
    socket.on('newUser', user => {
      commit('ADD_USER', user)
      console.log(user)
    })
    socket.on('updateUser', user => {
      commit('UPDATE_USER', user)
      console.log(user)
    })
    socket.on('newClover', clover => {
      commit('NEW_CLOVER_FROM_CHAIN', clover)
    })
    socket.on('updateClover', clover => {
      commit('UPDATE_CLOVER', clover)
      console.log(clover)
    })
  },

  // logs
  selfDestructMsg ({ commit }, msg) {
    let msgId = commit('ADD_MSG', msg)
    setTimeout(() => {
      commit('REMOVE_MSG', msgId)
    }, 7000)
  },
  addMessage ({ commit }, msg) {
    let msgId = Date.now()
    msg.id = msgId
    commit('ADD_MSG', msg)
    return msg.id
  },
  cloverExists ({ state }, byteBoard) {
    console.log(byteBoard)
    return state.allClovers.findIndex(c => c.board === byteBoard) > -1
  },
  getClovers ({ state, commit }, page = 1) {
    let cloverCount = state.allClovers.length
    let params = { page }
    if (!cloverCount) {
      // all prev, up to end of requested page
      params.all = true
    } else {
      // can just get next page (offset in case of new)
      params.before = state.allClovers[cloverCount - 1].modified
    }
    return axios
      .get(apiUrl('/clovers'), { params })
      .then(({ data }) => {
        commit('GOT_CLOVERS', data)
      })
      .catch(console.log)
  },

  signIn ({ state, commit }) {
    const { account } = state
    if (!account) return
    global.web3.currentProvider.sendAsync(
      {
        method: 'eth_signTypedData',
        params: [signingParams, account],
        from: account
      },
      (err, { result }) => {
        console.log(err, result)
        commit('SIGN_IN', { account, signature: result })
      }
    )
  },

  updateCloverName ({ getters, commit }, clover) {
    const { board, name } = clover
    // if (!getters.authHeader) alert('Not signed in, this won\'t work')
    return axios
      .put(
        apiUrl(`/clovers/${board}`),
        { name },
        {
          headers: {
            Authorization: getters.authHeader
          }
        }
      )
      .then(({ data }) => {
        console.log(data)
      })
      .catch(console.log)
  }
}

function apiUrl (path) {
  return apiBase + path
}
