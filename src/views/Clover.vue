<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between(v-if="clover")
    header.mt-header-h.flex.border-bottom
      .col-6.p3.border-right
        small.block.lh1.h6 Current Owner
        .font-exp.mt2.truncate.overflow-hidden {{ clover.owner }}
      .col-6.p3
        small.block.lh1.h6 Original Price
        .font-exp.mt2 {{ originalPrice }} ♣
    //- section
      button.h-header.center.border-bottom.flex.pointer.col-12
        span.block.m-auto See Full History
    figure.flex-auto.relative
      .absolute.p2
        symmetry-icons.p1(:board="clover.symmetries")
      .absolute.bg-contain.bg-center.bg-no-repeat(role="img", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer.bg-green(v-if="!isMyClover && canBuy")
      button.h-bttm-bar.white.flex.col-12.pointer(@click="confirmVisible = !confirmVisible")
        span.block.m-auto.font-exp Buy for {{price}} ♣
      transition(name="confirm")
        section.white(v-show="confirmVisible")
          .border-top.flex.border-bottom
            .col-6.p3.border-right
              small.block.lh1.h6 ♣ Current Balance
              .font-exp.mt2 {{ balance }}
            .col-6.p3
              small.block.lh1.h6 ♣ Balance After
              .font-exp.mt2 {{ balanceAfter }}
          button(@click="buy(clover)").h-bttm-bar.white.border-top.flex.col-12.pointer
            span.block.m-auto.font-exp Confirm
    footer(v-else).bg-green
      .h-bttm-bar.white.border-top.flex.col-12
        span.block.m-auto.font-exp Unavailable
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { cloverImage, prettyBigNumber, bnMinus, makeBn } from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'Clover',
  props: {
    board: { type: String, required: true }
  },
  data () {
    return {
      clover: null,
      confirmVisible: false
    }
  },
  computed: {
    price () {
      return this.clover && this.clover.price && prettyBigNumber(this.clover.price, 0)
    },
    originalPrice () {
      return this.clover && this.clover.originalPrice && prettyBigNumber(this.clover.price, 0)
    },
    balanceAfter () {
      if (!this.user) return
      return bnMinus(this.user.balance, this.clover.price, 0)
    },
    isMyClover () {
      return this.clover.owner === this.account
    },
    balance () {
      if (!this.user) return
      return prettyBigNumber(this.user.balance, 0)
    },
    canBuy () {
      if (!this.user) return false
      if (!makeBn(this.price).gt(0)) return false
      return makeBn(this.balanceAfter).gte(0)
    },

    ...mapState(['account', 'user'])
  },
  methods: {
    cloverImage,
    prettyBigNumber,

    ...mapActions([
      'buy'
    ])
  },
  created () {
    this.$store.dispatch('getClover', this.board)
      .then(clvr => { this.clover = clvr })
  },
  components: { SymmetryIcons }
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
