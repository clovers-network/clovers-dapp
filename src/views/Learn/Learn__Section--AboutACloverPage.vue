<template lang="pug">
  learn-frame.flex.items-center.justify-center
    header.absolute.w-100.top-0.left-0.font-ext.h4.md-h2.px3.md-px4.flex.items-center.justify-center.center(style="height:16vh") 
      slot(name="header")
    .relative.px-1.pb2.sm-pb0(style="padding-top:14vmin")
      slot(name="graphic")
      //- img.block(src="./imgs/market.svg", style="height:70vmin;max-height:60vw")
      .absolute.bottom-0.left-0.w-100(style="background:linear-gradient(to bottom, transparent, white 50%); height:16vmin")
    .absolute.bottom-0.left-0.w-100.pb3.px2.center.z2
      down-arrow-btn(v-on="$listeners")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
export default {
  name: 'Learn__Section--AboutACloverPage',
  components: { LearnFrame, DownArrowBtn }
}
</script>

<style>
</style>
