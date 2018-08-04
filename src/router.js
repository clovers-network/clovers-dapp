import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import Field from '@/views/Field'
import Market from '@/views/Market'
import Account from '@/views/Account'
import Picks from '@/views/Picks'
import Trade from '@/views/Trade'
import About from '@/views/About'
// Old routes
// import Home from '@/components/Home'
// import Clover from '@/components/Clover'
// import User from '@/components/User'
// import Users from '@/components/Users'
import CloverList from '@/components/CloverList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome,
      meta: {title: 'Clovers'}
    },
    {
      path: '/field',
      name: 'Field',
      component: Field,
      meta: {title: 'Find Clovers'}
    },
    {
      path: '/market(/page/)?:page?',
      name: 'Market',
      component: Market
    },
    {
      path: '/account',
      component: Account,
      children: [
        {
          path: 'clovers',
          name: 'Account/Clovers',
          component: Picks,
          meta: {title: 'Account'}
        },
        {
          path: 'trade',
          name: 'Account/Trade',
          component: Trade,
          meta: {title: 'Account'}
        },
        {
          // default
          path: '',
          name: 'Account',
          component: Picks,
          meta: {title: 'Account'}
        }
      ]
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/clovers/:board',
      name: 'Clover',
      template: '<div class="mt4">Single clover</div>'
    },

    //
    // =======================================
    // Old Paths
    // =======================================
    //
    // {
    //   path: '/home', // formerly "/"
    //   name: 'Home',
    //   component: Home
    // },
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
    // {
    //   path: '/clovers/:board',
    //   name: 'Clover',
    //   component: Clover
    // },
    // {
    //   path: '/activity',
    //   name: 'Activity',
    //   component: Activity
    // },
    // {
    //   path: '/users/',
    //   name: 'Users',
    //   component: Users
    // },
    // {
    //   path: '/users/:address',
    //   name: 'User',
    //   component: User,
    //   meta: {
    //     hideMainCloverList: true
    //   }
    // },
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
