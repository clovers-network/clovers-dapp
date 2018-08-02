<template>
  <div class="overflow-hidden">
    <header class="fixed justify-end z3 top-0 left-0 right-0 flex bg-purple items-center white">
      <div class="only-mobile cursor mx2 h2 " @click="toggleMenu()"><i class="material-icons">menu</i></div>
      <ul id="menu-list" class="bg-purple list-reset px2 py1 my0 flex-auto" :class="{showMenu:showMenu}">
        <li class="inline-block mr2">
          <router-link to="/" class="white">Clovers</router-link>
        </li>
        <li class="inline-block mr2">
          <router-link to="/about" class="white">About</router-link></li>
        <li class="inline-block mr2">
          <router-link to="/activity" class="white">Activity</router-link></li>
        <li class="inline-block mr2">
          <router-link :to="'/users/' + (username.address || '')" class="white" v-html="'Wallet &nbsp;' + (userName || '')"></router-link>
        </li>
        <li class="inline-block  ml4 white">&nbsp;</li>
      </ul>
      <p class="m0 pr3">

        <span class='relative'>
        {{ cloversFound }}</span>
        <clover-icon width="14" height="14"></clover-icon>
      </p>
      <p class="m0 pr3">
        <span id="balance" :class="{white: balance !== '0', white: balance === '0'}">{{ balanceString }}</span> {{ clubTokenSymbol }}
      </p>
      <p @click="toggleMinePanel" class="relative m0 py2 px3 pointer no-select bg-black white">
        {{ mineText }}
        <span class='mt1 top-0 absolute  bg-red px1 py0 h4 left-0 mln2-5 circle py1' v-if="symmsSinceOpened" >{{symmsSinceOpened}}&nbsp;<clover-icon width="14" height="14"></clover-icon></span>
      </p>
    </header>
    <miner :show-miner="showMiner" v-show="showMiner" @close="toggleMinePanel">

    </miner>
  </div>
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
        this.showMiner = false
      },
      cloversFound () {
        if (this.allClovers && this.allClovers.length > 0) {
          this.symmsSinceOpened++
        }
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
      cloversFound () {
        return this.$store.state.cloversFound
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
      ...mapGetters([
        'username'
      ])
    },
    components: { Miner }
  }
</script>
<style lang="scss" >
.only-mobile {
  display: none;
}
@media only screen and (max-width: 768px) {
    body {
      font-size:14px;
    }
    #app {margin-top:3em;}
    .only-mobile {
      display: inherit;
    }
   #menu-list {
    position:fixed;
    width:100%;
    left:0px;
    top:53px;
    transform: translateX(-100%);
    transition: transform ease 500ms;
    &.showMenu {
      transform: translateX(0%);
    }
    li {
      display:block;
    }
   }
}
</style>
