<template lang="pug">
  article.clover-item-border.rounded.overflow-hidden
    .relative.pb-ar-card
      header.absolute.col-12.top-0.left-0.pt2.px2
        h3.font-exp.h5.lh2 {{album.name}}
      figure.absolute.top-0.left-0.col-12(style="height:90%")
        .absolute.overlay.flex.items-end.justify-center(style="padding-bottom:24%")
          .col-7
            .relative.pb-100
              clv-svg.block.col-12.absolute.h-100.bottom-0.flex.items-center.justify-center(v-for="(clover, i) in album.clovers", v-if="i < 4", :byteBoard="clover", :size="196", :style="{left: i * 22 + '%', zIndex: -1 * i, borderRadius: '100%', boxShadow: '0px 0px 2px rgba(255,255,255,0.75)'}", :key="clover")
      footer.absolute.bottom-0.left-0.col-12.px1.pb1.flex.justify-between.items-center
        h6.col-9.truncate.h5
          router-link.inline-block.p1.hover-bg-l-green.trans-quick.rounded(:to="{name: 'User', params: {addr: this.album.userAddress}}") {{_userName}}
        .col-4.px1.flex.items-center.justify-end
          span.h5.font-mono {{album.clovers.length}}
          //- img.block(src="@/assets/icons/clover-icon-1.svg", style="width:0.66em; margin-left:0.175em")
</template>

<script>
import { cloverImage } from '@/utils'
import { mapGetters } from 'vuex'
import ClvSvg from '@/components/Clv--SVG'
export default {
  name: 'AlbumItem--Card',
  props: ['album'],
  computed: {
    ...mapGetters(['userName']),
    _userName () {
      return this.userName(this.album.user)
    },
    clovers () {
      console.log('compute clovers')
      // show most recent first
      const clvrs = JSON.parse(JSON.stringify(this.album.clovers))
      return clvrs.reverse()
    }
  },
  methods: {
    cloverImage
  },
  components: { ClvSvg }
}
</script>

<style>
</style>
