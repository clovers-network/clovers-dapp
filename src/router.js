import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import Field from '@/views/Field'
import Feed from '@/views/Feed'
import Account from '@/views/Account'
import Picks from '@/views/Picks'
import Trade from '@/views/Trade'
import About from '@/views/About'
import Clover from '@/views/Clover'
import MyClovers from '@/views/MyClovers'
import KeepClover from '@/views/KeepClover'
import User from '@/views/User'

import Activity from '@/views/Activity.vue'

// Old routes
// import Home from '@/components/Home'
// import Clover from '@/components/Clover'
// import User from '@/components/User'
// import Users from '@/components/Users'
// import CloverList from '@/components/archive/0.1.0/CloverList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome,
      meta: { title: '' }
    },
    {
      path: '/field',
      name: 'Field',
      component: Field,
      meta: { title: 'Pick Clovers' },
      children: [
        {
          path: '/keep/:movesString',
          name: 'Keep',
          component: KeepClover,
          meta: { title: 'Keep' },
          props: true
        }
      ]
    },
    {
      path: '/market',
      name: 'Market',
      component: Feed,
      meta: { title: 'Market' }
    },
    {
      path: '/account',
      component: Account,
      children: [
        {
          // default
          path: '/',
          name: 'Account',
          component: Picks,
          meta: { title: 'Account', group: 'account' },
          children: [
            {
              path: 'picks/:movesString',
              name: 'Account/Keep',
              component: KeepClover,
              meta: { title: 'Keep' },
              props: true
            }
          ]
        },
        {
          path: 'clovers',
          name: 'Account/Clovers',
          component: MyClovers,
          meta: { title: 'Account', group: 'account' }
        },
        {
          path: 'trade',
          name: 'Account/Trade',
          component: Trade,
          meta: {title: 'Trade', group: 'account'}
        },
        {
          path: 'picks',
          name: 'Picks',
          redirect: {name: 'Account'}
        }
      ]
    },
    {
      path: '/about',
      redirect: '/'
    },
    {
      path: '/clovers/:board',
      name: 'Clover',
      component: Clover,
      props: true,
      meta: {title: 'Buy', backBtn: false}
    },

    {
      path: '/activity',
      name: 'Activity',
      component: Activity,
      meta: { title: 'Activity Log' }
    },
    {
      path: '/users/:addr',
      name: 'User',
      component: User,
      meta: {title: 'Collector'},
      props: true
    }

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
    // {
    //   path: '/cloverlist',
    //   name: 'CloverList',
    //   component: CloverList
    // }
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
