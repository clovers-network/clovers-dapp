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

import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
import Fortmatic from 'fortmatic'

const networks = {
  4: 'rinkeby',
  5777: 'ganache',
  1: 'mainnet'
}

if (global.ethereum) {
  global.web3 = new Web3(global.ethereum)
} else if (global.web3) {
  global.web3 = new Web3(global.web3.currentProvider)
} else {
  const portis = new Portis(process.env.VUE_APP_PORTIS_DAPP, networks[store.state.correctNetwork])
  global.web3 = new Web3(portis.provider)
}
global.ens = new ENS(global.web3.currentProvider)
console.log(process.env.VUE_APP_INFURA_API_KEY)
global.web3Modal = new Web3Modal({
  network: networks[store.state.correctNetwork],
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: process.env.VUE_APP_INFURA_API_KEY
      }
    },
    portis: !global.web3.currentProvider.isPortis && {
      package: Portis,
      options: {
        id: process.env.VUE_APP_PORTIS_DAPP // required
      }
    },
    fortmatic: {
      package: Fortmatic,
      options: {
        key: store.state.correctNetwork === 1 ? process.env.VUE_APP_FORTMATIC_MAIN : process.env.VUE_APP_FORTMATIC_TEST // required
      }
    }
  }
})
global.web3Modal.clearCachedProvider()

// subscibe to connect
global.web3Modal.on('connect', (provider) => {
  console.log('modal connected')
  global.web3 = new Web3(provider) // add provider to web3
  store.commit('UPDATE_WEB3', true)
  global.ens = new ENS(global.web3.currentProvider)
  store.dispatch('signIn')
})

// subscibe to close
// global.web3Modal.on('close', () => {})

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
