// import lazySizes from 'lazysizes'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import { PortisProvider } from 'portis'
import VueHead from 'vue-head'
import VueTouch from 'vue-touch'
import VueChatScroll from 'vue-chat-scroll'

import BN from 'bignumber.js'

import Clv from '@/components/Clv'
// import CloverGridItem from '@/components/CloverGridItem'
// import './registerServiceWorker'
import ZeroClientProvider from 'web3-provider-engine/zero.js'

import autofocus from 'vue-autofocus-directive'
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
  global.web3 = new Web3(
    new PortisProvider({
      apiKey: process.env.VUE_APP_PORTIS_KEY,
      network: networks[store.state.correctNetwork]
    })
  )
}

global.ens = new ENS(global.web3.currentProvider)

router.afterEach(() => {
  if (ga) ga('send', 'pageview')
})

Object.defineProperty(Vue.prototype, '$BN', { value: BN })

// Vue config
Vue.config.productionTip = false
Vue.config.devtools = true
Vue.config.CloudinaryBaseURL = process.env.VUE_APP_CLOUDINARY_BASE_URL

Vue.use(VueHead, {separator: '|', complement: 'Clovers'})
Vue.use(VueTouch, {name: 'v-touch'})
Vue.use(VueChatScroll)

Vue.component('clv', Clv)

Vue.directive('autofocus', autofocus)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
