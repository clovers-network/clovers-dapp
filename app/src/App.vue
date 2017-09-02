<template>
  <div id="app">
    <router-view></router-view>
    <div class="mining"></div>
  </div>
</template>

<script>
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
  }
}
</script>

<style>
  @import './style/imports';
  @import './style/global';
</style>
