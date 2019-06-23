<template lang="pug">
  learn-frame
    .absolute.top-0.left-0.w-100.h-100.flex.items-center.justify-center
      basket(:count="clovers.length")
      transition(name="fade")
        row-of-clovers(v-if="showClovers", :clovers="visibleClovers", @endPlayMoves="step(1)")
      //- text
      .absolute.bottom-0.left-0.w-100.pb3.px2.center
        .font-ext.h4.md-h2(v-if="!showNextArrow", v-html="text")
        .mt2.sm-mt3(v-if="no === 1")
          button.border.rounded.bg-green.white.px3.py1.h5.pointer.nowrap(@click="step()") Continue
        down-arrow-btn(v-if="showNextArrow", v-on="$listeners")
          p.font-ext.h4.md-h2.px2(slot="text", v-html="text")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import RowOfClovers from './RowOfClovers'
import Basket from './Learn__Basket'
import DownArrowBtn from './Learn__DownArrowBtn'
export default {
  name: 'Learn_AboutRegistration',
  props: ['clovers', 'visible'],
  components: { LearnFrame, RowOfClovers, Basket, DownArrowBtn },
  data () {
    return {
      no: 0,
      text: 'Let’s look back at your clovers...',
      showClovers: true,
      showNextArrow: false
    }
  },
  computed: {
    syms () {
      return this.clovers.filter(clvr => clvr.symmetrical)
    },
    visibleClovers () {
      return this.no === 1 && this.syms.length ? this.syms : this.clovers
    }
  },
  methods: {
    step (step = null) {
      this.no = step ? step : this.no + 1
      switch (this.no) {
        case 1:
          const syms = this.syms
          this.text = syms.length ? `You found ${syms.length} symmetrical Clover${syms.length === 1 ? '' : 's'}!`
            : 'These aren’t symmetrical,<br>but you can still <b>collect</b> or <b>sell</b> them!'
          break
        case 2:
          this.text = 'To keep or sell a clover, you need to <b>register</b> it, first.'
          this.showNextArrow = true
          break
      }
    }
  },
  watch: {
    visible () {
      setTimeout(() => {
        this.showClovers = true
      }, 600)
    }
  }
}
</script>

<style>
</style>
