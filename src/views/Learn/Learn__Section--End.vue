<template lang="pug">
  learn-frame
    img.absolute.top-0.left-0.h-100.w-100(src="./learn-bg-clovers.svg", style="object-fit:cover")
    header.absolute.overlay.flex.items-center.justify-center
      h2.font-exp.h2 Have Fun!
    footer.absolute.bottom-0.left-0.w-100.flex.justify-center(style='padding-bottom:18vh')
      router-link.block.border.rounded.h4.font-ext.px4.flex.items-center(:to="{name: 'Field'}", style="height:2.7em") Go to Garden
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
export default {
  name: 'LearnSectionEnd',
  components: {
    LearnFrame,
    DownArrowBtn
  },
  mounted () {
    console.log('mounted')
    updateLocal()
  }
}

function updateLocal (key = 'first-visit', value = true) {
  if (!window.localStorage) return
  console.log({key, value})
  window.localStorage.setItem(key, JSON.stringify(value))
}

</script>

<style scoped>
@import '../../style/settings';
@media (--breakpoint-xs) {
  img{
    object-position: 35% top;
  }
}
</style>
