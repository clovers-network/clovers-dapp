<template lang="pug">
  article.clover-item-border.rounded.overflow-hidden.relative.pb-ar-card.bg-white
    .absolute.overlay.flex.flex-column.justify-between
      header.col-12.pt2.pb1.sm-py2.px2
        h3.font-exp.h5.lh2 {{album.name}}
      figure.col-12.flex.flex-wrap.justify-end(style="flex:1 0 auto; align-content:flex-start; padding:0 .8rem 0; transform:scale(-1);")
        .col-4.flex.items-center.justify-center(v-for="(clover, i) in clvrs", v-if="i < 12", style="padding:0.25vw 0.3vw")
          clv-svg.block(:byteBoard="clover", :size="196", :key="clover", style="transform:scale(-1)")
      footer.col-12.px1.pt1.pb1.flex.justify-between.items-center
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
  data () {
    return {
      clvrs: []
    }
  },
  computed: {
    ...mapGetters(['userName']),
    _userName () {
      return this.userName(this.album.user)
    }
  },
  created () {
    this.clvrs = JSON.parse(JSON.stringify(this.album.clovers))
    this.clvrs.reverse()
  },
  methods: {
    cloverImage
  },
  components: { ClvSvg }
}
</script>

<style>
</style>
