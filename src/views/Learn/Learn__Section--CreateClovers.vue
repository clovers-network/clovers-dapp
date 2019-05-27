<template lang="pug">
  learn-frame
    .absolute.top-0.left-0.w-100.h-100.flex.items-center.justify-center.px3
      figure.mx1(v-for="clover in clovers", style="width:180px")
        clv(:moveString="clover.movesString", :autoPlay="true", @endPlayMoves="step")
      button.pointer(v-show="canCreate", @click="create")
        img(src="./learn-icon-add-clover.svg")
    .absolute.bottom-0.left-0.w-100.pb3.px2.center
      .font-ext.h2 {{steps[no].text}}
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import Reversi from 'clovers-reversi'
import { cloverIsMonochrome } from '@/utils'
const clover = new Reversi()
export default {
  name: 'Learn__Section--CreateClovers',
  components: { LearnFrame },
  data () {
    return {
      no: 0,
      steps: [
        {text: 'You can create clovers in your browser.'},
        {text: 'Nice!'},
        {text: 'Make another!'}
      ],
      canCreate: true,
      clovers: []
    }
  },
  methods: {
    async create () {
      this.canCreate = false
      clover.mine()
      // if (cloverIsMonochrome(clover)) return this.create()
      const clvr = await this.$store.dispatch('formatFoundClover', clover)
      this.clovers.push(clvr)
    },
    step () {
      if (this.no === this.steps.length - 1) return console.log('End of steps!')
      this.no++
      switch (this.no) {
        case 1:
          setTimeout(() => this.step(), 1000)
          break
        case 2:
          this.canCreate = true
          break
      }
    }
  }
}
</script>

<style>
</style>
