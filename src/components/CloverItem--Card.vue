<template lang="pug">
  article.relative
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
          h6.h7 Owner
          h4.h6.font-mono.truncate {{clover.owner}}
        .px1.col-6
          .pl1
            h6.h7 Price &clubs;
            h4.h6.font-mono.truncate {{prettyBigNumber(clover.price, 0)}}
</template>

<script>
import { cloverImage, prettyBigNumber, abbrvAddr } from '@/utils'
export default {
  name: 'CloverItem--Card',
  props: {
    clover: {type: Object, default: () => {}, required: true},
    borderLeft: false
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
