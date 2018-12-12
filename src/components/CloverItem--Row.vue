<template>
  <article v-if="clover.board" class="flex py2 relative">
    <!-- RFT highlight -->
    <div v-if="isRFT" class="absolute top-0 left-0 h-100 bg-red" style="width:4px"></div>
    <!-- image -->
    <div class="col-3 center">
      <img :src="cloverImage(clover, 64)" width="64" height="64"/>
    </div>

    <div class="col-3 flex flex-column justify-center">
      <h3 class="h4 truncate font-mono">
        <span v-if="clover.name !== clover.board">{{ clover.name }}</span>
      </h3>
    </div>

    <div class="col-3 flex flex-column justify-center px2">
      <template v-if="isRFT">
        <p class="h7 m0">Market Cap &clubs;</p>
        <p class="h4 m0 truncate font-mono">0</p>
      </template>
      <template v-else>
        <h6 class="h7 m0">Owner</h6>
        <h5 class="h4 m0 truncate font-mono" style="max-width:4.5em">{{clover.owner}}</h5>
      </template>
    </div>

    <div class="col-2 flex flex-column justify-center pl1">
      <template v-if="isRFT">
        <p class="h7 m0">&clubs; / Share</p>
        <p class="h4 m0 truncate font-mono">0</p>
      </template>
      <template v-else>
        <p class="h7 m0 nowrap">Price &clubs;</p>
        <p v-if="forSale(clover)" class="h4 m0 truncate">{{ cloverPrice(clover) }}</p>
        <p v-else class="h4 m0 font-mono">---</p>
      </template>
    </div>

    <div class="col-1 center flex justify-center pr2">
      <img src="~../assets/icons/arrow-right.svg" width="18" height="18"/>
    </div>
  </article>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage, prettyBigNumber } from '@/utils'
import BigNumber from 'bignumber.js'
export default {
  name: 'CloverItem--Row',
  props: {
    clover: {type: Object, default: () => {}, required: true}
  },
  computed: {
    isRFT () {
      // inCurationMarket
      return this.clover.owner === this.curationMarketAddress
    },
    ...mapGetters(['curationMarketAddress'])
  },
  methods: {
    cloverImage,
    cloverPrice ({ price }) {
      return prettyBigNumber(price, 0)
    },
    forSale ({ price }) {
      if (typeof price !== 'object') price = new BigNumber(price)
      return price.gt(0)
    }
  }
}
</script>

<style>
</style>
