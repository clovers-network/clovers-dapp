import Vue from 'vue'
import Router from 'vue-router'
import About from '@/components/About'
import Activity from '@/components/Activity'
import Home from '@/components/Home'
import Clover from '@/components/Clover'
import User from '@/components/User'
import Users from '@/components/Users'

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
      path: '/about',
      name: 'About',
      component: About,
      meta: {
        hideMainCloverList: true
      }
    },
    {
      path: '/clovers/:board',
      name: 'Clover',
      component: Clover
    },
    {
      path: '/activity',
      name: 'Activity',
      component: Activity
    },
    {
      path: '/users/',
      name: 'Users',
      component: Users
    },
    {
      path: '/users/:address',
      name: 'User',
      component: User,
      meta: {
        hideMainCloverList: true
      }
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

Vue.use(Router)
