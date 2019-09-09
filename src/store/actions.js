import * as contracts from 'clovers-contracts'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import Decimal from 'decimal.js'
import io from 'socket.io-client'
import utils from 'web3-utils'
import axios from 'axios'
import { pad0x, makeBn, padRight, isHex, cloverIsMonochrome } from '@/utils'
import CloverWorker from 'worker-loader!../assets/clover-worker'
import confetti from 'canvas-confetti'

window.contracts = contracts

const msgParams = [
  {
    type: 'string',
    name: 'Message',
    value: 'Please sign this message to authenticate with Clovers - '
  }
]
const networks = {
  4: 'rinkeby',
  5777: 'ganache',
  1: 'mainnet'
}
const anonUser = {
  address: null,
  name: 'anon',
  clovers: [],
  modified: null
}

let miner

export default {

  mine ({ dispatch, commit, state }) {
    if (state.miners.length === 0) {
      commit('RESET_MINED')
    }
    commit('CLEAR_NEW_SYMS')
    miner = new CloverWorker()
    const dispatchMinerEvent = async (event) => {
      let { data } = event
      if ('hashRate' in data) {
        commit('UPDATE_HASHRATE', data.hashRate)
      }
      if ('symmetrical' in data) {
        try {
          const exists = await dispatch('cloverExists', '0x' + data.byteBoard)
          const isMono = cloverIsMonochrome(data)
          if (!exists && !isMono) {
            const clvr = await dispatch('formatFoundClover', data)
            dispatch('newSymFound')
            commit('SAVE_NEW_SYM', clvr)
            commit('SAVE_CLOVER', clvr)
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    miner.onmessage = dispatchMinerEvent
    miner.postMessage('start')
    commit('ADD_MINER', miner)
  },
  stop ({ state, commit }) {
    if (state.miners.length) {
      let last = state.miners.length - 1
      let removed = state.miners[last]
      removed.postMessage('stop')
      commit('REMOVE_MINER', last)
    }
    if (!state.miners.length) {
      commit('UPDATE_HASHRATE', 0)
    }
  },
  stopAll ({ state, dispatch }) {
    dispatch('stop')
    while (state.miners.length > 0) {
      dispatch('stop')
    }
  },
  newSymFound ({ dispatch }) {
    // alert
    setTimeout(() => {
      dispatch('selfDestructMsg', { type: 'success', msg: 'New symmetrical clover found!', link: { name: 'Picks' } })
    }, 1000)
    // confetti:
    const end = Date.now() + (1 * 1000)
    const colors = ['#01B463', '#FF4136', '#FFDC00', '#0074D9']; // go Buckeyes!
    (function frame () {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: {
          x: 0
        },
        colors: colors
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: {
          x: 1
        },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }())
  },
  async poll ({ state, dispatch, commit }) {
    if (state.web3Enabled) {
      await dispatch('checkWeb3')
      setTimeout(() => {
        dispatch('poll')
      }, 5000)
    }
  },
  async pollEthPrice ({ commit, dispatch }) {
    let priceResp = await axios.get(
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
    )
    if (priceResp.status === 200) {
      commit('SET_ETH_PRICE', priceResp.data.USD)
    }
    let priceGasResp = await axios.get(
      'https://ethgasstation.info/json/ethgasAPI.json'
    )
    if (priceGasResp.status === 200) {
      commit('SET_GAS_PRICE', priceGasResp.data.fast / 10)
    }
    setTimeout(() => {
      dispatch('pollEthPrice')
    }, 60 * 1000 * 5)
  },
  // web3 stuff
  async checkWeb3 ({ state, dispatch, commit }) {
    console.log('checkWeb3')
    if (!state.web3Enabled) {
      dispatch('signIn')
      return
    }
    try {
      await dispatch('approve')
      await dispatch('getAccount')
      return true
    } catch (error) {
      commit('UPDATE_WEB3', false)
      await dispatch('handleWeb3Error', error)
      return false
    }
  },
  async approve ({ state, commit }) {
    console.log('approve')
    if (!state.enabled && global.ethereum) {
      try {
        await global.ethereum.enable()
        commit('SET_ENABLED', true)
      } catch (error) {
        console.error(error)
      }
    }
  },
  async handleWeb3Error ({ state, dispatch }, error) {
    console.error(error)
    let title, body
    switch (error.message) {
      case 'User denied transaction signature.':
        title = 'Error Connecting To The Network'
        body = `Looks like you aren't connected to the Ethereum Network.
          The popup you just dismissed is a free wallet service called
          <a target='_blank' href='https://portis.io/'>Portis</a> that
          will pop up unless you have a wallet like <u><a target='_blank' href='https://metamask.io/'>
          Metamask</a></u>, <u><a target="_blank" href="https://status.im/">Status</a></u>, <u><a href="https://wallet.coinbase.com/" target="_blank">Coinbase Wallet</a></u> or  <u><a target='_blank' href='https://www.uport.me/'>
          uPort</a></u> already installed.`
        break
      case 'account-locked':
        title = 'Wallet is Locked'
        body = `Looks like your wallet is locked. Please unlock it if you'd like to
             interact with the contracts. If you'd like more information about
             this error, please see out help page.`
        break
      case 'wrong-network':
        title = 'Wrong Network'
        body = `Looks like you're connected to the wrong network. Please switch to
        Network ${
  networks[state.correctNetwork]
} to interact with the blockchain.`
        break
      default:
        title = 'Error Connecting To The Network'
        body = error.message
    }
    dispatch('addMessage', {
      type: 'info',
      title,
      msg: body
    })
  },
  async getNetwork ({ commit, state, dispatch }) {
    console.log('getNetwork')
    try {
      const networkId = await global.web3.eth.net.getId()
      if (state.networkId !== networkId) {
        commit('SET_NETWORK', networkId)
        await dispatch('getContracts')
      }
    } catch (error) {
      console.log(error)
    }
  },
  async getAccount ({ commit, dispatch, state }) {
    console.log('getAccount')
    await dispatch('getNetwork')
    let accounts = await global.web3.eth.getAccounts()
    if (accounts.length && state.account !== accounts[0].toLowerCase()) {
      commit('SET_UNLOCKED', true)
      commit('SET_ACCOUNT', accounts[0])
    } else if (!accounts.length && (state.account || state.unlocked)) {
      commit('SET_UNLOCKED', false)
      commit('SET_ACCOUNT', null)
      throw new Error('account-locked')
    }
    // commit('UPDATE_WAIT_TO_PING', true)
  },
  async contractsDeployed ({ state }) {
    return new Promise((resolve, reject) => {
      function tryDeploy () {
        if (state.contractsDeployed) {
          resolve()
        } else {
          setTimeout(tryDeploy, 500)
        }
      }
      tryDeploy()
    })
  },
  async getContracts ({ dispatch, state, commit }) {
    console.log('getContracts')
    commit('CONTRACTS_DEPLOYED', false)
    for (var name in contracts) {
      if (!contracts.hasOwnProperty(name)) continue
      let contract = contracts[name]
      if (contract.networks[state.networkId]) {
        contract.instance = new global.web3.eth.Contract(
          contract.abi,
          contract.networks[state.networkId].address
        )
      } else {
        throw new Error('wrong-network')
      }
    }

    await dispatch('updateBasePrice')
    await dispatch('updateStakeAmount')
    commit('CONTRACTS_DEPLOYED', true)
  },
  async updateBasePrice ({ commit }) {
    let basePrice = await contracts.CloversController.instance.methods
      .basePrice()
      .call()
    commit('SET_BASE_PRICE', basePrice)
  },
  async updateStakeAmount ({ commit }) {
    let stakeAmount = await contracts.CloversController.instance.methods
      .stakeAmount()
      .call()
    commit('SET_STAKE_AMOUNT', stakeAmount)
  },
  clearOrders ({ commit }) {
    commit('SET_ORDERS', [])
  },
  getOrders ({ commit, getters }, market = 'ClubToken') {
    axios.get(getters.baseURL(`/orders/${market}`)).then(({ data }) => {
      commit('SET_MARKET', market)
      commit('SET_ORDERS', data)
      return data
    })
  },
  // async updateUserENS ({ commit }, user) {
  //   let ensName = await global.ens
  //     .reverse(user.address)
  //     .name()
  //     .catch(e => {})
  //   user.ens = ensName === undefined ? false : ensName
  //   commit('UPDATE_USER', user)
  // },

  async getUsers ({ getters, commit }, { filters = {} }) {
    return axios.get(getters.baseURL('/users'), {
      params: { ...filters }
    }).then(({ data }) => commit('SET_PAGED_USERS', data))
      .catch((err) => {
        if (err.response && err.response.data) {
          commit('SET_PAGED_USERS', err.response.data)
        }
      })
  },

  async changeUsername ({ commit, getters, dispatch }, { address, name, image }) {
    if (!address) return
    return axios
      .put(
        getters.baseURL(`/users/${address}`),
        { name, image },
        {
          headers: {
            Authorization: getters.authHeader
          }
        }
      )
      .then(({ data }) => {
        commit('UPDATE_USER', data)
        dispatch('selfDestructMsg', {
          type: 'success',
          msg: 'User details updated'
        })
      })
      .catch(err => {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
        if ('response' in err) {
          console.log({err})
          if (err.response && err.response.status === 401) {
            commit('SIGN_OUT')
          } else {
            console.error(err.message)
          }
        }
      })
  },
  async getReward ({ dispatch }, _symmetries) {
    await dispatch('getNetwork')
    let val = await contracts.CloversController.instance.methods
      .calculateReward('0x' + _symmetries.toString(16))
      .call()
    return val
  },

  // api stuff
  async setUpSocket ({ commit, getters }) {
    const socket = io(getters.apiBase)

    socket.on('connect', () => {
      console.log('connected')
    })
    socket.on('welcome', () => {
      console.log('someone joined!')
    })
    socket.on('disconnect', () => {
      console.log('disconnected')
    })
    socket.on('updateUser', (user) => {
      console.log('new user info')
      commit('UPDATE_USER', user)
    })
    socket.on('addClover', (clover) => {
      console.log('new clover added')
      commit('NEW_CLOVER_FROM_CHAIN', clover)
    })
    socket.on('updateClover', (clover) => {
      console.log('new clover info')
      commit('ADD_CLOVER', clover)
    })
    socket.on('addOrder', (order) => {
      console.log('new order info')
      commit('ADD_ORDER', order)
    })
    // from table('logs')
    // comments and renaming
    socket.on('newLog', (log) => {
      console.log('new log entry')
      commit('ADD_LOG', log)
    })
  },

  // logs
  selfDestructMsg ({ commit, dispatch }, msg) {
    return dispatch('addMessage', msg)
    // let msgId = commit('ADD_MSG', msg)
    // setTimeout(() => {
    //   commit('REMOVE_MSG', msgId)
    // }, 3000)
  },
  addMessage ({ commit }, msg) {
    let msgId = Date.now()
    msg.id = msgId
    commit('ADD_MSG', msg)
    if (msg.type === 'success') {
      setTimeout(() => {
        commit('REMOVE_MSG', msgId)
      }, 5000)
    }
    return msg.id
  },
  async cloverExists ({getters}, byteBoard) {
    // let exists = await contracts.Clovers.instance.methods.exists(byteBoard).call()
    return axios.get(getters.baseURL(`/clovers/${byteBoard}`)).then(() => true).catch(() => false)
  },

  getCurrentUser ({ getters, commit }, account) {
    // empty / sign-out:
    if (!account) return commit('SET_USER', null)
    return axios.get(getters.baseURL(`/users/${account.toLowerCase()}`))
      .then(({ data }) => commit('SET_USER', data))
  },
  getUser ({ commit, getters }, account) {
    if (!account) return
    return axios.get(getters.baseURL(`/users/${account.toLowerCase()}`))
      .then(({ data }) => commit('SET_OTHER_USER', data))
  },

  getPagedClovers ({ commit }, { url, filters = {} }) {
    return axios.get(url, {
      params: { ...filters }
    }).then(({ data }) => commit('SET_PAGED_CLOVERS', data))
      .catch((err) => {
        if (err.response && err.response.data) {
          commit('SET_PAGED_CLOVERS', err.response.data)
        }
      })
  },

  getClover ({ commit, getters }, board) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.get(getters.baseURL('/clovers/' + board))
      .then(({ data }) => {
        if (!data) throw new Error('404')
        commit('SET_CURRENT_CLOVER', data)
      }).catch(console.error)
  },

  getComments ({getters}, { board, params }) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.get(getters.baseURL(`/chats/${board}`), { params })
  },
  addComment ({ getters }, { board, comment }) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.post(getters.baseURL(`/chats/${board}`), { comment }, {
      headers: {
        Authorization: getters.authHeader
      }
    })
      .catch(console.error)
  },
  flagOrDeleteComment ({ getters }, id) {
    return axios.delete(getters.baseURL(`/chats/${id}`), {
      headers: {
        Authorization: getters.authHeader
      }
    }).catch(console.error)
  },

  formatFoundClover (_, clover) {
    return {
      board: pad0x(clover.byteBoard),
      movesString: clover.movesString,
      symmetrical: clover.symmetrical,
      X0Sym: clover.X0Sym,
      XYSym: clover.XYSym,
      XnYSym: clover.XnYSym,
      Y0Sym: clover.Y0Sym,
      RotSym: clover.RotSym,
      createdAt: new Date()
    }
  },
  signInOut ({ getters, dispatch }) {
    if (!getters.authHeader) {
      dispatch('signIn')
    } else {
      dispatch('signOut')
    }
  },
  signOut ({ commit, dispatch }) {
    commit('SIGN_OUT')
    commit('UPDATE_WEB3', false)
    dispatch('selfDestructMsg', {
      type: 'success',
      msg: 'Succesfully signed out'
    })
  },
  async experimentalSignIn ({ state, commit, dispatch }) {
    if (!state.web3Enabled) {
      global.web3Connect.toggleModal() // open modal on button click
    } else {
      if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
      const { account } = state
      if (!account) {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: 'No ETH account to sign in with'
        })
        commit('UPDATE_WEB3', false)
        return
      }

      if (state.tokens && account in state.tokens && state.tokens[account]) {
        console.log('already have token')
        return
      }

      var now = new Date()
      var signingParams = JSON.parse(JSON.stringify(msgParams))
      var thisMonth = (now.getMonth() + 1) + '/' + now.getFullYear()
      signingParams[0].value += thisMonth

      global.web3.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData_v3',
          params: [account, JSON.stringify(signingParams)],
          from: account
        },
        (err, { error, result }) => {
          if (error || err) {
            return dispatch('oldSignIn', account)
          } else {
            dispatch('selfDestructMsg', {
              type: 'success',
              msg: 'Successfully signed in'
            })
            commit('SIGN_IN', { account, signature: result })
          }
        }
      )
    }
  },
  async signIn ({state, dispatch, commit}, account) {
    if (!state.web3Enabled) {
      global.web3Connect.toggleModal() // open modal on button click
    } else {
      return new Promise(async (resolve, reject) => {
        if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
        const { account } = state
        if (!account) {
          dispatch('selfDestructMsg', {
            type: 'error',
            msg: 'No ETH account to sign in with'
          })
          commit('UPDATE_WEB3', false)
          return
        }

        if (state.tokens && account in state.tokens && state.tokens[account]) {
          console.log('already have token')
          return
        }

        var now = new Date()
        var signingParams = JSON.parse(JSON.stringify(msgParams))
        var thisMonth = (now.getMonth() + 1) + '/' + now.getFullYear()
        signingParams[0].value += thisMonth

        var msg = global.web3.utils.utf8ToHex(signingParams[0].value)
        var params = [msg, account]
        try {
          global.web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            id: state.networkId || 1,
            method: 'personal_sign',
            params
          }, (err, signature) => {
            if (err) {
              console.log(err)
              commit('UPDATE_WEB3', false)
              dispatch('selfDestructMsg', {
                type: 'error',
                msg: `Could not sign in`
              })
              reject(err)
            } else {
              dispatch('selfDestructMsg', {
                type: 'success',
                msg: `Successfully signed in`
              })
              commit('SIGN_IN', { account, signature: signature.result })
              resolve()
            }
          })
        } catch (error) {
          console.log(error)
          commit('UPDATE_WEB3', false)
          dispatch('selfDestructMsg', {
            type: 'error',
            msg: `Could not sign in`
          })
          reject(error)
        }
      })
    }
  },
  updateCloverName ({ getters, commit, dispatch }, clover) {
    const { board, name } = clover
    // if (!getters.authHeader) alert('Not signed in, this won\'t work')
    return axios
      .put(
        getters.baseURL(`/clovers/${board}`),
        { name },
        {
          headers: {
            Authorization: getters.authHeader
          }
        }
      )
      .then(({ data }) => {
        dispatch('selfDestructMsg', {
          type: 'success',
          msg: 'Clover name updated'
        })
      })
      .catch(err => {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
      })
  },
  async getClubTokenPrice ({ commit, dispatch }) {
    await dispatch('contractsDeployed')
    const clubTokenPrice = await dispatch('getBuy', {
      market: 'ClubToken',
      amount: '1'
    })
    commit('SET_CLUB_TOKEN_PRICE', clubTokenPrice)
  },
  // Contract Interactions
  async getBuy ({ dispatch }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) return 0
    await dispatch('contractsDeployed')
    amount = utils.toWei(amount)
    let args = [amount]
    if (market !== 'ClubToken') args.unshift(market)
    const marketContract =
      market === 'ClubToken' ? 'ClubTokenController' : 'CurationMarket'
    return contracts[marketContract].instance.methods.getBuy(...args).call()
  },
  async getSell ({ dispatch, state }, { market, amount, clover }) {
    await dispatch('contractsDeployed')
    if (!Number(amount) || Number(amount) < 0) return 0
    amount = utils.toWei(amount)
    let args = [amount]
    if (market !== 'ClubToken') args.unshift(market)
    const marketContract =
      market === 'ClubToken' ? 'ClubTokenController' : 'CurationMarket'

    return contracts[marketContract].instance.methods.getSell(...args).call()
  },
  async invest ({ state, getters, dispatch }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) throw new Error('Invalid amount')
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
    amount = utils.toWei(amount)
    const marketContract =
      market === 'ClubToken' ? 'ClubTokenController' : 'CurationMarket'

    if (marketContract === 'ClubTokenController') {
      let balance = await global.web3.eth.getBalance(state.account)
      balance = new BigNumber(balance)
      if (balance.gte(amount)) {
        return contracts.ClubTokenController.instance.methods
          .buy(state.account)
          .send({
            from: state.account,
            value: amount
          })
      } else {
        throw new Error('insufficient-funds')
      }
    } else {
      let balance = await contracts.ClubToken.instance.methods
        .balanceOf(state.account)
        .call()
      balance = new BigNumber(balance)
      let value = '0'
      if (balance.lt(amount)) {
        value = await getLowestPrice(contracts, amount)
      }
      return contracts.CurationMarket.instance.methods
        .buy(state.account, market, amount)
        .send({
          from: state.account,
          value: value
        })
    }
  },
  async divest ({ state, dispatch }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) throw new Error('Invalid amount')
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
    amount = utils.toWei(amount)
    const marketContract =
      market === 'ClubToken' ? 'ClubTokenController' : 'CurationMarket'

    if (marketContract === 'ClubTokenController') {
      let balance = await contracts.ClubToken.instance.methods
        .balanceOf(state.account)
        .call()
      balance = new BigNumber(balance)
      if (balance.lt(amount)) {
        throw new Error(
          'balance too low: ' +
            balance +
            ' < ' +
            amount
        )
      }
      return contracts.ClubTokenController.instance.methods.sell(amount).send({
        from: state.account
      })
    } else {
      let balance = await contracts.CurationMarket.instance.methods
        .balanceOf(market, state.account)
        .call()
      balance = new BigNumber(balance)
      if (balance.lt(amount)) {
        throw new Error('balance too low: ' + balance)
      }
      return contracts.CurationMarket.instance.methods
        .sell(market, amount)
        .send({
          from: state.account
        })
    }
  },
  syncClover ({getters}, clover) {
    axios.get(getters.baseURL(`/clovers/sync/${clover.board}`)).catch(error => {
      console.error(error)
    })
  },
  async transferClover ({ state, dispatch }, { clover, address }) {
    try {
      let ENSaddress = await global.ens.resolver(address).addr()
      address = ENSaddress
    } catch (error) {
      console.error(error)
      console.error('No ENS')
    }
    if (!isHex(address) || address.replace('0x', '').length !== 40) {
      throw new Error('Not a valid address')
    }

    let currentPrice = await contracts.SimpleCloversMarket.instance.methods
      .sellPrice(clover.board)
      .call()
    currentPrice = makeBn(currentPrice)
    // if 0 then it's not actually for sale
    if (!currentPrice.eq(0)) {
      throw new Error('Can\'t transfer a Clover that is currently for sale')
    }
    return contracts.Clovers.instance.methods
      .transferFrom(state.account, address, clover.board)
      .send({
        from: state.account
      })
  },
  async buy ({ dispatch, state, commit }, clover) {
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')

    // if clover exists it must be in SimpleCloversMarket
    // otherwise it is a claimClover
    let cloverExists = await dispatch('cloverExists', clover.board)
    if (cloverExists) {
      // get current price
      let currentPrice = await contracts.SimpleCloversMarket.instance.methods
        .sellPrice(clover.board)
        .call()
      currentPrice = makeBn(currentPrice)
      // if 0 then it's not actually for sale
      if (currentPrice.eq(0)) {
        dispatch('syncClover', clover)
        throw new Error('Clover not for sale')
      }

      // get balance of user in ClubToken
      let balanceOf = await contracts.ClubToken.instance.methods
        .balanceOf(state.account)
        .call()
      balanceOf = makeBn(balanceOf)
      let value = 0
      // if it's less than the price then find the Eth needed to buy enough
      if (balanceOf.lt(currentPrice)) {
        value = await getLowestPrice(
          contracts,
          currentPrice.sub(balanceOf)
        )
      }
      return contracts.SimpleCloversMarket.instance.methods
        .buy(clover.board)
        .send({
          from: state.account,
          value: value.toFixed()
        })
    } else {
      // claim clover w option _keep = true
      return claimClover({ keep: true, clover, account: state.account })
    }
  },
  async sell ({ state, dispatch, commit }, { clover, price }) {
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')

    // if clover exists it must be in SimpleCloversMarket
    // otherwise it is a claimClover
    const cloverExists = await dispatch('cloverExists', clover.board)
    if (cloverExists) {
      // get the owner of the clover
      let owner = await contracts.Clovers.instance.methods
        .ownerOf(clover.board).call()
      // if not current user, then error
      if (owner.toLowerCase() !== state.account.toLowerCase()) {
        throw new Error('cant-sell-dont-own')
      }
      price = new BigNumber(price)
      // if the price = 0, really they are removing it from the market
      // otherwise they should sell it
      if (price.eq(0)) {
        // remove from market
        return contracts.SimpleCloversMarket.instance.methods
          .removeSell(clover.board)
          .send({
            from: state.account
          })
      } else {
        // sell clover (update price)
        return contracts.SimpleCloversMarket.instance.methods
          .sell(clover.board, price.toFixed())
          .send({
            from: state.account
          })
      }
    } else {
      // claim clover w option _keep = false
      return claimClover({ keep: false, clover, account: state.account })
    }
  },
  async makeCloverRFT ({ state, dispatch }, { board, investmentInWei = 0 }) {
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')

    // logged in ?
    if (!state.account) return Promise.reject(new Error('You must log-in'))
    // exists ?
    const exists = await contracts.Clovers.instance.methods.exists(board).call()
    if (!exists) return Promise.reject(new Error("Clover doesn't exist"))
    // account is owner ?
    const ownedBy = await contracts.Clovers.instance.methods
      .ownerOf(board)
      .call()
    if (state.account.toLowerCase() !== ownedBy.toLowerCase()) {
      return Promise.reject(new Error('You are not the owner of the Clover'))
    }
    // isn't in the Simple Market ?
    let price = await contracts.SimpleCloversMarket.instance.methods
      .sellPrice(board)
      .call()
    price = new BigNumber(price)
    if (!price.eq(0)) {
      return Promise.reject(
        new Error(
          'Clover is listed in the Market. Please remove before making an RFT'
        )
      )
    }
    // min Amnt 0
    investmentInWei = investmentInWei < 0 ? 0 : investmentInWei
    // have enough tokens ?
    let value = '0'
    // check balance of user in Coin
    let userBalance = await contracts.ClubToken.instance.methods
      .balanceOf(state.account)
      .call()
    userBalance = new BigNumber(userBalance)
    if (userBalance.lt(investmentInWei)) {
      value = await getLowestPrice(
        contracts,
        investmentInWei
      )
    }
    // go !
    await contracts.CurationMarket.instance.methods
      .addCloverToMarket(board, investmentInWei)
      .send({ from: state.account, value: value })
  },

  // activity page
  checkBlock () {
    return global.web3.eth.getBlockNumber()
  },

  async confirmRemoveSavedClover ({ commit }, clover) {
    const yes = window.confirm('Are you sure? This can\'t be undone...')
    if (!yes) return false
    commit('REMOVE_SAVED_CLOVER', clover)
    return true
  },

  // ALBUMS

  getAllAlbums ({ getters, commit, dispatch }, clover) {
    if (clover) {
      return axios.get(getters.baseURL('/albums'), {
        params: { clover }
      }).then(({ data }) => {
        commit('SET_ALL_ALBUMS', data)
        return data
      })
    }
    return axios.get(getters.baseURL('/albums/list/all'))
      .then((results) => {
        // console.log({results})
        commit('SET_ALL_ALBUMS', results.data)
      }).catch((err) => {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
      })
  },

  getPagedAlbums ({ state, commit }, { url, filters = {} }) {
    return axios.get(url, {
      params: { ...filters }
    }).then(({ data }) => commit('SET_PAGED_ALBUMS', data))
      .catch((err) => {
        if (err.response && err.response.data) {
          commit('SET_PAGED_ALBUMS', err.response.data)
        }
      })
  },

  getUserAlbums ({ getters, state }) {
    if (!state.account) return
    return axios.get(getters.baseURL(`/users/${state.account}/albums`))
      .then(({ data }) => {
        return data
      }).catch(console.error)
  },

  searchAlbums ({ getters }, term) {
    if (!term) return
    return axios.get(getters.baseURL('/albums'), {
      params: { s: term }
    }).then(({ data }) => {
      return data
    })
  },

  async deleteAlbum ({dispatch, commit, getters}, albumId) {
    if (!albumId) {
      return Promise.reject(new Error('Misisng album id'))
    }
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
    return axios.delete(getters.baseURL('/albums/' + albumId), {
      headers: {
        Authorization: getters.authHeader
      }
    })
      .then((_) => {
        dispatch('selfDestructMsg', {
          type: 'success',
          msg: 'Album deleted'
        })
        dispatch('getAllAlbums')
      })
      .catch(err => {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
        if ('response' in err) {
          if (err.response.status === 401) {
            commit('SIGN_OUT')
          }
        }
      })
  },

  async createAlbum ({getters, dispatch, commit}, album) {
    if (!album.name || !album.clovers) {
      return Promise.reject(new Error('Missing album'))
    }
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
    return axios.post(getters.baseURL('/albums'), {albumName: album.name, clovers: album.clovers}, {
      headers: {
        Authorization: getters.authHeader
      }
    })
      .then(({data}) => {
        if (!data) throw new Error('404')
        dispatch('selfDestructMsg', {
          type: 'success',
          msg: 'Album created!'
        })
        dispatch('getAllAlbums')
      })
      .catch(err => {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
        if ('response' in err) {
          if (err.response.status === 401) {
            commit('SIGN_OUT')
          }
        }
      })
  },

  async updateAlbum ({getters, dispatch, commit, state}, album) {
    if (!album) {
      return Promise.reject(new Error('Missing album'))
    }
    if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
    return axios.put(getters.baseURL('/albums/' + album.id), {albumName: album.name, clovers: album.clovers}, {
      headers: {
        Authorization: getters.authHeader
      }
    })
      .then(({data}) => {
        if (!data) throw new Error('404')
        let setAlbum
        if (state.currentAlbum && state.currentAlbum.id === album.id) {
          setAlbum = JSON.parse(JSON.stringify(state.currentAlbum))
        } else {
          setAlbum = state.allAlbums.find(a => a.id === album.id)
        }
        if (setAlbum) {
          setAlbum.name = data.name
          setAlbum.clovers = data.clovers
          setAlbum.modified = data.modified
          commit('SET_CURRENT_ALBUM', setAlbum)
        }
        dispatch('selfDestructMsg', {
          type: 'success',
          msg: 'Album details updated'
        })
      })
      .catch(err => {
        console.log(err)
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: err.message
        })
        if ('response' in err) {
          if (err.response.status === 401) {
            commit('SIGN_OUT')
          }
        }
      })
  },

  getAlbum ({ getters, commit }, albumId) {
    if (!albumId) {
      return Promise.reject(new Error('Missing parameter: `id`'))
    }
    return axios.get(getters.baseURL('/albums/' + albumId))
      .then(({data}) => {
        if (!data) throw new Error('404')
        commit('SET_CURRENT_ALBUM', data)
      }).catch(console.error)
  }
}

async function getLowestPrice (
  contracts,
  targetAmount,
  currentPrice = new BigNumber('0'),
  incrementLevel = 0,
  supply = false,
  balance = false,
  rr = false
) {
  if (!rr || !supply || !balance) {
    supply = await contracts.ClubToken.instance.methods
      .totalSupply()
      .call()
    var virtualSupply = await contracts.ClubTokenController.instance.methods.virtualSupply().call()

    supply = supply + virtualSupply
    rr = await contracts.ClubTokenController.instance.methods.reserveRatio().call()

    balance = await contracts.ClubTokenController.instance.methods.poolBalance().call()
    var virtualBalance = await contracts.ClubTokenController.instance.methods.virtualBalance().call()
    balance = balance + virtualBalance
  }
  if (typeof targetAmount !== 'object') {
    targetAmount = new BigNumber(targetAmount)
  }
  const increments = [
    new BigNumber(utils.toWei('100')),
    new BigNumber(utils.toWei('10')),
    new BigNumber(utils.toWei('1')),
    new BigNumber(utils.toWei('0.5')),
    new BigNumber(utils.toWei('0.01')),
    new BigNumber(utils.toWei('0.005'))
  ]
  currentPrice = currentPrice.add(increments[incrementLevel])
  // let resultOfSpend = getBuy(currentPrice, supply, balance, rr)
  let resultOfSpend = await contracts.ClubTokenController.instance.methods.getBuy(currentPrice.toFixed()).call()
  resultOfSpend = new BigNumber(resultOfSpend.toString())
  if (resultOfSpend.gt(targetAmount)) {
    if (incrementLevel === increments.length - 1) {
      return currentPrice
    } else {
      return getLowestPrice(
        contracts,
        targetAmount,
        currentPrice.sub(increments[incrementLevel]),
        incrementLevel + 1,
        supply,
        balance,
        rr
      )
    }
  }
  return getLowestPrice(contracts, targetAmount, currentPrice, incrementLevel, supply, balance, rr)
}

// def calculatePurchaseReturn(s, market_settings, amount):
//     totalSupply = s['bc-totalSupply'] + market_settings["bc-virtualSupply"]
//     collateral = s['bc-balance'] + market_settings["bc-virtualBalance"]
//     CW = market_settings["bc-reserveRatio"]
//     if (s['bc-balance'] <= 0):
//         return 0
//     return totalSupply * ((1 + amount / collateral)**CW-1)

function getBuy (spendAmount, supply, balance, rr) {
  supply = new Decimal(supply)
  spendAmount = new Decimal(spendAmount.toFixed())
  balance = new Decimal(balance)
  rr = new Decimal(rr)

  // let result = supply.mul(
  //   (
  //     spendAmount.div(balance).add(1)
  //   ).pow(
  //     rr.div(1000000)
  //   ).sub(1)
  // )
  const result = supply.mul(
    new Decimal(1)
      .plus(spendAmount.div(balance))
      .pow(rr.div(1000000))
      .sub(1)
  )

  return result
}

async function claimClover ({ keep, account, clover }) {
  let reversi = new Reversi()
  reversi.playGameMovesString(clover.movesString)
  let moves = reversi.returnByteMoves().map(m => '0x' + padRight(m, 56))
  let _tokenId = clover.board
  let _symmetries = reversi.returnSymmetriesAsBN()
  let _keep = keep
  let from = account
  let value = new BigNumber('0')
  if (keep) {
    let mintPrice = await getMintPrice({ _symmetries })
    let balance = await contracts.ClubToken.instance.methods
      .balanceOf(account)
      .call()
    balance = new BigNumber(balance)
    if (balance.lt(mintPrice)) {
      let clubTokenToBuy = mintPrice.sub(balance)
      value = await getLowestPrice(
        contracts,
        clubTokenToBuy
      )
    }
  }
  let stakeAmount = await contracts.CloversController.instance.methods
    .stakeAmount()
    .call()

  let currentGasPrice
  console.log('here?)')
  try {
    currentGasPrice = await contracts.CloversController.instance.methods
      .getGasPriceForApp()
      .call()
  } catch (_) {
    if ((new BigNumber(stakeAmount)).eq('190621')) {
      currentGasPrice = '10000000000' // 10Gwei
    } else {
      currentGasPrice = '1' // gas is already added in the early version contract
    }
  }

  console.log('and??')
  console.log({currentGasPrice})
  console.log({stakeAmount})

  stakeAmount = new BigNumber(stakeAmount)
  let stakeWithGas = stakeAmount.mul(currentGasPrice)
  console.log({stakeWithGas})

  value = new BigNumber(value)
  value = value.plus(stakeWithGas)
  console.log({value})

  return contracts.CloversController.instance.methods
    .claimClover(moves, _tokenId, _symmetries.toString(10), _keep)
    .send({ from, value: value.toFixed() })
}

async function getMintPrice ({ _symmetries }) {
  let reward
  if (_symmetries.eq(0)) {
    reward = '0'
  } else {
    reward = await contracts.CloversController.instance.methods
      .calculateReward(_symmetries.toString(10))
      .call()
  }

  let basePrice = await contracts.CloversController.instance.methods
    .basePrice()
    .call()
  reward = new BigNumber(reward)
  return reward.add(basePrice)
}
