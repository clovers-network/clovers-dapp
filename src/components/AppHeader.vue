<template>
  <header
    class="sticky top-0 z2"
    :class="{'bg-white green': !showMenu, 'white': showMenu}">
    <!-- top bar -->
    <div
      class="relative z2 h-header flex items-center"
      :class="{'border-bottom': !showMenu}">
      <!-- left col -->
      <div class="col-4 flex pl2 items-center">
        <!-- menu btn -->
        <button
          v-if="!showBackButton"
          class="menu-btn pointer relative py2 pr2"
          @click="showMenu = !showMenu"
          aria-label="Toggle Menu">
            <wavey-btn v-show="mining" :isWhite="showMenu"></wavey-btn>
            <img class="block" v-show="!mining" :src="showMenu
              ? require('../assets/icons/hamburger-white.svg')
              : require('../assets/icons/hamburger.svg')" />
            <span @click.stop>
              <router-link :to="{ name: 'Account' }">
                <div v-if="showBadge"
                  class="found-badge border border-green bounceIn animated">
                    <span class="block">
                      {{ symms }}
                    </span>
                </div>
              </router-link>
            </span>
        </button>
        <!-- back btn -->
        <button v-else class="pointer left-align" @click="$router.go(-1)">Back</button>
      </div>
      <!-- title -->
      <h1 class="font-exp h3 col-4 py1 center">
        <span class="nowrap pointer"
          @click="showMenu = showBackButton ? showMenu : !showMenu">
          {{showMenu ? 'Clovers' : $route.meta.title}}
        </span>
      </h1>
      <!-- right col -->
      <div id="accountHeader" class="col-4 flex justify-end items-center">
        <!-- account btn -->
        <div @click="triggerPig" class="flex items-center pointer px1 border rounded-left lh1">
          <span id="pigIcon" :class="mining && 'bg-currentColor'" class="border mr1 inline-block" style="border-radius:100%; width:13px; height:13px;"></span>
          <span >PIG</span>
        </div>
        <router-link class="block flex items-center pointer pr1 border-top border-bottom border-right" :to="{name: 'Picks'}">
          <cart-icon class="mx1"></cart-icon>
          <span>{{pickCount}}</span>
        </router-link>
        <router-link :to="{name: 'Account/Trade'}" class="flex pr1 items-center border-top border-bottom">
          <coin-icon class="mx1"></coin-icon>
          <span style="">{{prettyUserBalance}}</span>
        </router-link>
        <div id="personToggle" @click="accountMenuToggle" class="mr3 flex items-center p1 pointer border rounded-right">
          <person-icon></person-icon>
          <div class="chevron"></div>
        </div>
        <account-menu v-if="accountMenu"/>
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
          <li class="mt1"><router-link :to="{ name: 'Welcome' }" exact>Welcome</router-link></li>
          <li class="mt1"><router-link :to="{ name: 'Market' }">Market</router-link></li>
          <li class="mt1"><router-link :to="{ name: 'Field' }">Field</router-link></li>
          <li class="mt1">
            <router-link :to="{ name: 'Activity' }" class="relative">
              <span>Log</span>
              <span v-if="newLogs" class="circle bg-orange absolute" style="width:14px;height:14px"></span>
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="px2">
        <pig @minerStatus="mining = $event" @viewPicks="viewPicks" ref="pig"/>
      </div>
    </div>
    
  </header>
</template>

<script>
import WaveyBtn from '@/components/Icons/WaveyMenu'
import AccountMenu from '@/components/AccountMenu'
import Pig from '@/components/Pig'
import PersonIcon from '@/components/Icons/PersonIcon'
import CartIcon from '@/components/Icons/CartIcon'
import CoinIcon from '@/components/Icons/CoinIcon'
import {toDec} from '@/utils'
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  name: 'AppHeader',
  data () {
    return {
      mining: false,
      showMenu: false,
      accountMenu: false,
      showBadge: false
    }
  },
  computed: {
    title () {
      return this.$route.meta.title || 'Clovers'
    },
    symms () {
      return this.$store.state.miningStats.symms
    },
    newLogs () {
      return this.$store.state.logs.length
    },
    showBackButton () {
      return this.$route.name === 'Clover' &&
        this.$route.meta.fromName !== null
    },
    prettyUserBalance () {
      return toDec(this.userBalance)
    },
    ...mapGetters(['userBalance', 'pickCount'])
  },
  watch: {
    symms () {
      this.showBadge = true
    },
    showMenu () {
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
    triggerPig () {
      this.$refs.pig.togglePig()
    },
    accountMenuToggle () {
      if (!this.accountMenu) {
        this.openAccountAddEventListener()
      } else {
        this.closeAccountMenuRemoveEventListener()
      }
    },
    openAccountAddEventListener () {
      this.$nextTick(() => {
        this.accountMenu = true
        document.addEventListener('click', this.closeAccountMenuRemoveEventListener)
      })
    },
    closeAccountMenuRemoveEventListener () {
      this.$nextTick(() => {
        this.accountMenu = false
        document.removeEventListener('click', this.closeAccountMenuRemoveEventListener)
      })
    },
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
  components: { Pig, CartIcon, CoinIcon, PersonIcon, WaveyBtn, AccountMenu }
}
</script>

<style lang="css" scoped>
  .found-badge {
    position: absolute;
    left: 53px;
    top: 6px;
    border-radius: 16px;
    padding: 3px;
    padding-left: 7px;
    padding-right: 7px;
    background: var(--green);
    color: white;
    font-size: var(--small-font-size);
  }
  nav {
    & .router-link-active,
    & .nav__account-link--active{
      text-decoration: underline;
    }
  }
  #personToggle.select:after {
    top:0px;
  }
  #accountHeader > div:not(#accountMenu), 
  #accountHeader > a {
    height: 30px;
  }
  .chevron {
    width:10px;
    height:10px;
    border:1px solid currentColor;
    transform: rotate(45DEG);
    border-top-color: transparent;
    border-left-color: transparent;
    margin: 5px 10px;
    margin-top:0px; 
  }
</style>
