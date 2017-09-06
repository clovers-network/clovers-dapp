export default {
  // this mutatation is called when the route changes
  ROUTE_CHANGED (state, { to, from }) {
    console.log('route changed from', from.name, 'to', to.name)
  },
  UPDATE_ACCOUNT (state, account) {
    state.account = account
  },
  UPDATE_ADDRESS (state, address) {
    state.address = address
  },
  UPDATE_AMOUNT (state, amount) {
    state.amount = amount
  },
  UPDATE_NAME (state, name) {
    state.name = name
  },
  UPDATE_SYMBOL (state, symbol) {
    state.symbol = symbol
  },
  UPDATE_DECIMALS (state, decimals) {
    state.decimals = decimals
  },
  UPDATE_BALANCE (state, balance) {
    state.balance = balance
  },
  UPDATE_STATUS (state, status) {
    state.status = status
  },
  UPDATE_CONTRACT (state, contract) {
    state.ClubToken = contract
  },
  TOGGLE_MINER (state, bool) {
    state.mining = !!bool
  },
  HASH_RATE (state, rate) {
    state.hashRate = rate * state.miningPower
  },
  MINE_INCREMENT (state, increment) {
    if (!increment) return
    state.totalMined = state.totalMined + increment
  },
  TIME_INCREMENT (state, inc) {
    if (!inc) return
    state.mineTime = state.mineTime + parseInt(inc)
  },
  CORE_COUNT (state, count) {
    state.miningPower = count
  },

  MINED_CLOVER (state, clover) {
    state.cloversFound = state.cloversFound + 1
    state.minedClovers.unshift(clover)
    if (window.localstorage) {
      window.localStorage.setItem(state.account + '_cloversFound', JSON.stringify(state.cloversFound))
    }
  },
  EXISTING_CLOVERS (state, clovers) {
    state.minedClovers.push(...clovers)
  },
  CLAIMED_CLOVER (state, byteBoard) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    Object.assign(state.minedClovers[i], { claimed: new Date() })
  },
  UPDATE_CLOVER_PRICE (state, { clover, newVal }) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === clover.byteBoard)
    Object.assign(state.minedClovers[i], {startPrice: newVal})
  },
  REMOVE_MINED_CLOVER (state, { byteBoard }) {
    let i = state.minedClovers.findIndex(cl => cl.byteBoard === byteBoard)
    if (i > -1) state.minedClovers.splice(i, 1)
  },

  STORED_CLOVERS (state, clovers) {
    state.minedClovers = clovers
  },
  STORED_COUNT (state, total) {
    state.totalMined = total
  },
  STORED_DURATION (state, duration) {
    state.mineTime = duration
  },
  STORED_CLOVERS_FOUND (state, count) {
    if (count < state.minedClovers.length) {
      state.cloversFound = state.minedClovers.length
    }
    state.cloversFound = count
  },
  ADD_REGISTERED_EVENT (state, event) {
    let rIndex = state.registeredEvents.findIndex((e) => e.transactionHash === event.transactionHash)
    if (rIndex < 0) state.registeredEvents.push(event)
  },
  ADD_REGISTERED_EVENTS (state, events) {
    state.registeredEvents = events
  }
}
