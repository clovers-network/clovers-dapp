<template lang="pug">
  article.clover-item-border.rounded.overflow-hidden
    h3.pt1.px2.font-exp.h5.lh4 {{album.name}}
    figure.relative.mb1(style="padding-bottom:126%")
      .absolute.overlay.flex.items-end.justify-center(style="padding-bottom:20%")
        .col-7
          .relative.pb-100
            img.block.col-12.absolute.col-12.h-100.bottom-0(v-for="(clover, i) in album.clovers", v-if="i < 4", :src="cloverImage(clover, 128)", :style="{left: i * 22 + '%', zIndex: -1 * i, borderRadius: '100%', boxShadow: '0px 0px 2px rgba(255,255,255,0.75)'}")
    footer.px2.pb2.flex.justify-between
      h6.col-9.truncate.h5.lg-h4 [owner]
      .col-4.flex.items-center.justify-end
        img.block.mr1(src="@/assets/icons/clover-icon-1.svg", style="width:0.875em")
        span.h5.lg-h4 {{album.clovers.length}}
</template>

<script>
import { cloverImage } from '@/utils'
export default {
  name: 'AlbumItem--Card',
  props: ['album'],
  computed: {
    userName () {
      return 'You'
      // return this.$store.getters.userName(this.album.owner)
    },
    clovers () {
      // show most recent first
      const clvrs = JSON.parse(JSON.stringify(this.album.clovers))
      return clvrs.reverse()
    }
  },
  methods: {
    cloverImage
  }
}
</script>

<style>
</style>
