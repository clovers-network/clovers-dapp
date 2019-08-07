import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import NotFound from '@/views/404'
import Learn from '@/views/Learn/Learn'

const Clover = () => import(/* webpackChunkName: 'clovers' */ '@/views/Clover')
const Feed = () => import(/* webpackChunkName: 'clovers' */ '@/views/Feed')
const Field = () => import(/* webpackChunkName: 'clovers' */ '@/views/Field')
const User = () => import(/* webpackChunkName: 'clovers' */ '@/views/User')

const Account = () => import(/* webpackChunkName: 'user' */ '@/views/Account')
const Picks = () => import(/* webpackChunkName: 'user' */ '@/views/Picks')
const Trade = () => import(/* webpackChunkName: 'user' */ '@/views/Trade')
const About = () => import(/* webpackChunkName: 'user' */ '@/views/About')

const Activity = () => import(/* webpackChunkName: 'activity' */ '@/views/Activity.vue')

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
      path: '/welcome',
      redirect: '/'
    },
    {
      path: '/garden',
      name: 'Garden',
      component: Field,
      meta: { title: 'Your Garden' }
    },
    {
      path: '/feed',
      name: 'Feed',
      component: Feed,
      meta: { title: 'The Feed' }
    },

    {
      path: '/trade',
      name: 'Trade',
      component: Trade,
      meta: { title: 'Trade' }
    },
    {
      path: '/learn',
      name: 'Learn',
      component: Learn
    },

    // account dashboard
    {
      path: '/account',
      name: 'Account',
      component: Account,
      meta: { title: 'Account' }
    },
    {
      path: '/account/basket',
      name: 'Picks',
      component: Picks,
      meta: { title: 'Your Basket' }
    },
    {
      path: '/account/clovers',
      name: 'Account/Clovers',
      component: User,
      meta: { title: 'Your Clovers' }
    },

    {
      path: '/about',
      redirect: '/'
    },
    {
      path: '/clovers/:board',
      name: 'Clover',
      component: Clover,
      props: true
      // meta: { title: 'Clover' }
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
      meta: { title: 'Collector' },
      props: true
    },

    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],

  scrollBehavior (to, from, savedPosition) {
    if (savedPosition || to.name === from.name) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
