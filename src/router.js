import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import Learn from '@/views/Learn/Learn'

const Field = () => import(/* webpackChunkName: 'clovers' */ '@/views/Field')
const Feed = () => import(/* webpackChunkName: 'clovers' */ '@/views/Feed')
const User = () => import(/* webpackChunkName: 'clovers' */ '@/views/User')

const Account = () => import(/* webpackChunkName: 'user' */ '@/views/Account')
const Picks = () => import(/* webpackChunkName: 'user' */ '@/views/Picks')
const Trade = () => import(/* webpackChunkName: 'user' */ '@/views/Trade')
const About = () => import(/* webpackChunkName: 'user' */ '@/views/About')
const Clover = () => import(/* webpackChunkName: 'user' */ '@/views/Clover')

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
      path: '/field',
      name: 'Field',
      component: Field,
      meta: { title: 'Pick Clovers' }
    },
    {
      path: '/market',
      name: 'Market',
      component: Feed,
      meta: { title: 'Market' }
    },

    {
      path: '/trade',
      name: 'Trade',
      component: Trade
    },
    {
      path: '/learn',
      name: 'Learn',
      template: '<div>Learn</div>'
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
      path: '/account/picks',
      name: 'Picks',
      component: Picks,
      meta: { title: 'Picks' }
    },
    {
      path: '/account/clovers',
      name: 'Account/Clovers',
      component: User,
      meta: { title: 'My Clovers' }
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
      meta: {title: 'Buy'},
      children: [
        {
          path: 'comments',
          name: 'Clover/Comments',
          component: Clover
        }
      ]
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
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition || to.name === from.name) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
