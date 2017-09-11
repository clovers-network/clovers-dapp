<template>
  <div id="app" class='mt3-5'>
    <app-header></app-header>
    <main>
      <router-view></router-view>
    </main>
    <clover-list v-if="!hideMainCloverList"></clover-list>
    <messages></messages>
  </div>
</template>

<script>
  import AppHeader from '@/components/AppHeader'
  import CloverList from '@/components/CloverList'
  import Messages from '@/components/Messages'
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    name: 'app',
    data () {
      return {
        sortBy: null,
        paged: 1,
        limit: 20
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
        account: 'account',
        clover: 'clover',
        allClovers: 'allClovers'
      })
    },
    methods: {
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
      this.clover.initWeb3()
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
    components: { AppHeader, CloverList, Messages }
  }
</script>

<style >
  @import './style/imports';
  @import './style/global';
</style>
