<template lang="pug">
  article.clover-item-border.rounded.overflow-hidden
    .relative.pb-ar-card.bg-white
      header.absolute.col-12.top-0.left-0.pt2.px2
        h3.font-exp.h5.lh2 {{album.name}}
      figure.absolute.top-0.left-0.col-12(style="height:90%")
        .absolute.overlay.flex.items-end.justify-center(style="padding-bottom:24%")
          .col-7
            .relative.z1.pb-100
              clv-svg.block.col-12.absolute.h-100.bottom-0.flex.items-center.justify-center(v-for="(clover, i) in clvrs", v-if="i < 4", :byteBoard="clover", :size="196", :style="{left: i * 22 + '%', zIndex: -1 * i, borderRadius: '100%', boxShadow: '0px 0px 2px rgba(255,255,255,0.75)'}", :key="clover")
              //- clv-svg.block.col-12.absolute.h-100.bottom-0.flex.items-center.justify-center(v-for="(clover, i) in album.clovers", v-if="i > 0 && i < 4", :byteBoard="clover", :size="196", :style="{left: i * 22 + '%', zIndex: -1 * i, borderRadius: '100%', boxShadow: '0px 0px 2px rgba(255,255,255,0.75)'}", :key="clover")
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
  props: ['album', 'animation'],
  data () {
    return {
      // active: 0 // top clover of card
      clvrs: [],
      anim: null
    }
  },
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
    },
    qty () {
      return this.animation ? 10 : 4
    }
  },
  methods: {
    cloverImage,
    animate () {
      clearTimeout(this.anim)
      if (!this.animation) return
      this.anim = setTimeout(() => {
        requestAnimationFrame(() => {
          // const first = this.clvrs.pop()
          this.clvrs = [this.clvrs.pop(), ...this.clvrs] // .push(this.clvrs.shift()) // push removed first to end of array
          this.animate()
        })
      }, 600)
    },
    pause () {
      clearTimeout(this.anim)
    }
  },
  created () {
    this.clvrs = this.album.clovers.slice(0, this.qty)
  },
  mounted () {
    this.animate()
  },
  components: { ClvSvg }
}
</script>

<style>
</style>
