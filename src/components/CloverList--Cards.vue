<template lang="pug">
  ul.list-reset.flex.flex-wrap.my0.mxn2
    li.px1.mb2.sm-px2.sm-mb3.col-6.md-col-4.lg-col-3(v-for="(clover, i) in clovers", :key="clover.board")
      clover-item(:clover="clover")
</template>

<script>
import CloverItem from '@/components/CloverItem--Card'

export default {
  name: 'CloverListCards',
  components: { CloverItem },
  props: ['clovers']
}
</script>
