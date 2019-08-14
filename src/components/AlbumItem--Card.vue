<template lang="pug">
  article.clover-item-border.rounded
    h3.pt2.px2.font-exp.h5 {{album.name}}
    figure.relative(style="padding-bottom:114.14634146%")
    footer.px2.pb2.flex.justify-between
      h6.col-9.truncate.h5.md-h4 {{ userName }}
      .col-4.flex.items-center.justify-end
        img.block.mr1(src="@/assets/icons/clover-icon-1.svg", style="width:0.875em")
        span.h5.md-h4 {{album.clovers.length}}
</template>

<script>
export default {
  name: 'AlbumItem--Card',
  props: ['album'],
  computed: {
    userName () {
      return 'You'
      // return this.$store.getters.userName(this.album.owner)
    }
  }
}
</script>

<style>
</style>
