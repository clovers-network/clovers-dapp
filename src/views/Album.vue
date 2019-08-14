<template lang="pug">
  article.mt3.md-my4.pb4
    header.col-12.px1.sm-px2.md-px1.mb2.flex
      .mx1.px2.pt2.pb2.col-12.clover-item-border.rounded.flex.flex-column.justify-between
        h1.col-12.h2.font-exp.mt1.px1.pb2(style="min-height:4.5em") {{album.name}}
        small.block.col-12.flex.items-center.sm-items-end.justify-between.sm-p1.pr1
          h6
            router-link.h5.mr2.inline-block.px2.py1.bg-lightest-green.rounded.border.border-transparent.hover-border-green(:to="{name: 'User', params: {addr: album.owner}}") [username]
            span.h6.sm-h5 &larr;&nbsp; Editor
          h6.h5.sm-h4.flex.items-center.pt1
            | {{album.clovers.length}}
            img.block.ml1(src="@/assets/icons/clover-icon-1.svg", style="width:0.875em;")
    section.px1.flex.flex-wrap
      template(v-for="n in 4")
        //- item
        .col-4.sm-col-4.md-col-3.lg-w-20.sm-px1.sm-my1(v-for="clover in album.clovers")
          //- border
          article.album__clover.block.pb-100.relative.border-transparent.border-dashed.hover-border-green.hover-shadow.trans-quick.rounded
            router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'Clover', params: {board: clover}}")
              img.block.col-8.sm-col-9(:src="cloverImage(clover, 128)")
            //- TODO show for owner !!
            //- button.absolute.top-0.right-0.m1.border.rounded-full.bg-lightest-green.pointer.trans-quick.opacity-50(style="padding:0.4rem")
              svg-x(style="width:0.6rem;height:0.6rem")
</template>

<script>
import { cloverImage } from '@/utils'
import svgX from '@/components/Icons/SVG-X'
export default {
  name: 'Album',
  props: ['id'],
  computed: {
    album () {
      return this.$store.state.albums[this.id]
    }
  },
  methods: {
    cloverImage
  },
  components: { svgX }
}
</script>

<style>
@media (hover:hover) {
  .album__clover{
    & button{
      opacity:0;
    }
    &:hover button{
      opacity:1;
    }
  }
}
</style>
