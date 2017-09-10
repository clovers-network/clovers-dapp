import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Clover from '@/components/Clover'
import User from '@/components/User'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/clovers/:board',
      name: 'Clover',
      component: Clover
    },
    {
      path: '/users/:address',
      name: 'User',
      component: User
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
