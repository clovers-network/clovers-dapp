<template lang="pug">
  article.pb2
      figure.pb-100.relative
        .absolute.top-0.left-0.col-12.h-100.flex.items-center.justify-center
          img.block(:src="cloverImage(clover, 108)", width="108", height="108")
      header.px1.pb1
        .px1.md-px2
          h3.h4.font-mono.truncate
            span(v-if="clover.name !== clover.board") {{clover.name}}
            span &nbsp;
        .mt2.flex
          .px1.col-6.md-px2
            h6.h7 Owner
            h4.h4.font-mono.truncate {{clover.owner}}
          .px1.col-6.md-px2
            h6.h7 Cost &clubs;
            h4.h4.font-mono.truncate {{prettyBigNumber(clover.price)}}
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

<style>
</style>
