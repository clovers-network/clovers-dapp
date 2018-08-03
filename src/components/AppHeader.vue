<template>
  <header class="fixed z3 top-0 left-0 col-12" :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div class="relative z2 h-header flex justify-between items-center px2" :class="{'border-bottom': !showMenu}">
      <button class="menu-btn" @click="showMenu = !showMenu" aria-label="Toggle Menu">===</button>
      <h1 class="font-exp h3 px2"><router-link to="/">Clovers</router-link></h1>
    </div>
    <!-- nav -->
    <div v-show="showMenu" class="absolute z1 h-100vh col-12 bg-green top-0 left-0 flex flex-column justify-between center">
      <div class="h-header"></div>
      <nav class="flex-auto flex items-center justify-center">
        <ul class="h1 list-reset">
          <li><router-link :to="{ name: 'Field' }">Find Clovers</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'Picks' }">Picks</router-link></li>
          <li class="mt2"><router-link to="/market">Feed</router-link></li>
          <li class="mt2"><router-link :to="{ name: 'About' }">About</router-link></li>
        </ul>
      </nav>
      <!-- miner -->
      <div class="pb3">
        <nav class="h3">
          <h6 class="center">Clover Pig</h6>
          <button>On/Off</button>
          <div class="flex justify-between items-center">
            <div class="col-6 px2">
              <div>Speed</div>
              <div class="font-exp mt1">0/s</div>
            </div>
            <div class="col-6 px2">
              <div>Rare&nbsp;Clovers&nbsp;Found</div>
              <div class="font-exp mt1">{{symmsSinceOpened}}</div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import Miner from '@/components/Miner'

  export default {
    name: 'AppHeader',
    data () {
      return {
        showMiner: false,
        symmsSinceOpened: 0,
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
        this.showMiner = false
      },
      showMiner () {
        this.symmsSinceOpened = 0
      }
    },
    methods: {
      toggleMenu () {
        this.showMenu = !this.showMenu
      },
      checkEsc (e) {
        if (e.keyCode === 27) {
          this.showMiner = false
        }
      },
      toggleMinePanel () {
        this.showMiner = !this.showMiner
      }
    },
    computed: {
      userName () {
        return this.username && this.username.name && (this.username.name.length > 9 ? this.username.name.slice(0, 9) + '&hellip;' : this.username.name)
      },
      mineText () {
        if (!this.mining) return 'Miner stopped'
        return `Mining at ${this.hashRate} g/s`
      },
      balanceString () {
        return parseInt(this.balance).toLocaleString()
      },

      ...mapState([
        'allClovers',
        'clubTokenSymbol',
        'balance',
        'hashRate',
        'mining'
      ]),

      ...mapGetters(['username', 'pickCount'])
    },
    components: { Miner }
  }
</script>

<style></style>
