<template lang="pug">
  #pigMenu.border.green.bg-white.absolute
    .center.bold.border-bottom.pointer
      .p2 {{ mining ? &apos;Your Pig is Running&apos; : &apos;Your Pig is Paused&apos; }}
    .p2.h5.lh3
      .pointer(@click='triggerPig') {{ mining ? &apos;Stop Pig&apos; : &apos;Start Pig&apos; }}
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  name: 'PigMenu',
  props: ['mining'],
  computed: {
    ...mapState(['account']),
    ...mapGetters(['authHeader', 'userName', 'user'])
  },
  methods: {
    triggerPig () {
      this.$emit('triggerpig')
    },

    ...mapActions(['signInOut'])
  }
}
</script>

<style lang="css" scoped>
 #pigMenu {
    top: 65px;
    right: 180px;
    width: 200px;
  }
  #pigMenu:before,
  #pigMenu:after {
        content: '';
        width:0px;
        height:0px;
        border:13px solid transparent;
        border-bottom: 10px solid var(--green);
        position:absolute;
        top:-23px;
        right:15px;
  }
  #pigMenu:after {
      border-bottom: 10px solid var(--white);
      top: -22px;
  }
</style>
