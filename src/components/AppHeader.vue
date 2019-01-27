<template>
  <header
    class="sticky top-0 z2"
    :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div
      class="relative z2 h-header flex items-center"
      :class="{'border-bottom': !showMenu}">
      <!-- left col -->
      <div class="col-2 flex pl2 items-center">
        <!-- menu btn -->
        <button
          v-show="!$route.meta.backBtn"
          class="menu-btn pointer relative py2 pr2"
          @click="showMenu = !showMenu"
          aria-label="Toggle Menu">
            <wavey-btn v-show="mining" :isWhite="showMenu"></wavey-btn>
            <img class="block" v-show="!mining" :src="showMenu
              ? require('../assets/icons/hamburger-white.svg')
              : require('../assets/icons/hamburger.svg')" />
            <div v-if="showBadge"
              class="found-badge border border-green bounceIn animated">
                <span class="block">
                  {{ symms }}
                </span>
            </div>
        </button>
        <!-- back btn -->
        <button v-show="$route.meta.backBtn" class="pointer left-align" @click="$router.go(-1)">Back</button>
      </div>
      <!-- title -->
      <h1 class="font-exp h3 col-8 py1 center">
        <span class="nowrap pointer"
          @click="showMenu = $route.meta.backBtn ? showMenu : !showMenu">
          {{showMenu ? 'Clovers' : $route.meta.title}}
        </span>
      </h1>
      <!-- right col -->
      <div class="col-2 flex justify-end items-center">
        <!-- account btn -->
        <router-link class="p2" :to="{name: 'Account/Clovers'}" @click.native="showMenu = false">
          <person-icon></person-icon>
        </router-link>
      </div>
    </div>
    <!-- nav -->
    <div
      v-show="showMenu"
      class="absolute z1 h-100vh col-12 bg-green top-0 left-0 flex flex-column justify-between center">
      <div class="h-header"/>
      <nav class="flex-auto flex items-center justify-center" @click="showMenu = !showMenu">
        <ul class="h1 list-reset">
          <!-- <li class="mt1"><router-link :to="{ name: 'Account/Clovers' }" :class="{'nav__account-link--active': $route.meta.group === 'account'}">Account</router-link></li> -->
          <li class="mt1"><router-link :to="{ name: 'Feed' }">Market</router-link></li>
          <li class="mt1"><router-link :to="{ name: 'Activity' }">Activity</router-link></li>
          <li class="mt1"><router-link :to="{ name: 'Field' }">Clover Field</router-link></li>
          <li class="mt1"><router-link :to="{ name: 'Welcome' }">Welcome</router-link></li>
        </ul>
      </nav>
      <div class="px2">
        <pig @minerStatus="mining = $event" @viewPicks="viewPicks"/>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import WaveyBtn from '@/components/Icons/WaveyMenu'
import Pig from '@/components/Pig'
import PersonIcon from '@/components/Icons/PersonIcon'
export default {
  name: 'AppHeader',
  data () {
    return {
      mining: false,
      showMenu: false,
      showBadge: false
    }
  },
  computed: {
    title () {
      return this.$route.meta.title || 'Clovers'
    },
    symms: {
      get () {
        return this.$store.state.miningStats.symms
      }
    }
  },
  watch: {
    symms: function () {
      this.showBadge = true
    },
    showMenu: function () {
      this.showBadge = false
    }
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
  },
  destroyed () {
    window.removeEventListener('keyup', this.checkEsc)
  },
  methods: {
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.showMenu = false
      }
    },
    viewPicks () {
      this.showMenu = false
      this.$router.push({ name: 'Picks' })
    }
  },
  components: { Pig, PersonIcon, WaveyBtn }
}
</script>

<style lang="css" scoped>
  .found-badge {
    position: absolute;
    left: 15px;
    top: -3px;
    border-radius: 16px;
    padding: 3px;
    padding-left: 7px;
    padding-right: 7px;
    background: var(--green);
    color: white;
    font-size: var(--small-font-size);
  }
  nav{
    & .router-link-exact-active,
    & .nav__account-link--active{
      text-decoration: underline;
    }
  }
</style>
