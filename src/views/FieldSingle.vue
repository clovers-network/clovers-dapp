<template lang="pug">
  article.green.fixed.z3.overlay.bg-white.flex.flex-column.justify-between
    header
      .h-header.border-bottom.flex.justify-between.items-center
        .col-3.pl2
          button.pointer(@click="close") Back
        //- h1.col-6.font-exp.center.nowrap Keep or Sell
        .col-9.pr2.right-align
          router-link.font-mono(:to="{name: 'Account/Trade'}") {{balance}} ♣
    figure.flex-auto.relative
      .absolute.bg-contain.bg-no-repeat.bg-center(role="img", v-if="clover", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer
      .flex.border-top
        .col-6.p3.border-right.relative(@click="action = 'keep'")
          div(:class="{'opacity-25': action !== 'keep'}")
            small.block.lh1 Keep for ♣
            .font-exp.mt1 {{value}}
            //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'keep'")
              .icon-radio(:class="{'icon-radio--selected': action === 'keep'}")
        .col-6.p3.relative(@click="action = 'sell'")
          div(:class="{'opacity-25': action !== 'sell'}")
            small.block.lh1 Sell instantly for ♣
            .font-exp.mt1 {{value}}
            //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'sell'")
              .icon-radio(:class="{'icon-radio--selected': action === 'sell'}")
      button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(@click="clickButton")
        span.block.m-auto {{action === 'keep' ? 'Keep' : 'Sell'}}
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
export default {
  name: 'FieldSingle',
  props: ['clover'],
  data () {
    return {
      action: 'keep',
      value: 500
    }
  },
  computed: {
    ...mapState(['balance'])
  },
  methods: {
    cloverImage,
    close () {
      this.$emit('close')
      this.action = 'keep'
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
