import Vue from 'vue'
import BigNumber from 'bignumber.js'
import { formatClover } from '@/utils'

export default {
  UPDATE_WAIT_TO_PING (state, value) {
    state.waitToPing = value
  },
  SET_BASE_PRICE (state, basePrice) {
    state.basePrice = basePrice
  },
  SET_STAKE_AMOUNT (state, stakeAmount) {
    state.stakeAmount = stakeAmount
  },
  SET_QUERYING (state, bool) {
    state.querying = bool
  },
  SET_TRY_AGAIN (state, bool) {
    state.tryAgain = bool
  },
  SET_UNLOCKED (state, unlocked) {
    state.unlocked = unlocked
  },
  SET_ACCOUNT (state, account) {
    if (typeof account === 'string') {
      account = account.toLowerCase()
    }
    state.account = account
  },
  SET_NETWORK (state, networkId) {
    state.networkId = networkId
  },
  SUBMITTED_CLOVER (state, byteBoard) {
    state.submittingBoards.push(byteBoard)
  },
  SUBMITTED_CLOVER_DONE (state, byteBoard) {
    let boardKey = state.submittingBoards.findIndex(b => b === byteBoard)
    if (boardKey > -1) {
      state.submittingBoards.splice(boardKey, 1)
    } else {
      console.error('Board not found in submitting list', byteBoard)
    }
  },
  // this mutatation is called when the route changes
  ROUTE_CHANGED (state, { to, from }) {
    console.log('route changed from', from.name, 'to', to.name)
  },

  MINE_INCREMENT (state, increment) {
    if (!increment) return
    state.miningStats.totalMined =
      parseInt(state.miningStats.totalMined) + parseInt(increment)
    updateLocal('clover_pig_stats', state.miningStats)
  },
  TIME_INCREMENT (state, inc) {
    if (!inc) return
    state.miningStats.mineTime =
      parseInt(state.miningStats.mineTime) + parseInt(inc)
    updateLocal('clover_pig_stats', state.miningStats)
  },
  SYMMS_INCREMENT (state, inc) {
    if (!inc) return
    state.miningStats.symms++
    updateLocal('clover_pig_stats', state.miningStats)
  },
  RESET_MINE_STATS (state) {
    state.miningStats = { mineTime: 0, totalMined: 0, symms: 0 }
    updateLocal('clover_pig_stats', state.miningStats)
  },

  // mining/saving clovers. Stored clovers are added to state on load
  SAVE_CLOVER (state, clover) {
    const account = state.account || 'anon'
    if (!state.allSavedClovers[account]) {
      // make sure account key exists
      state.allSavedClovers = { ...state.allSavedClovers, [account]: [] }
    }
    state.allSavedClovers[account].unshift(clover)
    updateLocal('saved_clovers', state.allSavedClovers)
  },
  REMOVE_SAVED_CLOVER (state, { board }) {
    console.log('removing', board)
    const account = state.account || 'anon'
    const index = state.allSavedClovers[account].findIndex(
      c => c.board === board
    )
    if (index >= 0) {
      state.allSavedClovers[account].splice(index, 1)
      updateLocal('saved_clovers', state.allSavedClovers)
    }
  },
  MOVE_ANON_CLOVERS (state) {
    if (state.account && state.allSavedClovers.anon.length) {
      state.allSavedClovers = { [state.account]: [], ...state.allSavedClovers }
      state.allSavedClovers[state.account].push(
        ...state.allSavedClovers.anon.splice(0)
      )
      updateLocal('saved_clovers', state.allSavedClovers)
    }
  },

  SIGN_IN (state, { account, signature }) {
    state.tokens = { ...state.tokens, [account]: signature }
    updateLocal('clover_tokens', state.tokens)
  },
  SIGN_OUT (state) {
    if (!state.account) return
    Vue.delete(state.tokens, state.account)
    updateLocal('clover_tokens', state.tokens)
  },

  // marketplace
  NEW_CLOVER_FROM_CHAIN (state, clover) {
    // called when socket receives new clover
    clover.price = new BigNumber(clover.price)
    state.newClovers.unshift(clover)
  },
  SHOW_NEW_CLOVERS (state) {
    // move new chain clovers to feed
    let i = state.newClovers.length
    while (i--) {
      if (state.allClovers.findIndex(c => c.board === state.newClovers[i].board) > -1) {
        state.newClovers.splice(i, 1)
      }
    }
    state.allClovers.unshift(...state.newClovers.splice(0))
  },
  UPDATE_FEED_ORDER (state, sortBy) {
    state.sortBy = sortBy
  },
  UPDATE_FEED_FILTER (state, filter) {
    state.feedFilter = filter
  },

  UPDATE_CLOVER_PRICE (state, { byteBoard, newVal }) {
    // let i = state.allSavedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    // Object.assign(state.allSavedClovers[i], { startPrice: newVal })
  },
  STORED_CLOVERS (state, clovers) {
    // state.allSavedClovers = clovers
  },
  // UPDATE_ALLCLOVERS (state, allClovers) {
  //   state.allClovers = allClovers
  // },
  GOT_USERS (state, data) {
    state.allUsers = data
  },

  // clovers on chain
  GOT_CLOVERS (state, data) {
    state.allClovers = data.map(c => formatClover(c))
  },
  ADD_CLOVER (state, clover) {
    clover = formatClover(clover)
    let cloverIndex = state.allClovers.findIndex(v => v.board === clover.board)
    if (cloverIndex < 0) {
      // clover.price = new BigNumber(clover.price)
      state.allClovers.push(clover)
    } else {
      state.allClovers.splice(cloverIndex, 1, clover)
    }
  },
  UPDATE_CLOVER (state, clover) {
    let cloverKey = state.allClovers.findIndex(
      u => u.board.toLowerCase() === clover.board.toLowerCase()
    )
    if (cloverKey > -1) {
      state.allClovers.splice(cloverKey, 1, clover)
    }
  },

  UPDATE_USER (state, user) {
    let userKey = state.allUsers.findIndex(
      u => u.address.toLowerCase() === user.address.toLowerCase()
    )
    if (userKey > -1) {
      state.allUsers.splice(userKey, 1, user)
    } else {
      state.allUsers.push(user)
    }
  },

  UPDATE_LOGS (state, logs) {
    state.logs = logs
  },
  ADD_LOG (state, log) {
    state.logs.push(log)
  },
  // UPDATE_USERS (state, users) {
  //   state.users = users
  // },
  // STORED_COUNT (state, total) {
  //   state.totalMined = total
  // },
  // STORED_DURATION (state, duration) {
  //   state.mineTime = duration
  // },
  ADD_REGISTERED_EVENT (state, event) {
    let rIndex = state.registeredEvents.findIndex(
      e => e.transactionHash === event.transactionHash
    )
    if (rIndex < 0) state.registeredEvents.push(event)
  },
  ADD_REGISTERED_EVENTS (state, events) {
    state.registeredEvents.push(...events)
  },
  ADD_USERNAME_EVENT (state, event) {
    let rIndex = state.usernameEvents.findIndex(
      e => e.transactionHash === event.transactionHash
    )
    if (rIndex < 0) state.usernameEvents.push(event)
  },
  ADD_USERNAME_EVENTS (state, events) {
    state.usernameEvents.push(...events)
  },
  ADD_CLOVERNAME_EVENT (state, event) {
    let rIndex = state.clovernameEvents.findIndex(
      e => e.transactionHash === event.transactionHash
    )
    if (rIndex < 0) state.clovernameEvents.push(event)
  },
  ADD_CLOVERNAME_EVENTS (state, events) {
    state.clovernameEvents.push(...events)
  },
  ADD_MSG (state, msg) {
    state.messages.push(msg)
  },
  REMOVE_MSG (state, msgId) {
    let msgKey = state.messages.findIndex(m => m.id === msgId)
    if (msgKey < 0) return
    state.messages.splice(msgKey, 1)
  }
}

function updateLocal (key, value) {
  if (!window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}
