<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between(v-if="clover")
    .mt-header-h.px3.py2.border-bottom
      p.m0.truncate.center.font-mono {{ clover.name }}
    header.flex.border-bottom
      //- owner
      .col-6.p3.border-right
        small.block.lh1.h6 Current Owner
        .font-exp.mt2.truncate.overflow-hidden {{ isMyClover ? 'You' : owner }}
      //- price / value
      .col-6.p3
        small.block.lh1.h6 {{showSalePrice ? 'For Sale' : 'Original Price'}}
        .font-exp.mt2 {{ showSalePrice ? prettyPrice : originalPrice }} ♣
    //- section
      button.h-header.center.border-bottom.flex.pointer.col-12
        span.block.m-auto See Full History
    figure.flex-auto.relative(@click="sellView = false")
      .absolute.p2.z1
        symmetry-icons.p1(:board="clover.symmetries")
      .absolute.bg-contain.bg-center.bg-no-repeat(role="img", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer
      div(v-if="isMyClover")
        small.border-top.center.p2.block.h6(v-show="!sellView") You currently own this Clover
        .bg-green.flex.white.font-exp.h-bttm-bar.justify-center(v-show="!sellView")
          button.col-6.flex(:class="{'border-right': !sellView}", @click="sellView = !sellView")
            span.block.m-auto Sell
          button.col-6.flex(v-show="!sellView")
            span.block.m-auto RFT
        //- sellView
        .bg-green.white(v-show="sellView")
          .p3.border-top.border-bottom
            label.h6.lh1.block List for
            .relative
              input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="sellPrice", min="0")
              span.absolute.top-0.right-0.h-100.opacity-50.flex
                span.block.m-auto ♣
          button(@click="makeSell").h-bttm-bar.flex.col-12.border-top.pointer
            span(v-if="!loading").block.m-auto.font-exp Confirm
            wavey-menu.m-auto(v-else :isWhite="true")
      .bg-green(v-else-if="canBuy")
        button.h-bttm-bar.white.flex.col-12.pointer(@click="confirmVisible = !confirmVisible")
          span.block.m-auto.font-exp Buy for {{prettyPrice}} ♣
        transition(name="confirm")
          section.white(v-show="confirmVisible")
            .border-top.flex.border-bottom
              .col-6.p3.border-right
                small.block.lh1.h6 ♣ Current Balance
                .font-exp.mt2 {{ prettyUserBalance }}
              .col-6.p3
                small.block.lh1.h6 ♣ Balance After
                .font-exp.mt2 {{ balanceAfter }}
            button(@click="makeBuy").h-bttm-bar.white.border-top.flex.col-12.pointer
              span(v-if="!loading").block.m-auto.font-exp Confirm
              wavey-menu.m-auto(v-else :isWhite="true")
      .bg-green(v-else)
        .h-bttm-bar.white.border-top.flex.col-12
          span.block.m-auto.font-exp Unavailable
</template>

<script>
import utils from 'web3-utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'
import { mapState, mapActions, mapGetters } from 'vuex'
import {
  cloverImage,
  prettyBigNumber,
  bnMinus,
  makeBn,
  addrToUser
} from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'Clover',
  props: {
    board: { type: String, required: true }
  },
  data () {
    return {
      localClover: null,
      confirmVisible: false,
      sellView: false,
      sellPrice: 0,
      loading: false
    }
  },
  computed: {
    showSalePrice () {
      return this.clover && this.clover.price && this.clover.price.gt(0)
    },
    sellPriceWei () {
      return this.sellPrice ? utils.toWei(this.sellPrice) : '0'
    },
    owner () {
      return addrToUser(this.allUsers, this.clover.owner)
    },
    prettyPrice () {
      return prettyBigNumber(this.clover.price, 0)
    },
    price () {
      return this.clover && this.clover.price
    },
    originalPrice () {
      return (
        this.clover &&
        this.clover.originalPrice &&
        prettyBigNumber(this.clover.price, 0)
      )
    },
    balanceAfter () {
      if (!this.userBalance) return false
      return bnMinus(this.userBalance, this.price, 0)
    },
    isMyClover () {
      return (
        this.clover &&
        this.clover.owner &&
        this.account &&
        this.clover.owner.toLowerCase() === this.account.toLowerCase()
      )
    },
    clover () {
      let cloverIndex = this.allClovers.findIndex(c => c.board === this.board)
      return cloverIndex >= 0 ? this.allClovers[cloverIndex] : this.localClover
    },
    canBuy () {
      if (!this.user) return false
      if (!makeBn(this.price).gt(0)) return false
      // return makeBn(this.balanceAfter).gte(0)
      return true
    },
    ...mapState(['account', 'allUsers', 'allClovers']),
    ...mapGetters(['prettyUserBalance', 'user', 'userBalance'])
  },
  methods: {
    async makeBuy () {
      if (this.loading) return
      try {
        this.loading = true
        await this.buy(this.clover)
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    async makeSell () {
      if (this.loading) return
      try {
        this.loading = true
        await this.sell({ clover: this.clover, price: this.sellPriceWei })
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    cloverImage,
    prettyBigNumber,
    ...mapActions(['buy', 'sell'])
  },
  created () {
    if (this.clover) return
    this.$store.dispatch('getClover', this.board).then(clvr => {
      this.localClover = clvr
    })
  },
  components: { SymmetryIcons, WaveyMenu }
}
</script>

<style scoped>
figure > .bg-contain {
  width: calc(100% - 4.8rem);
  height: calc(100% - 4.8rem);
  top: 2.4rem;
  left: 2.4rem;
}
.confirm-enter-active,
.confirm-leave-active {
  transition: max-height var(--anim-timing-long);
}
.confirm-enter,
.confirm-leave-to {
  max-height: 0;
}
.confirm-leave,
.confirm-enter-to {
  max-height: 24rem;
}
</style>
