<template lang="pug">
  router-link.block.clover-item-border.rounded(:to="cloverLink(clover)", :class="{'red': isRFT}")
    article.relative.pb-ar-card(v-if="clover.board")
      .absolute.overlay.flex.flex-column.justify-between.pt1.sm-pt2
        //- symm icons
        header.absolute.top-0.right-0.p1.sm-p2
          symmetry-icons(v-if="clover", :board="clover.symmetries", style="font-size:8px")
        figure.pb-100.relative.md-mt1
          .absolute.overlay.flex.flex.items-center.justify-center
            //- img.block.col-7(:src="cloverImage(clover, 128)")
            clv-svg.col-7(:byteBoard="clover.board", :size="128")
          .absolute.bottom-0.left-0.col-12.flex.justify-center(style="padding-bottom:.1em")
            chat-icon.block(
              :color="isRFT ? '#FF4136' : '#01B463'"
              v-if="clover.commentCount != 0"
              :count="clover.commentCount"
              :size="16"
              :blank="true"
              :invert="false")
        .px2.flex.items-center.lg-pb1
          h3.h5.lh2.sm-h6.md-h4.truncate.rounded.p1.md-px2.mx-auto(:class="{border: clover.name && clover.name !== clover.board}") {{ clover.name === clover.board ? '&nbsp;' : clover.name }}

        footer.px1.pb2.flex.items-center.nowrap
          h3.flex-auto.lh1
            router-link.p1.h5.md-h4.lg-h5.truncate.hover-bg-l-green.rounded.trans-quick(:to="{name: 'User', params: {addr: clover.user.address}}", v-if="clover.user") {{ userName(clover.user) }}
          h4.px1.col-6.sm-col-5.flex.justify-end.lh1(v-if="clover.price.toString(10) !== '0'")
            .h5.md-h4.lg-h5.flex.items-center
              | {{ displayPrice }}
              coin-icon(style="margin-left:0.3em", :width="12")
</template>

<script>
import utils from 'web3-utils'
import { cloverLink, cloverImage, prettyBigNumber, abbrvAddr, concatPrice } from '@/utils'
import { mapState, mapGetters } from 'vuex'
import ClvSvg from '@/components/Clv--SVG'
import BigNumber from 'bignumber.js'
import ChatIcon from '@/components/Icons/ChatIcon'
import CoinIcon from '@/components/Icons/CoinIcon'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'CloverItemCard',
  props: {
    clover: { type: Object, default: () => {}, required: true }
  },
  computed: {
    marketContract () {
      return this.isRFT ? 'CurationMarket' : 'ClubTokenController'
    },
    isRFT () {
      // inCurationMarket
      return this.clover.owner === this.curationMarketAddress
    },
    priceInCollateral () {
      if (!this.clover.lastOrder) return new BigNumber(0)
      let recent = this.clover.lastOrder
      return new BigNumber(recent.value).div(new BigNumber(recent.tokens))
    },
    priceInEth () {
      if (this.marketContract === 'CurationMarket') {
        return this.priceInCollateral.div(new BigNumber(utils.fromWei(this.clubTokenPrice)))
      } else {
        return this.priceInCollateral
      }
    },
    priceInUSD () {
      return this.priceInEth.times(new BigNumber(this.ethPrice))
    },
    totalSupplyWei () {
      if (!this.clover.lastOrder) return new BigNumber(0)
      return new BigNumber(this.clover.lastOrder.tokenSupply)
    },
    totalSupply () {
      return new BigNumber(
        utils.fromWei(this.totalSupplyWei.round().toString(10))
      )
    },
    marketCapInCollateralWei () {
      return this.priceInCollateral.times(this.totalSupplyWei)
    },
    marketCapInCollateral () {
      return new BigNumber(
        utils.fromWei(this.marketCapInCollateralWei.round().toString(10))
      )
    },
    marketCapInUSD () {
      return this.totalSupply.times(this.priceInUSD)
    },
    cloverPrice () {
      return prettyBigNumber(this.clover.price, 0)
    },
    displayPrice () {
      return concatPrice(this.cloverPrice)
    },

    ...mapState(['ethPrice', 'clubTokenPrice']),
    ...mapGetters(['curationMarketAddress', 'userName'])
  },
  methods: { cloverLink, cloverImage, prettyBigNumber },
  components: { ClvSvg, ChatIcon, CoinIcon, SymmetryIcons }
}
</script>
