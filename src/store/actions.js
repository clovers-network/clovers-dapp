import * as contracts from 'clovers-contracts'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import io from 'socket.io-client'
import utils from 'web3-utils'
import axios from 'axios'
import Web3 from 'web3'
import { PortisProvider } from 'portis'
import { pad0x, formatClover, makeBn } from '@/utils'

window.contracts = contracts

const apiBase = process.env.VUE_APP_API_URL
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

export default {
  // web3 stuff
  async begin ({ commit, dispatch }) {
    console.log('begin')
    try {
      await dispatch('poll')
    } catch (error) {
      console.log('begin failed')
      console.error(error)
    }
  },
  reset ({ state, commit, dispatch }) {
    if (state.querying) {
      commit('SET_TRY_AGAIN', true)
      return
    }
    console.log('reset')
    commit('SET_QUERYING', true)
    dispatch('getContracts')
    commit('SET_QUERYING', false)
    if (state.tryAgain) {
      commit('SET_TRY_AGAIN', false)
      dispatch('reset')
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
      console.log({ title, body })
      if (poll) {
        setTimeout(() => {
          dispatch('poll')
        }, 3000)
      } else {
        // given a reason not to poll...
      }
    }
  },
  async getNetwork ({ commit, state }) {
    const networkId = await global.web3.eth.net.getId()
    if (state.networkId !== networkId) {
      commit('SET_NETWORK', networkId)
    }
  },
  async getAnAccount ({ dispatch, commit, state }) {
    if (state.account) {
      alert('you have an account!' + state.acount)
    }
    if (global.web3.currentProvider.zero) {
      // user has no web3, ask them to do portis
      // TODO Make this work
      alert('should trigger portis wallet but it is not')
      global.web3 = new Web3(
        new PortisProvider({
          apiKey: process.env.VUE_APP_PORTIS_KEY,
          network: networks[state.correctNetwork]
        })
      )
    } else if (global.web3.currentProvider.isPortis) {
      // user has portis, but no account available, ask them to unlock it
      alert('unlock your portis wallet')
    } else {
      // user has web3, but their wallet is not unlocked
      alert('unlock your web3 wallet')
    }
  },
  async getAccount ({ commit, dispatch, state }) {
    let accounts = await global.web3.eth.getAccounts()
    if (accounts.length && state.account !== accounts[0].toLowerCase()) {
      commit('SET_UNLOCKED', true)
      commit('SET_ACCOUNT', accounts[0])
      commit('MOVE_ANON_CLOVERS')
    } else if (!accounts.length && (state.account || state.unlocked)) {
      commit('SET_UNLOCKED', false)
      commit('SET_ACCOUNT', null)
      throw new Error('account-locked')
    }
  },
  getContracts ({ dispatch, state, commit }) {
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
    dispatch('updateBasePrice')
    dispatch('updateStakeAmount')
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
  getOrders (_, market = 'ClubToken') {
    return axios.get(apiUrl(`/orders/${market}`)).then(({ data }) => {
      return data
    })
  },
  // async getUser ({ state, commit }, account) {
  //   if (typeof account === 'string') {
  //     account = account.toLowerCase()
  //   }
  //   if (state.account === account) return
  //   if (!account) {
  //     commit('SET_USER', anonUser)
  //     return
  //   }
  //   return axios.get(apiUrl(`/users/${account}`)).then(({ data }) => {
  //     if (!data.address) {
  //       data = Object.assign(anonUser, { address: account, name: account })
  //     }
  //     commit('SET_USER', data)
  //   })
  // },
  async changeUsername ({ commit, getters }, { address, name }) {
    if (!address) return
    console.log('changing username')
    return axios
      .put(
        apiUrl(`/users/${address}`),
        { name },
        {
          headers: {
            Authorization: getters.authHeader
          }
        }
      )
      .then(({ data }) => {
        commit('UPDATE_USER', data)
      })
      .catch(console.log)
  },
  async getReward (_, _symmetries) {
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
    // socket.on('newUser', user => {
    //   commit('ADD_USER', user)
    //   console.log(user)
    // })
    socket.on('updateUser', user => {
      console.log('new user info!', user)
      commit('UPDATE_USER', user)
    })
    socket.on('addClover', clover => {
      console.log('new clover added!', clover)
      commit('NEW_CLOVER_FROM_CHAIN', clover)
    })
    socket.on('updateClover', clover => {
      console.log('new clover info!', clover)
      commit('ADD_CLOVER', clover)
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
  async cloverExists ({ state }, byteBoard) {
    return contracts.Clovers.instance.methods.exists(byteBoard).call()
    // return axios.get(apiUrl(`/clovers/${byteBoard}`)).then(({ data }) => data)
  },
  getAllUsers ({ state, commit }, page = 1) {
    console.log('getting users')
    if (state.allUsers.length) return
    return axios
      .get(apiUrl('/users'))
      .then(({ data }) => {
        commit('GOT_USERS', data)
      })
      .catch(console.log)
  },
  getClovers ({ state, commit }, page = 1) {
    console.log('getting clovers')
    // if (state.allClovers.length) return
    return axios
      .get(apiUrl('/clovers'))
      .then(({ data }) => {
        commit('GOT_CLOVERS', data)
      })
      .catch(console.log)

    /* -------- paginated version ---------------- */
    // let cloverCount = state.allClovers.length
    // let params = { page }
    // if (!cloverCount) {
    //   // all prev, up to end of requested page
    //   params.all = true
    // } else {
    //   // can just get next page (offset in case of new)
    //   params.before = state.allClovers[cloverCount - 1].modified
    // }
    // return axios
    //   .get(apiUrl('/clovers'), { params })
    //   .then(({ data }) => {
    //     commit('GOT_CLOVERS', data)
    //   })
    //  .catch(console.log)
  },

  getClover ({ state }, board) {
    if (!board) {
      return Promise.reject(new Error('Missing parameter: `board` (address)'))
    }
    const found = state.allClovers.filter(clvr => clvr.board === board)
    if (found && found[0]) return Promise.resolve(found[0])
    return axios
      .get(apiUrl('/clovers/' + board))
      .then(clvr => clvr && clvr.data && formatClover(clvr.data))
      .catch(console.error)
  },

  formatFoundClover (_, clover) {
    return {
      board: pad0x(clover.byteBoard),
      movesString: clover.movesString,
      createdAt: new Date()
    }
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
        console.error(err)
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
  },

  // Contract Interactions
  async getBuy (store, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) return 0
    amount = utils.toWei(amount)
    let receive = await contracts[market].instance.methods.getBuy(amount).call()
    return receive
  },
  async getSell ({ state }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) return 0
    amount = utils.toWei(amount)
    let receive = await contracts[market].instance.methods
      .getSell(amount)
      .call()
    return receive
  },
  async invest ({ state }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) throw new Error('Invalid amount')
    amount = utils.toWei(amount)
    if (market === 'ClubTokenController') {
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
        .buy(market, amount)
        .send({
          from: state.account,
          value: amount
        })
    }
  },
  async divest ({ state }, { market, amount }) {
    if (!Number(amount) || Number(amount) < 0) throw new Error('Invalid amount')
    amount = utils.toWei(amount)
    if (market === 'ClubTokenController') {
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
      return contracts.CurationMarket.instance.methods.sell(amount).send({
        from: state.account
      })
    }
  },
  async buy ({ dispatch, state, commit }, clover) {
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
      if (currentPrice.eq(0)) throw new Error('cant-buy-not-for-sale')

      // get balance of user in ClubToken
      let balanceOf = await contracts.ClubToken.instance.methods
        .balanceOf(state.account)
        .call()
      balanceOf = makeBn(balanceOf)
      let value = 0
      // if it's less than the price then find the Eth needed to buy enough
      if (balanceOf.lt(currentPrice)) {
        value = getLowestPrice(contracts.ClubToken, balanceOf.sub(currentPrice))
      }
      await contracts.SimpleCloversMarket.instance.methods
        .buy(clover.board)
        .send({
          from: state.account,
          value
        })
    } else {
      // claim clover w option _keep = true
      if (!state.account) {
        await dispatch('getAnAccount')
      }
      await claimClover({ keep: true, clover, account: state.account })
    }
  },
  async sell ({ state, dispatch, commit }, { clover, price }) {
    console.log(clover, price)
    // if clover exists it must be in SimpleCloversMarket
    // otherwise it is a claimClover
    // TODO Figure out why cloverExists is returning a promise
    if (await dispatch('cloverExists', clover.board)) {
      // get the owner of the clover
      let owner = await contracts.Clovers.instance.methods
        .ownerOf(clover.board)
        .call()
      // if not current user, then error
      if (owner.toLowerCase() !== state.account.toLowerCase()) {
        throw new Error('cant-sell-dont-own')
      }
      price = new BigNumber(price)
      // if the price = 0, really they are removing it from the market
      // otherwise they should sell it
      if (price.eq(0)) {
        // remove from market
        await contracts.SimpleCloversMarket.instance.methods
          .removeSell(clover.board)
          .send({
            from: state.account
          })
      } else {
        // sell clover (update price)
        await contracts.SimpleCloversMarket.instance.methods
          .sell(clover.board, price)
          .send({
            from: state.account
          })
      }
    } else {
      // claim clover w option _keep = false
      await claimClover({ keep: false, clover, account: state.account })
    }
  },
  async makeCloverRFT ({ state }, { board, investmentInWei = 0 }) {
    console.log(board, investmentInWei)
    // logged in ?
    if (!state.account) return Promise.reject(new Error('You must log-in'))
    // exists ?
    const exists = await contracts.Clovers.instance.methods.exists(board).call()
    if (!exists) return Promise.reject(new Error("Clover doesn't exist"))
    // account is owner ?
    const ownedBy = await contracts.Clovers.instance.methods.ownerOf(board).call()
    if (state.account.toLowerCase() !== ownedBy.toLowerCase()) return Promise.reject(new Error('You are not the owner of the Clover'))
    // isn't in the Simple Market ?
    let price = await contracts.SimpleCloversMarket.instance.methods.sellPrice(board).call()
    console.log(price)
    price = new BigNumber(price)
    if (!price.eq(0)) return Promise.reject(new Error('Clover is listed in the Market. Please remove before making an RFT'))
    // min Amnt 0
    investmentInWei = investmentInWei < 0 ? 0 : investmentInWei
    // have enough tokens ?
    let value = '0'
    // check balance of user in club token
    let userBalance = await contracts.ClubToken.instance.methods.balanceOf(state.account).call()
    userBalance = new BigNumber(userBalance)
    if (userBalance.gt(investmentInWei)) {
      value = await getLowestPrice(contracts.ClubTokenController, investmentInWei)
    }
    // go !
    await contracts.CurationMarket.instance.methods.addCloverToMarket(board, investmentInWei).send({from: state.account, value})
  }
}

function apiUrl (path) {
  return apiBase + path
}

async function getLowestPrice (
  contract,
  targetAmount,
  currentPrice = new BigNumber('0'),
  useLittle = false
) {
  if (typeof targetAmount !== 'object') {
    targetAmount = new BigNumber(targetAmount)
  }
  let littleIncrement = new BigNumber(utils.toWei('0.001'))
  let bigIncrement = new BigNumber(utils.toWei('0.1'))
  currentPrice = currentPrice.add(useLittle ? littleIncrement : bigIncrement)
  let resultOfSpend = await contract.instance.methods
    .getBuy(currentPrice)
    .call()
  resultOfSpend = new BigNumber(resultOfSpend)
  if (resultOfSpend.gt(targetAmount)) {
    return useLittle
      ? currentPrice
      : getLowestPrice(
        contract,
        targetAmount,
        currentPrice.sub(bigIncrement),
        true
      )
  }
  return getLowestPrice(contract, targetAmount, currentPrice, useLittle)
}

async function claimClover ({ keep, account, clover }) {
  let reversi = new Reversi()
  reversi.playGameMovesString(clover.movesString)
  let moves = reversi.returnByteMoves().map(m => '0x' + m)
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
      let clubTokenToBuy = balance.sub(mintPrice)
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
