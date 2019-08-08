<template>
  <article
    v-if="clover.board"
    :class="{'red': isRFT}"
    class="flex py2 relative">
    <!-- RFT highlight -->
    <div
      v-if="isRFT"
      class="absolute top-0 left-0 h-100 bg-red"
      style="width:4px"/>
    <!-- image -->
    <div class="col-3 center">
      <img
        :src="cloverImage(clover, 64)"
        width="64"
        height="64">
    </div>
    <!-- name -->
    <div
      :class="{'col-3': showOwnerCol, 'col-6': !showOwnerCol}"
      class="flex flex-column justify-center">
      <h3 class="h4 truncate font-mono">
        <span v-if="clover.name !== clover.board">{{ clover.name }}</span>
      </h3>
    </div>
    <!-- owner / RFT market cap -->
    <div
      v-if="showOwnerCol"
      class="col-3 flex flex-column justify-center px2">
      <template v-if="isRFT">
        <p class="h7 m0">Market Cap</p>
        <p class="h4 m0 truncate font-mono">${{ marketCapInUSD.toFormat(2) }}</p>
      </template>
      <template v-else>
        <h6 class="h7 m0">Owner</h6>
        <h5
          class="h4 m0 truncate font-mono"
          style="max-width:4.5em">{{ clover.owner }}</h5>
      </template>
    </div>
    <!-- price / RFT share -->
    <div class="col-2 flex flex-column justify-center pl1">
      <template v-if="isRFT">
        <p class="h7 m0">&clubs; / Share</p>
        <p class="h4 m0 truncate font-mono">{{ priceInCollateral.toFormat(4) }}</p>
      </template>
      <template v-else>
        <p class="h7 m0 nowrap">Price &clubs;</p>
        <p
          v-if="forSale(clover)"
          class="h4 m0 truncate">{{ cloverPrice(clover) }}</p>
        <p
          v-else
          class="h4 m0 font-mono">---</p>
      </template>
    </div>
    <!-- arrow -->
    <div class="col-1 center flex justify-center pr2">
      <img
        src="~../assets/icons/arrow-right.svg"
        width="18"
        height="18">
    </div>
  </article>
</template>

<script>
import utils from 'web3-utils'
import { mapState, mapGetters } from 'vuex'
import { cloverImage, prettyBigNumber } from '@/utils'
import BigNumber from 'bignumber.js'

export default {
  name: 'CloverItemRow',
  props: {
    clover: { type: Object, default: () => {}, required: true },
    hideOwner: false
  },
  computed: {
    isRFT () {
      // inCurationMarket
      return this.clover.owner === this.curationMarketAddress
    },
    showOwnerCol () {
      return this.isRFT || !this.hideOwner
    },
    marketContract () {
      return this.isRFT ? 'CurationMarket' : 'ClubTokenController'
    },
    collateral () {
      return this.isRFT ? '♣︎' : 'ETH'
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

    cloverPrice ({ price }) {
      const p = new BigNumber(price, 16)
      return prettyBigNumber(price, 0)
    },
    forSale ({ price }) {
      if (typeof price !== 'object') price = new BigNumber(price, 16)
      return price.gt(0)
    }
  }
}
</script>
