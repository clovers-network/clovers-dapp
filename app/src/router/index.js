import Vue from 'vue'
import Router from 'vue-router'
import Wallet from '@/components/Wallet'
import Punks from '@/components/Punks'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Wallet',
      component: Wallet
    },
    {
      path: '/punks',
      name: 'Punks',
      component: Punks
    }
  ]
})
