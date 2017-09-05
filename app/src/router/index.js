import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
// import Wallet from '@/components/Wallet'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})
