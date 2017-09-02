<template>
  <div id="app">
    <router-view></router-view>
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

      // this.balanceInterval = setInterval(() => {
      //   this.$store.dispatch('getBalance')
      // }, 5000)
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 60px auto;
  max-width: 1200px;
  padding: 0em 1em;
}
</style>
