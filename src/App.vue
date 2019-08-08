<template lang="pug">
  #app.relative
    app-header(v-if="$route.name != 'Welcome'")
    main.mx-auto.md-col-10.lg-col-8.min-height-app
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

<style>
  @import './style/fonts';
  @import './style/global';
  @import './style/imports';
  #WEB3_CONNECT_MODAL_ID > div {
    z-index:4;
    position: fixed;
  }
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

  .min-height-app {
    padding-top: 1px;
    min-height: calc(100vh - 94px);
  }

</style>
