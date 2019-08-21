<template lang="pug">
  learn-frame
    img.absolute.top-0.left-0.h-100.w-100(src="./learn-bg-clovers.svg", style="object-fit:cover")
    header.absolute.overlay.flex.items-center.justify-center
      .center.px2
        h1.font-exp.h1.mb4.lh1
          span.h5 Welcome to <br>Clovers
        h6.font-reg.h3 A brief guide on these cryptographic&nbsp;icons,<br> and the Clovers network
    down-arrow-btn(v-on="$listeners")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
export default {
  name: 'LearnSectionIntro',
  components: {
    LearnFrame,
    DownArrowBtn
  },
  methods: {
    setVisited () {
      updateLocal()
    }
  }
}

function updateLocal (key = 'first-visit', value = true) {
  if (!window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

</script>

<style scoped>
@import '../../style/settings';
@media (--breakpoint-xs) {
  img{
    object-position: 72% top;
    object-fit: auto 100%;
  }
}
</style>
