<template lang="pug">
    #pigMenu.border.green.bg-white.absolute
      .justify-between.items-end.border-bottom.flex.pt1.pb2.px2
        .col-3
          .h4.bold {{mined.toLocaleString()}}
          .h7.lh1 Searched
        .col-3
          .h4.bold {{hashrate}}/s
          .h7.lh1 Speed
        .col-6
          toggle-btn.ml-auto( :small="true" :theme="'green'" :active="mining" @click="togglePig" @swiperight="togglePig()" @swipeleft="togglePig()")
      .p2.h5.lh3.center
        template(v-if="newSyms.length == 0") Your Pig {{mining ? 'is sniffing' : 'can sniff'}} out rare Clovers. They'll be added to your <router-link :to="{name: 'Picks'}" class="bold">Basket</router-link> automatically.
        template(v-else) Your Pig has found <br><b>{{newSyms.length}}</b> rare clover{{newSyms.length > 1 ? 's' : ''}}!
          .my2.mx3.rounded.white.bg-green.center
            router-link.col-12.pointer.p1.inline-block(:to="{name: 'Picks'}")
              p.m0.m-auto Go to your Basket
</template>

<script>
import ToggleBtn from '@/components/ToggleBtn'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'PigMenu',
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
    top: 50px;
    right: 0;
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
