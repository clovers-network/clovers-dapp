<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
/* global web3:true */

import Web3 from 'web3'
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
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    this.tryStart()
  },
  beforeDestroy () {
    clearInterval(this.accountInterval)
    clearInterval(this.balanceInterval)
  },
  methods: {
    tryStart () {
      console.log('try start')
      if (typeof (web3) !== 'undefined') {
        this.start()
      } else {
        setTimeout(this.tryStart, 500)
      }
    },
    start () {
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        this.web3Provider = web3.currentProvider
        web3 = new Web3(this.web3Provider)
      } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        this.web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/Q5I7AA6unRLULsLTYd6d')
        web3 = new Web3(this.web3Provider)
      }
      if (typeof web3 === 'undefined') {
         // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        console.error('No web3 detected. Please use MetaMask for development. https://metamask.io/')
        return
      }
      web3 = new Web3(web3.currentProvider)

      this.$store.dispatch('setAccount', web3.eth.accounts[0])
      this.accountInterval = setInterval(() => {
        const account = web3.eth.accounts[0]
        if (account !== this.account) {
          console.log('update account')
          this.$store.dispatch('updateAccount', account)
        }
      }, 100)

      this.balanceInterval = setInterval(() => {
        this.$store.dispatch('getBalance')
      }, 5000)
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
  max-width: 500px;
  padding: 0em 1em;
}
</style>
