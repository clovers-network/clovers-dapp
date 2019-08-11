<template lang="pug">
  router-link.block.clover-item-border.rounded(:to="cloverLink(clover)", :class="{'red': isRFT}")
    .relative(v-if="clover.board")
      .absolute.top-0.left-0.p2(v-if="isRFT", style="line-height:0")
        span.red.font-mono.h6.line-height-1 RFT
      .absolute.top-0.right-0.p2
        symmetry-icons(v-if="clover", :board="clover.symmetries", style="font-size:8px")
      figure.pb-120.relative
        .absolute.top-0.left-0.col-12.h-100.flex.items-center.justify-center
          img.block.col-7(:src="cloverImage(clover, 128)")
      .relative
        .absolute.left-0.mtn2.col-12.flex.justify-center
          chat-icon.block(
            :color="isRFT ? '#FF4136' : '#01B463'"
            v-if="clover.commentCount != 0"
            :count="clover.commentCount"
            :size="16"
            :blank="true"
            :invert="false")
        .center.px2
          h3.h5.md-h4.truncate.rounded.p1.md-px2.block.inline-block.mx-auto(:class="{border: clover.name && clover.name !== clover.board}") {{ clover.name === clover.board ? '&nbsp;' : clover.name }}

      //- .px1
        p.m0.h6 Owner 0x098hhi8hf98379874
      .px1.pb2
        .mt2.flex.items-end.nowrap
          .px1.flex-auto
            h3.h5.md-h4.truncate {{ userName(clover.user) }}
          .px1.col-6.sm-col-5.flex.justify-end(v-if="isRFT || clover.price.toString(10) !== '0'")
            h4.h5.md-h4.flex.items-center
              coin-icon.block.mr1
              span(v-if="isRFT") {{ priceInCollateral.toFormat(4) }}
              span(v-else) {{ displayPrice }}

        //- .px1
        //-   h3.h4.truncate
        //-     span {{ clover.name }}
        //-     span &nbsp;
        //- .mt2.flex
        //-   .px1.col-6
        //-     h6.h7 {{isRFT ? 'Market Cap' : 'Owner'}}
        //-     h4.h6.font-mono.truncate
        //-       span(v-if="isRFT") ${{ marketCapInUSD.toFormat(2) }}
        //-       span(v-else) {{ userName(clover.user) }}
        //-   .px1.col-6(v-if="isRFT || clover.price.toString(10) !== '0'")
        //-     .pl1
        //-       h6.h7 {{ isRFT ? '&clubs; / Share' : 'Price &clubs;' }}
        //-       h4.h6.font-mono.truncate
        //-         span(v-if="isRFT") {{ priceInCollateral.toFormat(4) }}
        //-         span(v-else) {{ prettyBigNumber(clover.price, 0) }}
</template>

<script>
import utils from 'web3-utils'
import { cloverLink, cloverImage, prettyBigNumber, abbrvAddr, concatPrice } from '@/utils'
import { mapState, mapGetters } from 'vuex'
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
  components: { ChatIcon, CoinIcon, SymmetryIcons }
}
</script>
