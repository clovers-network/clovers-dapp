import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import Find from '@/views/Find'
import Market from '@/views/Market'
import Wallet from '@/views/Wallet'
import About from '@/views/About'
// Old routes
import AboutOld from '@/components/About'
import Activity from '@/components/Activity'
import Home from '@/components/Home'
import Clover from '@/components/Clover'
import User from '@/components/User'
import Users from '@/components/Users'
import CloverList from '@/components/CloverList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/find',
      name: 'Find',
      component: Find
    },
    {
      path: '/market(/page/)?:page?',
      name: 'Market',
      component: Market
    },
    {
      path: '/wallet',
      name: 'Wallet',
      component: Wallet
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    //
    // =======================================
    // Old Paths
    // =======================================
    //
    {
      path: '/home', // formerly "/"
      name: 'Home',
      component: Home
    },
    /*
    {
      path: '/about',
      name: 'About',
      component: AboutOld,
      meta: {
        hideMainCloverList: true
      }
    },
    */
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
    },
    // add on for reference
    {
      path: '/cloverlist',
      name: 'CloverList',
      component: CloverList
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
