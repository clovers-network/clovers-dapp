// import lazySizes from 'lazysizes'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3'

import BN from 'bignumber.js'

import Clv from '@/components/Clv'
import CloverGridItem from '@/components/CloverGridItem'
// import './registerServiceWorker'
import ZeroClientProvider from 'web3-provider-engine/zero.js'

if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  global.web3 = new Web3(web3.currentProvider)
} else {
  var web3Provider = ZeroClientProvider({
    getAccounts: function () {},
    rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.VUE_APP_INFURA_API_KEY
  })
  global.web3 = new Web3(web3Provider)
  global.web3.currentProvider.zero = true
}

router.afterEach(() => {
  if (ga) ga('send', 'pageview')
})
Object.defineProperty(Vue.prototype, '$BN', { value: BN })

Vue.component('clv', Clv)
Vue.component('clover-grid-item', CloverGridItem)

Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
