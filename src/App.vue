<template>
  <div>
  <app-header/>
  <div id="app" class="relative min-h-100vh max-width-3 mx-auto outline">
    <main class="">
      <router-view class=""/>
    </main>
    <foot/>
    <messages/>
  </div>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader'
import Foot from '@/components/Foot'
import Messages from '@/components/Messages'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    account () {
      return this.$store.state.account
    }
  },
  methods: {
    ...mapActions([
      'poll',
      'setUpSocket',
      'pollEthPrice',
      'getCurrentUser'
    ])
  },
  watch: {
    account (newVal) {
      this.getCurrentUser(newVal)
    }
  },
  mounted () {
    this.setUpSocket()
    this.pollEthPrice()
    this.poll()
  },
  components: { AppHeader, Foot, Messages }
}
</script>

<style lang="css">
  @import './style/fonts';
  @import './style/global';
  @import './style/imports';
  .intro-screen {
    & .clover {
      display: inline-block;
    }
    & .text-path {
      bottom: -2.6em;
      left: -2.6em;
      right: -2.6em;
      top: -2.6em;
    }
  }
</style>
