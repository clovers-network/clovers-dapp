<template lang="pug">
  learn-frame
    .absolute.top-0.left-0.w-100.h-100.flex.items-center
      //- basket
      .absolute.top-0.right-0.p2.flex.items-center(v-show="showBasket")
        h6.mx2 Your clovers are saved to your <b>Basket</b> &rarr;
        .border.green.rounded.p1.flex.items-center
          cart-icon.mx1
          span.block.mx1 {{clovers.length}}
      //- row of clovers
      .relative.w-100
        .overflow-x-scroll.invisible-scrollbar(ref="container")
          .center.nowrap(ref="row", style="min-width:100%")
            .inline-block.px1
            .inline-block.px2.content-box(v-for="clover in clovers")
              figure(style="width:162px")
                clv(:moveString="clover.movesString", :autoPlay="true", @endPlayMoves="step")
            .inline-block.px2.content-box(v-show="canCreate")
              button.block.pointer(@click="create", style="width:162px")
                img.block(src="./learn-icon-add-clover.svg", style="vertical-align: auto")
            .inline-block.px1
    //- text
    .absolute.bottom-0.left-0.w-100.pb3.px2.center
      .font-ext.h2(v-if="!showDoneBtn && !showNextArrow", v-html="text")
      button.inline-block.bg-green.white.rounded.px3.py1.h4.pointer(v-if="showDoneBtn", @click="end") Continue
      down-arrow-btn(v-if="showNextArrow", v-on="$listeners")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
import CartIcon from '@/components/Icons/CartIcon'
import Reversi from 'clovers-reversi'
import { cloverIsMonochrome } from '@/utils'
const clover = new Reversi()
export default {
  name: 'Learn__Section--CreateClovers',
  props: ['clovers'],
  components: { LearnFrame, DownArrowBtn, CartIcon },
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
      return this.clovers.length > 3 && !this.showNextArrow
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
        const container = this.$refs.container
        if (container.scrollWidth > container.offsetWidth) {
          return container.scroll(container.scrollWidth * 2, 0)
        }
      })
    },
    end () {
      this.showNextArrow = true
      this.showBasket = true
    }
  },
  watch: {
    canCreate (can) {
      if (can) this.scrollToEnd()
    }
  }
}
</script>

<style>
</style>
