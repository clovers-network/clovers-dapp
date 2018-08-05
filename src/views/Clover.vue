<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between(v-if="clover")
    header.mt-header-h.flex.border-bottom
      .col-6.p3.border-right
        small.block.lh1.h6 Current Owner
        .font-exp.mt2.txt-overflow-ellipsis.overflow-hidden {{clover.owner}}
      .col-6.p3
        small.block.lh1.h6 Original Price
        .font-exp.mt2 {{clover.original_price}} ♣
    //- section
      button.h-header.center.border-bottom.flex.pointer.col-12
        span.block.m-auto See Full History
    figure.flex-auto.relative
      .absolute.p2
        symmetry-icons.p1(:board="clover.symmetries")
      .absolute.bg-contain.bg-center.bg-no-repeat(role="img", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer.bg-green(v-show="!isMyClover && isForSale")
      button.h-bttm-bar.white.flex.col-12.pointer(@click="confirmVisible = !confirmVisible")
        span.block.m-auto.font-exp Buy for {{price}} ♣
      transition(name="confirm")
        section.white(v-show="confirmVisible")
          .border-top.flex.border-bottom
            .col-6.p3.border-right
              small.block.lh1.h6 ♣ Current Balance
              .font-exp.mt2 {{balance}}
            .col-6.p3
              small.block.lh1.h6 ♣ Balance After
              .font-exp.mt2 {{balanceAfter}}
          button.h-bttm-bar.white.border-top.flex.col-12.pointer
            span.block.m-auto.font-exp Confirm
</template>

<script>
import { mapState } from 'vuex'
import { cloverImage, prettyBigNumber } from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'
export default {
  name: 'Clover',
  props: ['board'],
  components: { SymmetryIcons },
  data () {
    return {
      clover: null,
      confirmVisible: false
    }
  },
  computed: {
    ...mapState(['account', 'balance']),
    price () {
      return this.clover && this.clover.price && prettyBigNumber(this.clover.price, 0)
    },
    balanceAfter () {
      return this.balance - Number(this.price)
    },
    isMyClover () {
      return this.clover.owner === this.account
    },
    isForSale () {
      return true
    }
  },
  methods: {
    cloverImage,
    prettyBigNumber
  },
  created () {
    this.$store.dispatch('getClover', this.board)
      .then(clvr => { this.clover = clvr })
  }
}
</script>

<style scoped>
figure > .bg-contain{
  width:calc(100% - 4.8rem);
  height:calc(100% - 4.8rem);
  top:2.4rem;
  left:2.4rem;
}
.confirm-enter-active,.confirm-leave-active{transition:max-height var(--anim-timing-long);}
.confirm-enter, .confirm-leave-to{max-height: 0}
.confirm-leave, .confirm-enter-to{max-height: 24rem}
</style>
