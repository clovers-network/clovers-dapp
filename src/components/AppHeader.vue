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
      <h1 class="font-exp h3 col-8 py1 center">
        <span class="nowrap pointer"
          @click="showMenu = showBackButton ? showMenu : !showMenu">
          {{showMenu ? 'Clovers' : $route.meta.title}}
        </span>
      </h1>
      <!-- right col -->
      <div class="col-2 flex justify-end items-center">
        <!-- account btn -->
        <div id="personToggle" @click="accountMenuToggle"  class="p1 mr3 pointer select pr4 border rounded">
          <person-icon></person-icon>
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
        <pig @minerStatus="mining = $event" @viewPicks="viewPicks"/>
      </div>
    </div>
  </header>
</template>

<script>
import WaveyBtn from '@/components/Icons/WaveyMenu'
import AccountMenu from '@/components/AccountMenu'
import Pig from '@/components/Pig'
import PersonIcon from '@/components/Icons/PersonIcon'
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
    }
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
  components: { Pig, PersonIcon, WaveyBtn, AccountMenu }
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
  #personToggle {
    padding-right: 42px;
  }
  #personToggle.select:after {
    top:0px;
  }
</style>
