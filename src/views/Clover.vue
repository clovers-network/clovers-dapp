<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between
    header
      .mt-header-h.px3.py2.border-bottom
        p.m0.truncate.center.font-mono(v-if="clover") {{ clover.name }}
      .flex.border-bottom.h-bttm-bar
        //- owner
        .col-6.px3.border-right.flex
          .col-12.m-auto
            small.block.lh1.h6 Current Owner
            .font-exp.mt1.truncate.overflow-hidden {{currentOwner}}
        //- price / value
        .col-6.px3.flex
          .col-12.m-auto
            small.block.lh1.h6 {{ isRFT ? 'Share Price' : showSalePrice ? 'For Sale' : 'Original Price'}}
            .font-exp.mt1 {{ isRFT ? 'n/a' : showSalePrice ? prettyPrice : originalPrice }} ♣
    //- clover image
    figure.flex-auto.relative.p3.md-p4.flex.items-center.justify-center(@click="view = false")
      .absolute.p2.z1.top-0.left-0
        symmetry-icons(v-if="clover", :board="clover.symmetries")
      clv.col-12(v-if="clover", :moveString="cloverMovesString", :isRFT="isRFT", :style="'max-width:' + maxImgW + 'px'")
      //- sizer
      .img-sizer.absolute(ref="sizer")
    footer
      //- Owner Options
      div(v-if="isMyClover")
        //- Sell / RFT Options
        small.border-top.center.p2.block.h6(v-show="!view") You currently own this Clover
        .bg-green.flex.white.font-exp.h-bttm-bar.justify-center(v-show="!view")
          button.col-6.flex.border-right(@click="view = 'sell'")
            span.block.m-auto Sell
          button.col-6.flex(@click="view = 'RFT'")
            span.block.m-auto RFT
        //- sellView
        .bg-green.white(v-show="view === 'sell'")
          .p3.border-top.border-bottom
            label.h6.lh1.block List for
            .relative
              input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="sellPrice", min="0")
              span.absolute.top-0.right-0.h-100.opacity-50.flex
                span.block.m-auto ♣
          button(@click="makeSell").h-bttm-bar.flex.col-12.border-top.pointer
            span(v-if="!loading").block.m-auto.font-exp Confirm
            wavey-menu.m-auto(v-else :isWhite="true")
        //- RFTview
        .bg-green.white(v-show="view === 'RFT'")
          .h-bttm-bar.font-exp.flex.border-bottom
            span.block.m-auto Make Public
          .p3
            p.mb3 Convert this clover into a publicly traded asset.
            label.block.h6 Initial invesment&nbsp; <span class="opacity-50">(optional)</span>
            .relative
              input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="invesment", min="0")
              span.absolute.top-0.right-0.h-100.opacity-50.flex
                span.block.m-auto ♣
          button.h-bttm-bar.flex.border-top.col-12(@click="makeRFT")
            span(v-if="!loading").block.m-auto.font-exp Confirm
            wavey-menu.m-auto(v-else :isWhite="true")
      //- is RFT
      div(v-else-if="isRFT")
        small.border-top.center.p2.block.h6(v-show="!view") This Clover is an RFT
        .border-top.flex.h-bttm-bar
          .col-6.px3.border-right.flex
            .col-12.m-auto
              small.block.h6.lh1 Shares Owned
              .font-exp.mt1 n/a
          .col-6.px3.flex
            .col-12.m-auto
              small.block.h6.lh1 Total Share Value ♣
              .font-exp.mt1 n/a
        .bg-green.white.flex.h-bttm-bar.font-exp
          button.col-6.flex.border-right
            span.block.m-auto Sell
          button.col-6.flex
            span.block.m-auto Buy
      //- Buy
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
      //- Unavailable
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
import Clv from '@/components/Clv'
import Reversi from 'clovers-reversi'
const reversi = new Reversi()

export default {
  name: 'Clover',
  props: {
    board: { type: String, required: true }
  },
  data () {
    return {
      localClover: null,
      confirmVisible: false,
      view: null,
      sellPrice: 0,
      invesment: 0,
      loading: false,
      maxImgW: 0
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
      return this.clover && addrToUser(this.allUsers, this.clover.owner)
    },
    prettyPrice () {
      return prettyBigNumber(this.clover.price, 0)
    },
    price () {
      return this.clover && this.clover.price
    },
    investmentInWei () {
      return this.invesment ? utils.toWei(this.invesment) : '0'
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
        this.clover.owner.toLowerCase() === this.account
      )
    },
    isRFT () {
      return this.clover && this.clover.owner.toLowerCase() === this.curationMarketAddress
    },
    currentOwner () {
      const owner = this.clover && this.clover.owner
      return !owner ? '-'
        : this.isMyClover ? 'You'
          : this.isRFT ? 'Curation Mrkt.'
            : owner.toLowerCase() === this.cloversBankAddress ? this.price > 0 ? 'Clovers' : 'Pending...' : owner
    },
    clover () {
      let cloverIndex = this.allClovers.findIndex(c => c.board === this.board)
      return cloverIndex >= 0 ? this.allClovers[cloverIndex] : this.localClover
    },
    cloverMovesString () {
      const mvs = this.clover && this.clover.moves && this.clover.moves[0]
      return mvs && reversi.byteMovesToStringMoves(...mvs)
    },
    canBuy () {
      if (!this.user) return false
      if (!makeBn(this.price).gt(0)) return false
      // return makeBn(this.balanceAfter).gte(0)
      return true
    },
    ...mapState(['account', 'allUsers', 'allClovers']),
    ...mapGetters(['prettyUserBalance', 'user', 'userBalance', 'curationMarketAddress'])
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
    async makeRFT () {
      if (this.loading) return
      try {
        this.loading = true
        await this.makeCloverRFT({ board: this.clover.board, investmentInWei: this.investmentInWei })
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    },
    setImgSizer () {
      this.maxImgW = this.$refs.sizer && this.$refs.sizer.offsetHeight
    },
    cloverImage,
    prettyBigNumber,
    ...mapActions(['buy', 'sell', 'makeCloverRFT'])
  },
  created () {
    if (this.clover) return
    this.$store.dispatch('getClover', this.board).then(clvr => {
      this.localClover = clvr
    })
  },
  mounted () {
    this.setImgSizer()
  },
  components: { SymmetryIcons, WaveyMenu, Clv }
}
</script>

<style scoped>
figure > .img-sizer {
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
