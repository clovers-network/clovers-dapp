<template lang="pug">
  article.green.fixed.z3.overlay.bg-white.flex.flex-column.justify-between
    header
      .h-header.border-bottom.flex.justify-between.items-center.px2
        button.pointer(@click="close") Back
        h1.font-exp Keep or Sell
      nav.flex.h-header.border-bottom.relative
        button.col-6.flex.pointer(@click="view = 'keep'", :class="{'opacity-50': view !== 'keep'}")
          span.block.m-auto Keep
        button.col-6.flex.pointer(@click="view = 'sell'", :class="{'opacity-50': view !== 'sell'}")
          span.block.m-auto Sell
        //- highlight bar
        .absolute.col-6.bg-green.left-0.trans-transform.pointer-events-none(style="bottom:-2px;height:3px", :class="{'transl-x-100': view === 'sell'}")
    figure.flex-auto.relative
      .absolute.bg-contain.bg-no-repeat.bg-center(role="img", v-if="clover", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer.border-top
      div(v-show="view === 'keep'")
        .flex
          .col-6.p3.border-right
            small.block.lh2 Cost to Keep ♣
            .font-exp.mt1 300
          .col-6.p3
            small.block.lh2 Balance ♣
            .font-exp.mt1 22,438
        button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(
          @click="clickButton"
          )
          span.block.m-auto Confirm
      div(v-show="view === 'sell'")
        .flex
          .col-6.p3.border-right.relative(:class="{'opacity-50': sellView !== 'sell'}", @click="sellView = 'sell'")
            small.block.lh2 Sell instantly for ♣
            .font-exp.mt1 500
            button.absolute.top-0.right-0.p2.pointer(@click="sellView = 'sell'")
              .icon-radio(:class="{'icon-radio--selected': sellView === 'sell'}")
          .col-6.p3.relative(:class="{'opacity-50': sellView !== 'auction'}", @click="sellView = 'auction'")
            small.block.lh2 Auction on Market for ♣
            input.font-exp.mt1.block.col-8.border-bottom.min-width-1(type="number", v-model="auctionPrice")
            button.absolute.top-0.right-0.p2.pointer(@click="sellView = 'auction'")
              .icon-radio(:class="{'icon-radio--selected': sellView === 'auction'}")
        button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(
          @click="clickButton"
          )
          span.block.m-auto Confirm
</template>

<script>
import { mapActions } from 'vuex'
import { cloverImage } from '@/utils'
export default {
  name: 'FieldSingle',
  props: ['clover'],
  data () {
    return {
      view: 'keep',
      sellView: 'sell',
      auctionPrice: null
    }
  },
  methods: {
    cloverImage,
    close () {
      this.$emit('close')
      this.view = 'keep'
      this.sellView = 'sell'
    },
    async clickButton () {
      try {
        await this.buy(this.clover)
      } catch (error) {
        console.log(error)
      }
    },
    ...mapActions(['buy'])
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
