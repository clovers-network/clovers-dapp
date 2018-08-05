<template>
  <header
    class="sticky top-0 z1"
    :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div
      class="relative z2 h-header flex items-center"
      :class="{'border-bottom': !showMenu}">
      <div class="col-3 flex pl2 items-center">
        <!-- menu btn -->
        <button
          v-show="!$route.meta.backBtn"
          class="menu-btn pointer"
          @click="showMenu = !showMenu"
          aria-label="Toggle Menu">
            <img :src="showMenu
              ? require('../assets/icons/hamburger-white.svg')
              : require('../assets/icons/hamburger.svg')" />
        </button>
        <!-- back btn -->
        <button v-show="$route.meta.backBtn" class="pointer p2 col-3 left-align" @click="$router.go(-1)">Back</button>
      </div>
      <!-- title -->
      <h1 class="font-exp h3 col-6 py1 center">
          <router-link
            v-if="showMenu"
            @click.native="showMenu = !showMenu"
            :to="{ name: 'Welcome' }">
            Clovers
          </router-link>
          <span class="nowrap" v-else>{{$route.meta.title}}</span>
      </h1>
      <div class="col-3 flex justify-end">
        <router-link class="block p2" :to="{name: 'Account'}">
          <person-icon class="align-middle"></person-icon>
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

          <li><router-link :to="{ name: 'Welcome' }">About</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'Field' }">Find Clovers</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'Feed' }">Feed</router-link></li>

        </ul>
      </nav>
      <div class="px2">
        <pig/>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Pig from '@/components/Pig'
import PersonIcon from '@/components/Icons/PersonIcon'
export default {
  name: 'AppHeader',
  data () {
    return {
      showMenu: false
    }
  },
  computed: {
    title () {
      return this.$route.meta.title || 'Clovers'
    }
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
  },
  destroyed () {
    window.removeEventListener('keyup', this.checkEsc)
  },
  watch: {
    '$route.fullPath': function () {
      this.showMenu = false
    }
  },
  methods: {
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.showMenu = false
      }
    }
  },
  components: { Pig, PersonIcon }
}
</script>
