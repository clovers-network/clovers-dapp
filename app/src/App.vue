<template>
  <div id="app">
    <app-header></app-header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
  import AppHeader from '@/components/AppHeader'
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    name: 'app',
    data () {
      return {
      }
    },
    computed: {
      ...mapGetters({
        account: 'account',
        clover: 'clover'
      })
    },
    methods: {
      ...mapMutations({
        registerEvent: 'ADD_REGISTERED_EVENT',
        registerEvents: 'ADD_REGISTERED_EVENTS'
      })
    },
    mounted () {
      this.clover.initWeb3()

      window.addEventListener('eventRegistered', (e) => {
        this.registerEvent(e.detail)
      }, false)
      window.addEventListener('eventsRegistered', (e) => {
        this.registerEvents(e.detail)
      }, false)
    },
    destroyed () {
      this.clover.stopAccountInterval()
      this.clover.stopEvents()
      window.removeEventListener('Event', 'eventRegistered')
      window.removeEventListener('Event', 'eventsRegistered')
    },
    components: { AppHeader }
  }
</script>

<style >
  @import './style/imports';
  @import './style/global';
</style>
