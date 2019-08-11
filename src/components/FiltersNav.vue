<template lang="pug">
  .h4.md-h5.mxn2.mt3.mb3.pb1.sm-pb0.sm-mb2.px3.sm-px1.flex.flex-wrap.sm-flex-no-wrap.sm-justify-end
    //- filter by
    .col-6.sm-col-auto.my1.px1
      .center.select
        slot(name="filter")
    //- sort
    .col-6.sm-col-auto.my1.px1
      .center.select
        slot(name="sort")
    //- page nav
    .col-12.sm-col-auto.my1.px1(v-if="maxPages")
      .center.border.rounded-2.hover-bg-l-green
        .h-select.flex.items-center.justify-between.nowrap
          span.p2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !canPrev }", @click="$emit('prev')")
            img.block(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
          span.inline-block(style="padding-bottom:0.1em")
            | {{ page }} of {{ maxPages }}
          span.p2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !canNext }", @click="$emit('next')")
            img.block(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")
</template>

<script>
export default {
  name: 'FiltersNav',
  props: ['page', 'maxPages', 'canPrev', 'canNext']
}
</script>
