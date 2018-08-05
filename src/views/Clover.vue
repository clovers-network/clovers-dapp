<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between(v-if="clover")
    header.mt-header-h.flex.border-bottom
      .col-6.p3.border-right
        small.block.lh1.h6 Current Owner
        .font-exp.mt2.txt-overflow-ellipsis.overflow-hidden {{clover.owner}}
      .col-6.p3
        small.block.lh1.h6 Original Price
        .font-exp.mt2 349 ♣
    section
      button.h-header.center.border-bottom.flex.pointer.col-12
        span.block.m-auto See Full History
    figure.flex-auto.relative
      .absolute.bg-contain.bg-center.bg-no-repeat(role="img", :style="'background-image:url(' + cloverImage(board) + ')'")
    footer.bg-green
      button.h-bttm-bar.white.flex.col-12(@click="confirmVisible = !confirmVisible")
        span.block.m-auto.font-exp Buy for 23,458 ♣
      transition(name="confirm")
        section.white(v-show="confirmVisible")
          .border-top.flex.border-bottom
            .col-6.p3.border-right
              small.block.lh1.h6 ♣ Current Balance
              .font-exp.mt2 456,322
            .col-6.p3
              small.block.lh1.h6 ♣ Balance after
              .font-exp.mt2 429,233
          button.h-bttm-bar.white.border-top.flex.col-12
            span.block.m-auto.font-exp Confirm
</template>

<script>
import { cloverImage } from '@/utils'
export default {
  name: 'Clover',
  props: ['board'],
  data () {
    return {
      clover: null,
      confirmVisible: false
    }
  },
  methods: {
    cloverImage
  },
  created () {
    this.$store.dispatch('getClover', this.board)
      .then(clvr => { this.clover = clvr })
  }
}
</script>

<style scoped>
figure > .absolute{
  width:calc(100% - 4.8rem);
  height:calc(100% - 4.8rem);
  top:2.4rem;
  left:2.4rem;
}
.confirm-enter-active,.confirm-leave-active{transition:max-height 800ms;}
.confirm-enter, .confirm-leave-to{max-height: 0}
.confirm-leave, .confirm-enter-to{max-height: 24rem}
</style>
