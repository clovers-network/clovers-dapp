// import lazySizes from 'lazysizes'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import VueHead from 'vue-head'
import VueTouch from 'vue-touch'
import VueScrollTo from 'vue-scrollto'
// import VueChatScroll from 'vue-chat-scroll'

import BN from 'bignumber.js'

import Clv from '@/components/Clv'
// import CloverGridItem from '@/components/CloverGridItem'

import { EthereumProvider } from '@walletconnect/ethereum-provider'

const CHAIN_ID = store.state.correctNetwork || 1

if (global.ethereum) {
  global.web3 = new Web3(global.ethereum)
} else if (global.web3) {
  global.web3 = new Web3(global.web3.currentProvider)
} else {
  global.web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://mainnet.infura.io/v3/${process.env.VUE_APP_INFURA_API_KEY}`
    )
  )
}
global.ens = new ENS(global.web3.currentProvider)

// Helper: reset web3 to read-only Infura provider
function resetToReadOnly () {
  global.web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://mainnet.infura.io/v3/${process.env.VUE_APP_INFURA_API_KEY}`
    )
  )
  global.ens = new ENS(global.web3.currentProvider)
}

// Helper: switch web3 to use the given provider
function activateProvider (provider) {
  global.web3 = new Web3(provider)
  global.ens = new ENS(global.web3.currentProvider)
  store.commit('UPDATE_WEB3', true)
}

// Initialise WalletConnect v2 (Reown) provider
EthereumProvider.init({
  projectId: process.env.VUE_APP_WALLETCONNECT_PROJECT_ID,
  chains: [CHAIN_ID],
  showQrModal: true,
  qrModalOptions: {
    themeMode: 'light',
    explorerRecommendedWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
      '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa' // Coinbase
    ]
  },
  metadata: {
    name: 'Clovers',
    description: 'Clovers Network',
    url: 'https://clovers.network',
    icons: ['https://clovers.network/favicon.ico']
  }
}).then((wcProvider) => {
  global.wcProvider = wcProvider

  // If a session is cached, reconnect automatically
  if (wcProvider.session) {
    activateProvider(wcProvider)
    store.dispatch('signIn')
  }

  wcProvider.on('connect', () => {
    activateProvider(wcProvider)
    store.dispatch('signIn')
  })

  wcProvider.on('disconnect', () => {
    store.commit('UPDATE_WEB3', false)
    resetToReadOnly()
  })

  wcProvider.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      store.commit('UPDATE_WEB3', false)
      resetToReadOnly()
    } else {
      // Account switched — refresh sign-in state
      store.dispatch('signIn')
    }
  })

  wcProvider.on('chainChanged', () => {
    // Re-fetch network and contracts when chain changes
    store.dispatch('getNetwork')
  })

  global.web3Connect = {
    open: () => wcProvider.connect(),
    disconnect: () => wcProvider.disconnect()
  }
}).catch((err) => {
  console.error('WalletConnect init failed:', err)
})

// Also handle injected wallet (MetaMask/browser wallet) connections
if (global.ethereum) {
  global.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0 && !store.state.web3Enabled) {
      store.commit('UPDATE_WEB3', true)
      store.dispatch('signIn')
    } else if (accounts.length === 0) {
      store.commit('UPDATE_WEB3', false)
    }
  })
}

router.beforeEach((to, from, next) => {
  to.meta.fromName = from.name

  // if (to.name !== 'Soon') {
  //   next('/soon')
  // } else {
  next()
  // }
})

try {
  if (ga) {
    ga('set', 'page', router.currentRoute.path)
    ga('send', 'pageview')
  }
} catch (_) {}

router.afterEach((to, from) => {
  if (ga) {
    try {
      ga('set', 'page', to.path)
      ga('send', 'pageview')
    } catch (_) {}
  }
})

Object.defineProperty(Vue.prototype, '$BN', { value: BN })

// Vue config
Vue.config.productionTip = false

Vue.use(VueHead, { separator: '|', complement: 'Clovers' })
Vue.use(VueTouch, { name: 'v-touch' })
Vue.use(VueScrollTo)
// Vue.use(VueChatScroll)

Vue.component('clv', Clv)

Vue.directive('autofocus', {
  inserted (el, { value }) {
    el.focus()
    if (value) {
      setTimeout(() => {
        el.select()
      }, 1)
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
