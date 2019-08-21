<template lang="pug">
  .relative.w-100
    .overflow-x-scroll.touch-scroll.invisible-scrollbar.py4(ref="container")
      .center.nowrap(style="min-width:100%")
        .inline-block.px3.md-px1
        .inline-block.px3.md-px2.content-box(v-for="clover in clovers")
          figure
            clv(:moveString="clover.movesString", :autoPlay="true", v-on="$listeners")
            //- @endPlayMoves="step")
        .inline-block.px3.md-px2.content-box(v-show="canCreate && clovers.length < 3")
          button.block.pointer(@click="$emit('create')")
            img.block(src="./learn-icon-add-clover.svg", style="vertical-align: auto")
        .inline-block.px3.md-px1
</template>

<script>
export default {
  name: 'RowOfClovers',
  props: ['clovers', 'canCreate'],
  methods: {
    scrollToEnd () {
      this.$nextTick(() => {
        const container = this.$refs.container
        if (container.scrollWidth > container.offsetWidth) {
          return container.scroll(container.scrollWidth * 2, 0)
        }
      })
    }
  }
}
</script>

<style scoped>
@import '../../style/settings';
figure, button{
  width:162px;
}
</style>
