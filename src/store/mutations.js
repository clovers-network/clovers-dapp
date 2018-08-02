export default {
  SUBMITTED_CLOVER (state, byteBoard) {
    state.submittingBoards.push(byteBoard)
  },
  SUBMITTED_CLOVER_DONE (state, byteBoard) {
    let boardKey = state.submittingBoards.findIndex((b) => b === byteBoard)
    if (boardKey > -1) {
      state.submittingBoards.splice(boardKey, 1)
    } else {
      console.error('Board not found in submitting list', byteBoard)
    }
  },
  NOT_RINKEBY (state) {
    state.notRinkeby = true
  },
  // this mutatation is called when the route changes
  ROUTE_CHANGED (state, { to, from }) {
    console.log('route changed from', from.name, 'to', to.name)
  },
  TOGGLE_MINER (state, bool) {
    state.mining = !!bool
  },
  HASH_RATE (state, rate) {
    state.hashRate = rate * state.miningPower
  },
  MINE_INCREMENT (state, increment) {
    if (!increment) return
    state.totalMined = parseInt(state.totalMined) + parseInt(increment)
  },
  TIME_INCREMENT (state, inc) {
    if (!inc) return
    state.mineTime = parseInt(state.mineTime) + parseInt(inc)

  },
  CORE_COUNT (state, count) {
    state.miningPower = count
  },

  MINED_CLOVER (state, clover) {
    state.cloversFound = parseInt(state.cloversFound) + 1
    state.allMinedClovers.unshift(clover)
    if (window.localstorage) {
      window.localStorage.setItem(state.account + '_cloversFound', JSON.stringify(state.cloversFound))
    }
  },
  EXISTING_CLOVERS (state, clovers) {
    state.allMinedClovers.push(...clovers)
  },
  CLAIMED_CLOVER (state, byteBoard) {
    console.log(byteBoard)
    // let i = state.allMinedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    // // Object.assign(state.allMinedClovers[i], { claimed: new Date() })
    // let clover = state.allMinedClovers[i]
    // clover.claimed = new Date()
    // state.allMinedClovers.splice(i, 1, clover)
    // if (window.localstorage) {
    //   window.localStorage.setItem(state.account + '_clovers', JSON.stringify(state.allMinedClovers))
    // }
  },
  UPDATE_CLOVER_PRICE (state, { byteBoard, newVal }) {
    let i = state.allMinedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    Object.assign(state.allMinedClovers[i], {startPrice: newVal})
  },
  REMOVE_MINED_CLOVER (state, { byteBoard }) {
    let i = state.allMinedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    if (i > -1) state.allMinedClovers.splice(i, 1)
  },
  UPDATE_ACCOUNT (state, account) {
    state.account = account
  },
  UPDATE_NETWORK_ID (state, network) {
    state.network = network
  },
  UPDATE_CURRENT_BLOCK (state, blockNumber) {
    state.currentBlock = blockNumber
  },
  UPDATE_READONLY (state, readOnly) {
    state.readOnly = readOnly
  },
  UPDATE_BALANCE (state, balance) {
    state.balance = parseInt(balance)
  },
  STORED_CLOVERS (state, clovers) {
    state.allMinedClovers = clovers
  },
  // UPDATE_ALLCLOVERS (state, allClovers) {
  //   state.allClovers = allClovers
  // },
  GOT_CLOVERS (state, data) {
    data.forEach((obj) => {
      if (!state.allClovers.find(v => v.board === obj.board)) {
        state.allClovers.push(obj)
      }
    })
  },
  UPDATE_LOGS (state, logs) {
    state.logs = logs
  },
  ADD_LOG (state, log) {
    state.logs.push(log)
  },
  ADD_USER (state, user) {
    state.users.push(user)
  },
  UPDATE_USER (state, user) {
    let userKey = state.users.findIndex((u) => u.address.toLowerCase() === user.address.toLowerCase())
    if (userKey > -1) {
      state.users.splice(userKey, 1, user)
    }
  },
  ADD_CLOVER (state, clover) {
    state.allClovers.push(clover)
  },
  UPDATE_CLOVER (state, clover) {
    let cloverKey = state.allClovers.findIndex((u) => u.board.toLowerCase() === clover.board.toLowerCase())
    if (cloverKey > -1) {
      state.allClovers.splice(cloverKey, 1, clover)
    }
  },
  UPDATE_USERS (state, users) {
    state.users = users
  },
  STORED_COUNT (state, total) {
    state.totalMined = total
  },
  STORED_DURATION (state, duration) {
    state.mineTime = duration
  },
  STORED_CLOVERS_FOUND (state, count) {
    count = parseInt(count)
    if (count < state.allMinedClovers.length) {
      state.cloversFound = state.allMinedClovers.length
    }
    state.cloversFound = count
  },
  ADD_REGISTERED_EVENT (state, event) {
    let rIndex = state.registeredEvents.findIndex((e) => e.transactionHash === event.transactionHash)
    if (rIndex < 0) state.registeredEvents.push(event)
  },
  ADD_REGISTERED_EVENTS (state, events) {
    state.registeredEvents.push(...events)
  },
  ADD_USERNAME_EVENT (state, event) {
    let rIndex = state.usernameEvents.findIndex((e) => e.transactionHash === event.transactionHash)
    if (rIndex < 0) state.usernameEvents.push(event)
  },
  ADD_USERNAME_EVENTS (state, events) {
    state.usernameEvents.push(...events)
  },
  ADD_CLOVERNAME_EVENT (state, event) {
    let rIndex = state.clovernameEvents.findIndex((e) => e.transactionHash === event.transactionHash)
    if (rIndex < 0) state.clovernameEvents.push(event)
  },
  ADD_CLOVERNAME_EVENTS (state, events) {
    state.clovernameEvents.push(...events)
  },
  ADD_MSG (state, msg) {
    state.messages.push(msg)
  },
  REMOVE_MSG (state, msgId) {
    let msgKey = state.messages.findIndex((m) => m.id === msgId)
    if (msgKey < 0) return
    state.messages.splice(msgKey, 1)
  }
}
