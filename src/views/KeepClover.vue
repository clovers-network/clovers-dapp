<template lang="pug">
  article.green.fixed.z3.overlay.bg-white.flex.flex-column.justify-between
    header
      .h-header.border-bottom.flex.justify-between.items-center
        .col-3.pl2
          button.pointer(@click="close") Back
        //- h1.col-6.font-exp.center.nowrap Keep or Sell
        .col-9.pr2.right-align
          router-link.font-mono(:to="{name: 'Account/Trade'}") {{userBalance}} ♣
    figure.flex-auto.relative
      .absolute.bg-contain.bg-no-repeat.bg-center(role="img", v-if="clover", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer
      .flex.border-top
        .col-6.p3.border-right.relative(@click="action = 'keep'")
          div(:class="{'opacity-25': action !== 'keep'}")
            small.block.lh1 Keep for ♣
            .font-exp.mt1.truncate {{tokenValue}}
            //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'keep'")
              .icon-radio(:class="{'icon-radio--selected': action === 'keep'}")
        .col-6.p3.relative(@click="action = 'sell'")
          div(:class="{'opacity-25': action !== 'sell'}")
            small.block.lh1 Sell instantly for ♣
            .font-exp.mt1.truncate {{tokenValue}}
            //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'sell'")
              .icon-radio(:class="{'icon-radio--selected': action === 'sell'}")
      //- keep btn
      button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(v-show="action === 'keep'", @click="keep")
        span.block.m-auto Keep
      //- sell btn
      button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(v-show="action === 'sell'", @click="keep")
        span.block.m-auto Sell
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import { fromWei } from 'web3-utils'
import Reversi from 'clovers-reversi'
const reversi = new Reversi()
export default {
  name: 'KeepClover',
  props: ['clover'],
  data () {
    return {
      action: 'keep',
      value: null
    }
  },
  computed: {
    ...mapGetters(['userBalance']),
    tokenValue () {
      return this.value ? fromWei(this.value) : '...'
    }
  },
  methods: {
    cloverImage,
    close () {
      this.$emit('close')
      this.action = 'keep'
    },
    async keep () {
      try {
        var tx = await this.buy(this.clover)
        console.log('SUCCESS', tx)
      } catch (error) {
        console.log(error)
        switch (error.message) {
          case 'cant-buy-not-for-sale':
            this.$store.dispatch('addMessage', {type: 'error', msg: 'Already Registered or Not for Sale :-('})
        }
      }
    },
    getValue () {
      reversi.playGameMovesString(this.clover.movesString)
      const syms = reversi.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        this.value = wei + this.$store.state.basePrice
      })
    },
    ...mapActions(['buy'])
  },
  mounted () {
    this.getValue()
  }
}
</script>

<style lang="css" scoped>
figure > div {
  width: calc(100% - 2rem);
  height: calc(100% - 4rem);
  top: 2rem;
  left: 1rem;
}
</style>
