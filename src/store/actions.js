import * as contracts from 'clovers-contracts'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import io from 'socket.io-client'
import utils from 'web3-utils'
import axios from 'axios'
import { pad0x, makeBn, padRight, isHex, cloverIsMonochrome } from '@/utils'
import CloverWorker from 'worker-loader!../assets/clover-worker'
import confetti from 'canvas-confetti'

window.contracts = contracts

export const apiBase = process.env.VUE_APP_API_URL

const signingParams = [
  {
    type: 'string',
    name: 'Message',
    value: 'To avoid bad things, sign below to authenticate with Clovers'
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

  mine ({dispatch, commit, state}) {
    console.log('mine')
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
  stop ({state, commit}) {
    console.log('stop')
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
  stopAll ({state, dispatch}) {
    dispatch('stop')
    while (state.miners.length > 0) {
      dispatch('stop')
    }
  },
  newSymFound (_) {
    // alert('new sym!!!!')
    var end = Date.now() + (1 * 1000)

    // go Buckeyes!
    var colors = ['#01B463', '#FF4136', '#FFDC00', '#0074D9'];

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
    setTimeout(() => {
      dispatch('pollEthPrice')
    }, 60 * 1000 * 5)
  },
  // web3 stuff
  async checkWeb3 ({ state, dispatch, commit }) {
    console.log('check web3')
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
  async approve ({state, commit}) {
    if (!state.enabled && global.ethereum) {
      try {
        await global.ethereum.enable()
        commit('SET_ENABLED', true)
      } catch (error) {
        console.log(error)
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
    const networkId = await global.web3.eth.net.getId()
    if (state.networkId !== networkId) {
      commit('SET_NETWORK', networkId)
      await dispatch('getContracts')
    }
  },
  async getAccount ({ commit, dispatch, state }) {
    console.log('get account')
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
      let interval = setInterval(() => {
        if (state.contractsDeployed) {
          clearInterval(interval)
          resolve()
        }
      }, 500)
    })
  },
  async getContracts ({ dispatch, state, commit }) {
    console.log('getContracts start')
    commit('CONTRACTS_DEPLOYED', false)
    for (var name in contracts) {
      if (!contracts.hasOwnProperty(name)) continue
      let contract = contracts[name]
      if (contract.networks[state.networkId]) {
        contract.instance = new global.web3.eth.Contract(
          contract.abi,
          contract.networks[state.networkId].address
        )
        console.log('instantiated ' + name)
      } else {
        console.log(name + ' not deployed on this network')
        throw new Error('wrong-network')
      }
    }
    await dispatch('updateBasePrice')
    await dispatch('updateStakeAmount')
    commit('CONTRACTS_DEPLOYED', true)
    console.log('getContracts ended')
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
  getOrders ({ commit }, market = 'ClubToken') {
    axios.get(apiUrl(`/orders/${market}`)).then(({ data }) => {
      commit('SET_MARKET', market)
      commit('SET_ORDERS', data)
      return data
    })
  },
  async updateUserENS ({ commit }, user) {
    let ensName = await global.ens
      .reverse(user.address)
      .name()
      .catch(e => {})
    user.ens = ensName === undefined ? false : ensName
    commit('UPDATE_USER', user)
  },
  async changeUsername ({ commit, getters, dispatch }, { address, name, image }) {
    if (!address) return
    return axios
      .put(
        apiUrl(`/users/${address}`),
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
          if (err.response.status === 401) {
            commit('SIGN_OUT')
          }
        }
      })
  },
  async getReward ({ dispatch }, _symmetries) {
    await dispatch('getNetwork')
    let val = await contracts.CloversController.instance.methods
      .calculateReward(_symmetries.toString(16))
      .call()
    return val
  },

  // api stuff
  async setUpSocket ({ commit }) {
    const socket = io(process.env.VUE_APP_API_URL)

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
      // setTimeout(() => {
      //   commit('REMOVE_MSG', msgId)
      // }, 5000)
    }
    return msg.id
  },
  async cloverExists (_, byteBoard) {
    // let exists = await contracts.Clovers.instance.methods.exists(byteBoard).call()
    return axios.get(apiUrl(`/clovers/${byteBoard}`)).then(() => true).catch(() => false)
  },

  getCurrentUser ({ commit }, account) {
    if (!account) {
      return commit('SET_USER', null)
    }
    return axios.get(apiUrl(`/users/${account.toLowerCase()}`))
      .then(({ data }) => commit('SET_USER', data))
  },
  getUser ({ commit }, account) {
    if (!account) return
    return axios.get(apiUrl(`/users/${account.toLowerCase()}`))
      .then(({ data }) => commit('SET_OTHER_USER', data))
  },

  getPagedClovers ({ state, commit }, { url, filters = {} }) {
    return axios.get(url, {
      params: { ...filters }
    }).then(({ data }) => commit('SET_PAGED_CLOVERS', data))
      .catch((err) => {
        if (err.response && err.response.data) {
          commit('SET_PAGED_CLOVERS', err.response.data)
        }
      })
  },

  getClover ({ state, commit }, board) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.get(apiUrl('/clovers/' + board))
      .then(({ data }) => {
        if (!data) throw new Error('404')
        commit('SET_CURRENT_CLOVER', data)
      }).catch(console.error)
  },

  getComments (_, { board, params }) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.get(apiUrl(`/chats/${board}`), { params })
  },
  addComment ({ getters }, { board, comment }) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    return axios.post(apiUrl(`/chats/${board}`), { comment }, {
      headers: {
        Authorization: getters.authHeader
      }
    })
      .catch(console.error)
  },
  flagOrDeleteComment ({ getters }, id) {
    return axios.delete(apiUrl(`/chats/${id}`), {
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
  async signIn ({ state, commit, dispatch }) {
    if (!state.web3Enabled) {
      console.log('toggle modal')
      global.web3Connect.toggleModal() // open modal on button click
    } else {
      if (!(await dispatch('checkWeb3'))) throw new Error('Transaction Failed')
      console.log('after check web3')
      const { account } = state
      console.log({account})
      if (!account) {
        dispatch('selfDestructMsg', {
          type: 'error',
          msg: 'No ETH account to sign in with'
        })
        commit('UPDATE_WEB3', false)
        return
      }

      console.log('here')
      if (state.tokens && account in state.tokens && state.tokens[account]) {
        console.log('token is present', state.tokens[account])
        return
      }
      global.web3.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData',
          params: [signingParams, account],
          from: account
        },
        (err, { error, result }) => {
          if (error || err) {
            commit('UPDATE_WEB3', false)
            dispatch('selfDestructMsg', {
              type: 'error',
              msg: 'Could not sign in'
            })
            return
          }
          dispatch('selfDestructMsg', {
            type: 'success',
            msg: 'Successfully signed in'
          })
          commit('SIGN_IN', { account, signature: result })
        }
      )
    }
  },

  updateCloverName ({ getters, commit, dispatch }, clover) {
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
    commit('SET_CLUB_TOKEN_PRICE', clubTokenPrice.toString(10))
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
        value = await getLowestPrice(contracts.ClubTokenController, amount)
      }
      return contracts.CurationMarket.instance.methods
        .buy(state.account, market, amount)
        .send({
          from: state.account,
          value
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
            balance.toString(10) +
            ' < ' +
            amount.toString(10)
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
        throw new Error('balance too low: ' + balance.toString(10))
      }
      return contracts.CurationMarket.instance.methods
        .sell(market, amount)
        .send({
          from: state.account
        })
    }
  },
  syncClover (_, clover) {
    axios.get(apiUrl(`/clovers/sync/${clover.board}`)).catch(error => {
      console.log("sync broken clover didn't work")
      console.log(error)
    })
  },
  async getShares ({ state, dispatch }, market) {
    await dispatch('contractsDeployed')
    return contracts.CurationMarket.instance.methods
      .balanceOf(new BigNumber(market, 16).toString(10), state.account)
      .call()
  },
  async transferClover ({ state, dispatch }, { clover, address }) {
    try {
      let ENSaddress = await global.ens.resolver(address).addr()
      address = ENSaddress
    } catch (error) {
      console.log('no ens')
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
      // console.log('currentPrice', utils.fromWei(currentPrice.toString(10)))
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
          contracts.ClubTokenController,
          currentPrice.sub(balanceOf)
        )
      }
      return contracts.SimpleCloversMarket.instance.methods
        .buy(clover.board)
        .send({
          from: state.account,
          value
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
          .sell(clover.board, price)
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
        contracts.ClubTokenController,
        investmentInWei
      )
    }
    console.log(value)
    // go !
    await contracts.CurationMarket.instance.methods
      .addCloverToMarket(board, investmentInWei)
      .send({ from: state.account, value })
  },

  // activity page
  checkBlock () {
    return global.web3.eth.getBlockNumber()
  }
}

function apiUrl (path) {
  return apiBase + path
}

async function getLowestPrice (
  contract,
  targetAmount,
  currentPrice = new BigNumber('0'),
  incrementLevel = 0
) {
  console.log('calc' + incrementLevel)
  if (typeof targetAmount !== 'object') {
    targetAmount = new BigNumber(targetAmount)
  }
  const increments = [
    new BigNumber(utils.toWei('1')),
    new BigNumber(utils.toWei('0.5')),
    new BigNumber(utils.toWei('0.01')),
    new BigNumber(utils.toWei('0.005'))
  ]
  currentPrice = currentPrice.add(increments[incrementLevel])
  console.log(currentPrice.toString(10))
  let resultOfSpend = await contract.instance.methods
    .getBuy(currentPrice)
    .call()
  resultOfSpend = new BigNumber(resultOfSpend)
  if (resultOfSpend.gt(targetAmount)) {
    if (incrementLevel === increments.length - 1) {
      return currentPrice
    } else {
      return getLowestPrice(
        contract,
        targetAmount,
        currentPrice.sub(increments[incrementLevel]),
        incrementLevel + 1
      )
    }
  }
  return getLowestPrice(contract, targetAmount, currentPrice, incrementLevel)
}

async function claimClover ({ keep, account, clover }) {
  console.log({clover})
  let reversi = new Reversi()
  reversi.playGameMovesString(clover.movesString)
  let moves = reversi.returnByteMoves().map(m => '0x' + padRight(m, 56))
  let _tokenId = clover.board
  let _symmetries = reversi.returnSymmetriesAsBN().toString(10)
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
        contracts.ClubTokenController,
        clubTokenToBuy
      )
    }
  }
  let stakeAmount = await contracts.CloversController.instance.methods
    .stakeAmount()
    .call()
  value = new BigNumber(value)
  value = value.plus(stakeAmount)
  console.log(
    moves,
    _tokenId,
    _symmetries,
    _keep,
    utils.fromWei(value.toString(10))
  )
  return contracts.CloversController.instance.methods
    .claimClover(moves, _tokenId, _symmetries, _keep)
    .send({ from, value })
  // .on('transactionHash', hash => {})
}

async function getMintPrice ({ _symmetries }) {
  let reward = await contracts.CloversController.instance.methods
    .calculateReward(_symmetries)
    .call()
  let basePrice = await contracts.CloversController.instance.methods
    .basePrice()
    .call()
  reward = new BigNumber(reward)
  return reward.plus(basePrice)
}
