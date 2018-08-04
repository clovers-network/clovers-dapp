<template>
  <div
    id="app"
    class='pb4'>
    <app-header/>
    <main>
      <router-view/>
    </main>
    <foot/>
    <messages/>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader'
import Foot from '@/components/Foot'
import Messages from '@/components/Messages'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  data () {
    return {}
  },
  methods: {
    ...mapActions(['begin', 'setUpSocket'])
  },
  mounted () {
    this.setUpSocket()
    this.begin()
  },
  components: { AppHeader, Foot, Messages }
}
</script>

<style lang="css">
  @import './style/fonts';
  @import './style/global';
  @import './style/imports';
  .intro-screen {
    .clover {
      display: inline-block;
    }
    .text-path {
      bottom: -2.6em;
      left: -2.6em;
      right: -2.6em;
      top: -2.6em;
    }
  }
  .h7{
    font-size: 0.6rem;
  }
  .h8{
    font-size: 0.5rem;
  }

  #app {
    position:relative;
    min-height:100vh;
  }
</style>
