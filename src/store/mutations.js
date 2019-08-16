import Vue from 'vue'
import BigNumber from 'bignumber.js'
import { formatClover } from '@/utils'

export default {
  UPDATE_WEB3 (state, value) {
    state.web3Enabled = value
  },
  ADD_MINER (state, miner) {
    state.miners.push(miner)
  },
  REMOVE_MINER (state, minerIndex) {
    if (minerIndex > -1 && minerIndex < state.miners.length) {
      state.miners.splice(minerIndex, 1)
    } else {
      console.error('Miner not found in miners list', minerIndex)
    }
  },
  UPDATE_HASHRATE (state, hashrate) {
    state.hashrate = hashrate
    state.mined += hashrate
  },
  RESET_MINED (state) {
    state.mined = 0
  },
  SET_ENABLED (state, enabled) {
    state.enabled = enabled
  },
  SET_ETH_PRICE (state, price) {
    state.ethPrice = price
  },
  SET_CLUB_TOKEN_PRICE (state, price) {
    state.clubTokenPrice = price
  },
  SET_MARKET (state, market) {
    state.market = market
  },
  SET_ORDERS (state, orders) {
    state.orders = orders
    if (orders.length && orders[0].market === 'ClubToken') {
      state.clubTokenPrice = new BigNumber(orders[0].value)
        .div(new BigNumber(orders[0].tokens))
        .round()
        .toString(10)
    }
  },
  ADD_ORDER (state, order) {
    if (order.market === state.market) {
      state.orders.unshift(order)
    }
    if (order.market === 'ClubToken') {
      state.clubTokenPrice = new BigNumber(order.value)
        .div(new BigNumber(order.tokens))
        .round()
        .toString(10)
    }
  },
  CONTRACTS_DEPLOYED (state, value) {
    state.contractsDeployed = value
  },
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
  SYMMS_INCREMENT (state, inc) {
    if (!inc) return
    state.miningStats.symms++
    updateLocal('clover_pig_stats', state.miningStats)
  },
  RESET_MINE_STATS (state) {
    state.miningStats = { mineTime: 0, totalMined: 0, symms: 0 }
    updateLocal('clover_pig_stats', state.miningStats)
  },
  CLEAR_NEW_SYMS (state) {
    state.newSyms = []
  },
  SAVE_NEW_SYM (state, clover) {
    state.newSyms.unshift(clover)
  },
  // mining/saving clovers. Stored clovers are added to state on load
  SAVE_CLOVER (state, clover) {
    const index = state.allSavedClovers.findIndex(c => c.board === clover.board)
    if (index > -1) {
      state.allSavedClovers.splice(index, 1)
      updateLocal('saved_clovers', state.allSavedClovers)
    } else {
      state.allSavedClovers.unshift(clover)
      updateLocal('saved_clovers', state.allSavedClovers)
    }
  },
  REMOVE_SAVED_CLOVER (state, { board }) {
    const index = state.allSavedClovers.findIndex(c => c.board === board)
    if (index >= 0) {
      state.allSavedClovers.splice(index, 1)
      updateLocal('saved_clovers', state.allSavedClovers)
    }
  },
  REMOVE_ALL_SAVED_CLOVERS (state) {
    state.allSavedClovers = []
    updateLocal('saved_clovers', state.allSavedClovers)
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
    state.account = null
    Vue.delete(state.tokens, state.account)
    updateLocal('clover_tokens', state.tokens)
  },

  // marketplace
  NEW_CLOVER_FROM_CHAIN (state, clover) {
    // called when socket receives new clover
    clover.price = new BigNumber(clover.price)
    state.newClovers.unshift(clover)
  },
  CLEAR_NEW_CLOVERS (state) {
    state.newClovers = []
  },
  UPDATE_FEED_ORDER (state, sortBy) {
    state.sortBy = sortBy
  },
  UPDATE_FEED_FILTER (state, filter) {
    state.feedFilter = filter
  },

  SET_ALL_ALBUMS (state, albums) {
    state.allAlbums = albums
  },

  SET_CURRENT_ALBUM (state, album) {
    let index = state.allAlbums.findIndex(a => a.id === album.id)
    if (index > 0) {
      state.allAlbums.splice(index, 1, album)
    }
    state.currentAlbum = album
  },

  SET_CURRENT_CLOVER (state, clover) {
    state.currentClover = formatClover(clover)
  },

  SET_USER (state, data) {
    if (typeof data.name !== 'undefined') {
      state.accountData = data
    }
  },
  SET_OTHER_USER (state, data) {
    state.otherUser = data
  },

  SET_PAGED_CLOVERS (state, page) {
    state.pagedClovers = page
  },

  ADD_CLOVER (state, clover) {
    const { board } = clover
    const cb = state.currentClover.board && state.currentClover.board.toLowerCase()
    if (cb === board.toLowerCase()) {
      state.currentClover = {
        ...state.currentClover,
        ...formatClover(clover)
      }
    }
    if (!state.pagedClovers.results) return
    let inPage = state.pagedClovers.results.findIndex(c => c.board === board)
    if (inPage > -1) {
      state.pagedClovers.results.splice(inPage, 1, clover)
    }
  },

  UPDATE_USER (state, user) {
    if (state.account === user.address) {
      state.accountData = user
    } else if (state.otherUser && state.otherUser.address === user.address) {
      state.otherUser = user
    }
  },

  ADD_LOG (state, log) {
    state.logs.unshift(log)
  },
  CLEAR_LOG (state, log) {
    state.logs = []
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
  },

  // ALBUMS
  SET_PAGED_ALBUMS (state, page) {
    state.pagedAlbums = page
  }
}

function updateLocal (key, value) {
  if (!window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}
