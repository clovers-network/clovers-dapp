import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/views/Welcome'
import ComingSoon from '@/views/ComingSoon'
import NotFound from '@/views/404'
import Learn from '@/views/Learn/Learn'

const Clover = () => import(/* webpackChunkName: 'clovers' */ '@/views/Clover')
const Feed = () => import(/* webpackChunkName: 'clovers' */ '@/views/Feed')
const Field = () => import(/* webpackChunkName: 'clovers' */ '@/views/Field')

const User = () => import(/* webpackChunkName: 'user' */ '@/views/User/User')
const UserClovers = () => import(/* webpackChunkName: 'user' */ '@/views/User/User__Clovers')
const UserAlbums = () => import(/* webpackChunkName: 'user' */ '@/views/User/User__Albums')

const Account = () => import(/* webpackChunkName: 'user' */ '@/views/Account')
const Picks = () => import(/* webpackChunkName: 'user' */ '@/views/Picks')
const Trade = () => import(/* webpackChunkName: 'user' */ '@/views/Trade')

const Activity = () => import(/* webpackChunkName: 'activity' */ '@/views/Activity.vue')

const Albums = () => import(/* webpackChunkName: 'albums' */ '@/views/Albums')
const Album = () => import(/* webpackChunkName: 'albums' */ '@/views/Album')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome,
      meta: { logo: false }
    },
    {
      path: '/welcome',
      redirect: '/'
    },
    {
      path: '/soon',
      name: 'Soon',
      component: ComingSoon
    },
    {
      path: '/garden',
      name: 'Garden',
      component: Field
    },
    {
      path: '/feed',
      name: 'Feed',
      component: Feed
    },

    {
      path: '/trade',
      name: 'Trade',
      component: Trade
    },
    {
      path: '/learn',
      name: 'Learn',
      component: Learn,
      meta: { isOverlay: true }
    },

    // account dashboard
    {
      path: '/account',
      name: 'Account',
      component: Account,
      meta: { title: [['You']] }
    },
    {
      path: '/account/basket',
      name: 'Picks',
      component: Picks,
      meta: { title: [['You', '/account']] }
    },
    {
      path: '/account/clovers',
      name: 'Account/Clovers',
      component: User
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
      meta: { logo: false }
    },

    {
      path: '/activity',
      name: 'Activity',
      component: Activity
    },
    {
      path: '/users/:addr',
      component: User,
      props: true,
      children: [
        {
          path: '',
          name: 'User',
          component: UserClovers,
          meta: { title: [['Users']] }
        },
        {
          path: 'albums',
          name: 'User/Albums',
          component: UserAlbums,
          meta: { title: [['Users']] }
        }
      ]
    },

    {
      path: '/albums',
      name: 'Albums',
      component: Albums
    },
    {
      path: '/albums/:id',
      name: 'Album',
      component: Album,
      props: true,
      meta: { title: [['Albums', '/albums']] }
    },

    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],

  scrollBehavior (to, from, savedPosition) {
    if (savedPosition || to.name === 'Garden') {
      return savedPosition
    } else {
      // to top if path or query.page changed
      if (to.path !== from.path || to.query.page !== from.query.page) {
        return { x: 0, y: 0 }
      }
    }
  }
})
