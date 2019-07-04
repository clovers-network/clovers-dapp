<template lang="pug">
    #pigMenu.border.green.bg-white.absolute
      .justify-between.align-left.bold.border-bottom.pointer.flex.py2.pl2
        .col-3
          .h6 Speed
          .h4 {{hashrate}}/s
        .col-3
          .h6 Searched
          .h4 {{mined.toLocaleString()}}
        .col-6
          #pig-toggle
            toggle-btn.mx-auto( :small="true" :theme="'green'" :active="mining" @click="togglePig" @swiperight="togglePig()" @swipeleft="togglePig()")
      .p3.h4.lh3.center
        template(v-if="newSyms.length == 0") Your Pig {{mining ? 'is sniffing' : 'can sniff'}} out rare Clovers. They'll be added to your basket automatically.
        template(v-else) Your Pig has found <br><b>{{newSyms.length}}</b> rare clover{{newSyms.length > 1 ? 's' : ''}}!
          .m3.rounded.white.bg-green.center
            router-link.col-12.pointer.p1.inline-block(:to="{name: 'Picks'}")
              p.m0.m-auto Go to your Basket
</template>

<script>
import ToggleBtn from '@/components/ToggleBtn'
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  name: 'AcountMenu',
  data () {
    return {
      found: []
    }
  },
  computed: {
    mining () {
      return this.miners.length > 0
    },
    ...mapState(['hashrate', 'miners', 'mined', 'newSyms']),
    ...mapGetters(['authHeader', 'userName', 'user'])
  },
  methods: {
    togglePig () {
      console.log('mining', this.mining)
      if (!this.mining) {
        this.mine()
      } else {
        this.stop()
      }
    },
    ...mapActions(['signInOut', 'mine', 'stop'])
  },
  components: { ToggleBtn }
}
</script>
<style lang="css" scoped>
 #pigMenu {
    top: 65px;
    right: 180px;
    width: 260px;
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
