<template lang="pug">
  ul.list-reset.flex.flex-wrap.m0.overflow-hidden
    li(v-for="(clover, i) in clovers", :key="clover.board", class="col-6 sm-col-4 md-col-3")
      router-link(:to="cloverLink(clover)", class="block green border-bottom border-bottom-dotted border-right border-right-dotted", :class="{'xs-border-right-transp': i % 2 === 1, 'sm-border-right-transp': i % 3 === 2, 'md-border-right-transp': i % 4 === 3}")
        clover-item(:clover="clover")
</template>

<script>
import CloverItem from '@/components/CloverItem--Card'
import { cloverLink } from '@/utils'
export default {
  name: 'CloverList--Cards',
  props: ['clovers'],
  components: { CloverItem },
  methods: { cloverLink }
}
</script>

<style>
</style>
