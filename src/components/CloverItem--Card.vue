<template lang="pug">
  article.relative(v-if="clover.board", :class="{'red': isRFT}")
    .absolute.top-0.right-0.p2(v-if="isRFT", style="line-height:0")
      span.red.font-mono.h6.line-height-1 RFT
    .absolute.top-0.left-0.p2(style="line-height:0")
      chat-icon.block(
        :color="isRFT ? '#FF4136' : '#01B463'"
        v-if="clover.commentCount != 0"
        :count="clover.commentCount"
        :size="16"
        :blank="true"
        :invert="true")
    figure.pb-100.relative
      .absolute.top-0.left-0.col-12.h-100.flex.items-center.justify-center
        img.block.col-6(:src="cloverImage(clover, 128)")
    div.relative
      .absolute.top-0.left-0.col-12.h-10.flex.items-center.justify-center.mtn2
        symmetry-icons(v-if="clover", :board="clover.symmetries", style="font-size:8px")
    header.px1.pb2
      .px1
        h3.h4.font-mono.truncate
          span(v-if="clover.name !== clover.board") {{clover.name}}
          span &nbsp;
      .mt2.flex
        .px1.col-6
          h6.h7 {{isRFT ? 'Market Cap' : 'Owner'}}
          h4.h6.font-mono.truncate
            span(v-if="isRFT") ${{ marketCapInUSD.toFormat(2) }}
            span(v-else) {{owner}}
        .px1.col-6(v-if="isRFT || clover.price.toString(10) !== '0'")
          .pl1
            h6.h7 {{isRFT ? '&clubs; / Share' : 'Price &clubs;'}}
            h4.h6.font-mono.truncate
              span(v-if="isRFT") {{ priceInCollateral.toFormat(4) }}
              span(v-else) {{prettyBigNumber(clover.price, 0)}}
</template>

<script>
import utils from 'web3-utils'
import { cloverImage, prettyBigNumber, abbrvAddr, getUsername } from '@/utils'
import { mapState, mapGetters } from 'vuex'
import BigNumber from 'bignumber.js'
import ChatIcon from '@/components/Icons/ChatIcon'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'CloverItem--Card',
  props: {
    clover: {type: Object, default: () => {}, required: true},
    borderLeft: false
  },
  components: {
    ChatIcon, SymmetryIcons
  },
  computed: {
    marketContract () {
      return this.isRFT ? 'CurationMarket' : 'ClubTokenController'
    },
    collateral () {
      return this.isRFT ? '♣︎' : 'ETH'
    },
    owner () {
      const name = getUsername(this.clover.owner)
      return name || abbrvAddr(this.clover.owner)
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

    ...mapState(['ethPrice', 'clubTokenPrice']),
    ...mapGetters(['curationMarketAddress'])
  },
  methods: {
    cloverImage,
    prettyBigNumber
  }
}
</script>

<style scoped>
/* white dots to cover the intersections */
article{
  &:before,
  &:after{
    content:'';
    display: block;
    width:4px;
    height:4px;
    background:white;
    position: absolute;
  }
  &:before{
    top:-2px;
    left:-2px;
  }
  &:after{
    bottom:-2px;
    right:-2px;
  }
}
</style>
