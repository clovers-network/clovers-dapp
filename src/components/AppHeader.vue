<template>
  <header
    class="fixed z3 top-0 left-0 col-12"
    :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div
      class="relative z2 h-header flex justify-between items-center"
      :class="{'border-bottom': !showMenu}">
      <button
        class="menu-btn pointer p2"
        @click="showMenu = !showMenu"
        aria-label="Toggle Menu">===</button>
      <h1 class="font-exp h3">{{showMenu ? 'Clovers' : $route.meta.title}}</h1>
      <router-link class="block p2" :to="{name: 'Account'}"><person-icon></person-icon></router-link>
    </div>
    <!-- nav -->
    <div
      v-show="showMenu"
      class="absolute z1 h-100vh col-12 bg-green top-0 left-0 flex flex-column justify-between center">
      <div class="h-header"/>
      <nav class="flex-auto flex items-center justify-center">
        <ul class="h1 list-reset">
          <li><router-link :to="{ name: 'Field' }">Find Clovers</router-link></li>
          <li class="mt2"><router-link to="/market">Feed</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'About' }">About</router-link></li>
        </ul>
      </nav>
      <pig/>
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

<style>
</style>
