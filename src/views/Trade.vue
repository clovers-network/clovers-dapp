<template lang="pug">
  section
    header.flex.border-bottom
      .col-6.p3.border-right
        small.lh2.block ETH / ♣
        .font-exp.mt1 0.05
      .col-6.p3
        small.lh2.block Value (ETH)
        .font-exp.mt1 17,461.70
    section
      figure
        figcaption.pt2.pl3 7 Days, ETH
        img.block.col-12(src="/static/demo-chart.png")
    footer.sticky.left-0.bottom-0
      button.h-bttm-bar.bg-green.white.flex.col-12
        span.block.m-auto.font-exp Confirm
</template>

<script>
export default {
  name: 'Trade'
}
</script>

<style>
</style>
