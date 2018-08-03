<template lang="pug">
  .div.pt4
    h1.h1.center.green.font-exp.strong(@click="scrollTo") Find Rare<br>Clovers
    .center.my3.relative
      .wide.h1.inline-flex.overflow-auto.pb4(ref="wide")
        clv.small-clover.inline.mx2.no-hover(
          v-for="(c, i) in 5"
          :class="cloverClass(c)"
          :foo="c == 3"
          :key="i"
          :noMoves="true"
          :autoPlay="true"
          :moveString="c == 3 ? heart : random()")
      button Start Now
      hr
      h2.h2.green.font-exp What is Clovers?
      .py2 Clovers is a game centered around discovering, collecting and trading mathematically generated artworks.
      button Tell Me More
      hr
      h2.h2.green.font-exp The Field
      .py2 Like looking for shapes in clouds you can browse through the Field of clovers as they're grown in real time looking for rare or interesting shapes.
</template>

<script>
import Reversi from 'clovers-reversi'
export default {
  name: 'Welcome',
  data () {
    return {
      heart:
        'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',
      random1: null,
      random2: null,
      random3: null,
      random4: null
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.scrollTo()
    })
  },
  methods: {
    cloverClass (c) {
      return {
        'no-border': c === 3,
        'bg-green': c === 3
      }
    },
    scrollTo () {
      this.$refs.wide.scrollLeft =
        this.$refs.wide.scrollWidth / 2 - window.innerWidth / 2 + 6
    },
    random () {
      const reversi = new Reversi()
      reversi.mine()
      return reversi.movesString
    }
  }
}
</script>

<style lang="stylus" >
  .wide
    width 100vw
</style>
