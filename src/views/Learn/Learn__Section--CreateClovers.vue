<template lang="pug">
  learn-frame
    .absolute.top-0.left-0.w-100.h-100.flex.items-center
      //- basket
      basket(:count="clovers.length", v-show="showBasket")
        h6.mr2.right-align.h6.sm-h5 Your clovers are saved to your <b>Basket</b> &rarr;
      //- clovers
      row-of-clovers(ref="cloverList", :clovers="clovers", :canCreate="canCreate", @create="create", @endPlayMoves="step")
    //- text
    .absolute.bottom-0.left-0.w-100.pb3.px3.center
      .font-ext.h3.sm-h2(v-if="!showDoneBtn && !showNextArrow", v-html="text")
      button.inline-block.bg-green.white.rounded.px3.py1.h4.pointer(v-if="showDoneBtn", @click="end") Continue
      down-arrow-btn(v-if="showNextArrow", v-on="$listeners")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
import Basket from './Learn__Basket'
import RowOfClovers from './RowOfClovers'
import Reversi from 'clovers-reversi'
import { cloverIsMonochrome } from '@/utils'
const clover = new Reversi()
export default {
  name: 'LearnSectionCreateClovers',
  components: { LearnFrame, DownArrowBtn, Basket, RowOfClovers },
  props: ['clovers'],
  data () {
    return {
      no: 0,
      text: 'You can create clovers in your browser.',
      canCreate: true,
      noLimit: false,
      showBasket: false,
      showNextArrow: false
    }
  },
  computed: {
    showDoneBtn () {
      return this.clovers.length > 2 && !this.showNextArrow
    }
  },
  watch: {
    canCreate (can) {
      if (can) this.scrollToEnd()
    }
  },
  methods: {
    async create () {
      if (!this.noLimit) this.canCreate = false
      clover.mine()
      // if (cloverIsMonochrome(clover)) return this.create()
      const clvr = await this.$store.dispatch('formatFoundClover', clover)
      this.$emit('addClover', clvr)
      this.scrollToEnd()
    },
    step () {
      this.no++
      switch (this.no) {
        case 1:
          this.text = 'Nice!'
          setTimeout(() => this.step(), 1400)
          break
        case 2:
          this.text = 'Make another!'
          this.canCreate = true
          break
        case 3:
          this.text = 'Keep going!'
          this.canCreate = this.noLimit = true
          break
      }
    },
    scrollToEnd () {
      this.$nextTick(() => {
        if (window.innerWidth > 600) this.$refs.cloverList.scrollToEnd()
      })
    },
    end () {
      this.showNextArrow = true
      this.showBasket = true
    }
  }
}
</script>

<style>
</style>
