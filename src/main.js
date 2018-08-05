// import lazySizes from 'lazysizes'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { PortisProvider } from 'portis'
import Web3 from 'web3'

import BN from 'bignumber.js'

import Clv from '@/components/Clv'
import CloverGridItem from '@/components/CloverGridItem'
// import './registerServiceWorker'

if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  global.web3 = new Web3(web3.currentProvider)
} else {
  // Fallback - use Portis
  global.web3 = new Web3(
    new PortisProvider({
      apiKey: 'e1d5ea735b084b248c33c221873d08dc',
      network: 'rinkeby'
    })
  )
}

router.beforeEach((to, from, next) => {
  console.log('to.path', to.path)
  if (
    // process.env.NODE_ENV !== "development" &&
    store.state.network &&
    (store.getters.notRinkeby && store.getters.account) &&
    (to.path !== '/' || to.path !== '/about')
  ) {
    console.log('sth')
    next('/')
  } else {
    next()
  }
})
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
