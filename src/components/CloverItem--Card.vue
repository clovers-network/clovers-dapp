<template lang="pug">
  article.relative(v-if="clover.board", :class="{'red': isRFT}")
    .absolute.top-0.right-0.p2(v-if="isRFT", style="line-height:0")
      span.red.font-mono.h6.line-height-1 RFT
    figure.pb-100.relative
      .absolute.top-0.left-0.col-12.h-100.flex.items-center.justify-center
        img.block.col-6(:src="cloverImage(clover, 128)")
    header.px1.pb2
      .px1
        h3.h4.font-mono.truncate
          span(v-if="clover.name !== clover.board") {{clover.name}}
          span &nbsp;
      .mt2.flex
        .px1.col-6
          h6.h7 {{isRFT ? 'Market Cap' : 'Owner'}}
          h4.h6.font-mono.truncate
            span(v-if="isRFT") 0
            span(v-else) {{clover.owner}}
        .px1.col-6
          .pl1
            h6.h7 {{isRFT ? '&clubs; / Share' : 'Price &clubs;'}}
            h4.h6.font-mono.truncate
              span(v-if="isRFT") 0
              span(v-else) {{prettyBigNumber(clover.price, 0)}}
</template>

<script>
import { cloverImage, prettyBigNumber, abbrvAddr } from '@/utils'
import { mapGetters } from 'vuex'
import BigNumber from 'bignumber.js'
export default {
  name: 'CloverItem--Card',
  props: {
    clover: {type: Object, default: () => {}, required: true},
    borderLeft: false
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
