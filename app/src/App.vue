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
  import { mapGetters } from 'vuex'

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
        account: 'account'
      })
    },
    mounted () {
      this.start()
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
      }
    },
    components: { AppHeader }
  }
</script>

<style>
  @import './style/imports';
  @import './style/global';
</style>
