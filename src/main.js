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

import Web3Connect from 'web3modal'

// Keyless public RPC, replacing Infura. Nothing here needs an account: these
// are the same endpoints the API's chain listener already runs on, and the
// backend has had no Infura dependency for a while.
//
// The key it replaced was not a secret that leaked -- any VUE_APP_* value is
// compiled into the browser bundle by design, so it was public the moment it
// shipped, and it was additionally being printed to the console on the line
// this comment replaces. It was also unrestricted, so anyone reading the public
// repo could spend the quota. Removing it is simpler than scoping it.
const PUBLIC_RPC = {
  1: 'https://ethereum-rpc.publicnode.com',
  4: 'https://ethereum-rpc.publicnode.com'
}

const networks = {
  4: 'rinkeby',
  5777: 'ganache',
  1: 'mainnet'
}

// A visitor with no wallet extension previously fell through to Portis, whose
// widget host is NXDOMAIN -- so global.web3, and the ENS instance built from it
// on the next line, were backed by a provider that could never connect. Clover
// data comes from the API and kept working, which is why this was not obvious,
// but every chain read for a visitor without a wallet failed silently.
//
// A plain public RPC is the right fallback: reads work for everyone, and
// connecting a wallet still replaces the provider as before.
if (global.ethereum) {
  global.web3 = new Web3(global.ethereum)
} else if (global.web3) {
  global.web3 = new Web3(global.web3.currentProvider)
} else {
  global.web3 = new Web3(new Web3.providers.HttpProvider(
    PUBLIC_RPC[store.state.correctNetwork] || PUBLIC_RPC[1]
  ))
}
global.ens = new ENS(global.web3.currentProvider)

global.web3Connect = new Web3Connect({
  network: networks[store.state.correctNetwork]
  // No providerOptions: web3modal falls back to injected wallets, which is the
  // only thing here that still works.
  //
  // The three that were configured are dead ends rather than merely deprecated
  // -- WalletConnect v1's bridge (bridge.walletconnect.org) and Portis
  // (widget.portis.io) are both NXDOMAIN, and Fortmatic's API answers 404. The
  // modal offered four choices of which three could only hang, which is worse
  // than offering one that works: a user who picks a dead one cannot tell
  // whether the fault is theirs.
  //
  // Removing them needs no account and no key. Restoring WalletConnect properly
  // means v2, which requires a Reown projectId -- that work is on
  // feature/vue-upgrade-appkit.
})

// subscibe to connect
global.web3Connect.on('connect', (provider) => {
  global.web3 = new Web3(provider) // add provider to web3
  store.commit('UPDATE_WEB3', true)
  global.ens = new ENS(global.web3.currentProvider)
  store.dispatch('signIn')
})

// subscibe to close
// global.web3Connect.on('close', () => {})

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
