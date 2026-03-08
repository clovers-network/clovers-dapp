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

const INFURA_RPC = `https://mainnet.infura.io/v3/${process.env.VUE_APP_INFURA_API_KEY}`

// Read-only provider for unauthenticated browsing
global.web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC))
global.ens = new ENS(global.web3.currentProvider)

// WalletConnect v2 — the built-in modal handles everything:
// desktop: shows QR code, mobile: shows wallet deep links
EthereumProvider.init({
  projectId: process.env.VUE_APP_WALLETCONNECT_PROJECT_ID,
  chains: [1],
  showQrModal: true,
  metadata: {
    name: 'Clovers',
    description: 'Clovers Network',
    url: 'https://clovers.network',
    icons: ['https://clovers.network/favicon.ico']
  }
}).then((provider) => {
  function activate () {
    global.web3 = new Web3(provider)
    global.ens = new ENS(global.web3.currentProvider)
    store.commit('UPDATE_WEB3', true)
    store.dispatch('signIn')
  }

  // Restore cached session
  if (provider.session) activate()

  provider.on('connect', activate)
  provider.on('accountsChanged', (accounts) => {
    if (accounts.length) activate()
    else store.commit('UPDATE_WEB3', false)
  })
  provider.on('disconnect', () => store.commit('UPDATE_WEB3', false))

  global.web3Connect = {
    open: () => provider.connect(),
    disconnect: () => provider.disconnect()
  }
}).catch((err) => {
  console.error('WalletConnect init error:', err)
})

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
