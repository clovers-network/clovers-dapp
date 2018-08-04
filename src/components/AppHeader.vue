<template>
  <header
    class="fixed z3 top-0 left-0 col-12"
    :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div
      class="relative z2 h-header flex justify-between items-center px2"
      :class="{'border-bottom': !showMenu}">
      <button
        class="menu-btn"
        @click="showMenu = !showMenu"
        aria-label="Toggle Menu">===</button>
      <h1 class="font-exp h3 px2"><router-link to="/">Clovers</router-link></h1>
    </div>
    <!-- nav -->
    <div
      v-show="showMenu"
      class="absolute z1 h-100vh col-12 bg-green top-0 left-0 flex flex-column justify-between center">
      <div class="h-header"/>
      <nav class="flex-auto flex items-center justify-center">
        <ul class="h1 list-reset">
          <li><router-link :to="{ name: 'Field' }">Find Clovers</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'Picks' }">Picks</router-link></li>
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
export default {
  name: 'AppHeader',
  data () {
    return {
      showMenu: false
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
  components: { Pig }
}
</script>

<style>
</style>
