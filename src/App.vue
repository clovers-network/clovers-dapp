<template lang="pug">
  #app.relative.min-h-100vh
    app-header
    main.mx-auto.md-col-10.lg-col-8
      router-view
    foot
    messages
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
