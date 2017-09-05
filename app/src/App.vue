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
        accountInterval: null,
        balanceInterval: null
      }
    },
    computed: {
      ...mapGetters({
        account: 'account',
        clover: 'clover'
      })
    },
    beforeDestroy () {
      clearInterval(this.accountInterval)
      clearInterval(this.balanceInterval)
    },
    methods: {
      start () {
        this.$store.dispatch('connect')
        this.accountInterval = setInterval(() => {
          this.$store.dispatch('checkAccounts')
        }, 1000)
        this.balanceInterval = setInterval(() => {
          this.$store.dispatch('getBalance')
        }, 5000)
      },

      ...mapMutations({
        registerEvent: 'ADD_REGISTERED_EVENT'
      })
    },
    mounted () {
      this.start()
      this.clover.setEvents()
      window.addEventListener('eventRegistered', (e) => {
        this.registerEvent(e.detail)
      }, false)
    },
    destroyed () {
      clearInterval(this.interval)
      this.clover.stopEvents()
      window.removeEventListener('Event', 'eventRegistered')
    },
    components: { AppHeader }
  }
</script>

<style>
  @import './style/imports';
  @import './style/global';
</style>
