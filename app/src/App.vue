<template>
  <div id="app" class='mt3-5 pb4'>
    <app-header></app-header>
    <main>
      <router-view></router-view>
    </main>
    <instructions v-if="notRinkeby"></instructions>
    <clover-list v-if="!hideMainCloverList || notRinkeby"></clover-list>
    <foot></foot>
    <messages></messages>
  </div>
</template>

<script>
  import AppHeader from '@/components/AppHeader'
  import Foot from '@/components/Foot'
  import Instructions from '@/components/Instructions'
  import CloverList from '@/components/CloverList'
  import Messages from '@/components/Messages'
  import { mapGetters, mapMutations, mapActions } from 'vuex'

  export default {
    name: 'app',
    data () {
      return {
        sortBy: null,
        paged: 1,
        limit: 20,
        rebuildChat: false
      }
    },
    watch: {
      '$route.fullPath': () => {
        console.log('rebuild')
        this.rebuildChat = true
        setTimeout(() => {
          this.rebuildChat = false
        }, 1000)
      },
      notRinkeby () {
        if (this.$route.path !== '/' && this.notRinkeby) {
          this.$router.push('/')
        }
      }
    },
    computed: {
      pagedTotal () {
        return Math.floor(this.allClovers.length / this.limit) + (this.allClovers.length % this.limit && 1)
      },
      prevPossible () {
        return this.paged > 1
      },
      nextPossible () {
        return this.paged < this.pagedTotal
      },
      startSlice () {
        return this.limit * (this.paged - 1)
      },
      endSlice () {
        return this.limit * this.paged
      },
      cloversSorted () {
        return this.allClovers.sort((a, b) => b.modified - a.modified).slice(this.startSlice, this.endSlice)
      },
      hideMainCloverList () {
        return this.$route.meta.hideMainCloverList
      },
      ...mapGetters({
        notRinkeby: 'notRinkeby',
        account: 'account',
        clover: 'clover',
        allClovers: 'allClovers'
      })
    },
    methods: {
      ...mapActions([
        'selfDestructMsg'
      ]),
      ...mapMutations({
        updateClover: 'UPDATE_CLOVER',
        registerEvent: 'ADD_REGISTERED_EVENT',
        registerEvents: 'ADD_REGISTERED_EVENTS',
        newUsernameEvent: 'ADD_USERNAME_EVENT',
        newUsernameEvents: 'ADD_USERNAME_EVENTS',
        newClovernameEvent: 'ADD_CLOVERNAME_EVENT',
        newClovernameEvents: 'ADD_CLOVERNAME_EVENTS'
      })
    },
    mounted () {
      setTimeout(() => {
        if (this.allClovers.length === 0 && !this.notRinkeby) {
          this.selfDestructMsg({
            msg: 'Waiting to receive data from the blockchain',
            type: 'progress'
          })
        }
      }, 3000)
      if (this.$route.path !== '/' && this.notRinkeby) {
        this.$router.push('/')
      }
      this.clover.initWeb3()
      setTimeout(() => {
        this.clover.initWeb3()
      }, 5000)
      window.addEventListener('updateCloverObject', (e) => {
        this.updateClover(e.detail)
      }, false)
      window.addEventListener('eventRegistered', (e) => {
        this.registerEvent(e.detail)
      }, false)
      window.addEventListener('eventsRegistered', (e) => {
        this.registerEvents(e.detail)
      }, false)
      window.addEventListener('newUsernameEvent', (e) => {
        this.newUsernameEvent(e.detail)
      }, false)
      window.addEventListener('newUsernameEvents', (e) => {
        this.newUsernameEvents(e.detail)
      }, false)
      window.addEventListener('newClovernameEvent', (e) => {
        this.newClovernameEvent(e.detail)
      }, false)
      window.addEventListener('newClovernameEvents', (e) => {
        this.newClovernameEvents(e.detail)
      }, false)
    },
    destroyed () {
      this.clover.stopAccountInterval()
      this.clover.stopEvents()
      window.removeEventListener('Event', 'updateCloverObject')
      window.removeEventListener('Event', 'eventRegistered')
      window.removeEventListener('Event', 'eventsRegistered')
      window.removeEventListener('Event', 'eventNewUserName')
      window.removeEventListener('Event', 'eventsNewUserName')
      window.removeEventListener('Event', 'eventNewCloverName')
      window.removeEventListener('Event', 'eventsNewCloverName')
    },
    components: { AppHeader, CloverList, Messages, Instructions, Foot }
  }
</script>

<style >
  @import './style/imports';
  @import './style/global';
  #app {
    position:relative;
    min-height:100vh;
  }
</style>
