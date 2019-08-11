<template lang="pug">
  .page-nav.mt3.pb4.mb4.md-mt0.md-pb4.mxn2.px1.sm-px2
    nav.flex.h5.green.items-center.justify-center(v-if='(canPrev || canNext) && hasResults')
      .col-6.flex.px1.sm-px2.justify-end
        button.pointer.px3.py2.border.rounded.hover-bg-l-green(:class="{ 'opacity-30': !canPrev }", @click="$emit('prev')", aria-label="Previous")
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
      .col-6.flex.px1.sm-px2
        button.pointer.px3.py2.border.rounded.hover-bg-l-green(:class="{ 'opacity-30': !canNext }", @click="$emit('next')", aria-label="Next")
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")
    .center.mt3(v-if="!canNext")
      span.h5.font-mono.bg-lightest-green.rounded.p2.px3.inline-block End of Results
</template>

<script>
export default {
  name: 'PageNav',
  props: ['hasResults', 'canPrev', 'canNext']
}
</script>
