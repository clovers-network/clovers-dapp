<template lang="pug">
  .div.pt4
    h1.h1.center.green.font-exp.strong.pb3(@click="scrollTo") Find Rare<br>Clovers
    .center.my3.relative
      .wide.h1.inline-flex.overflow-auto.pb4(ref="wide")
        clv.small-clover.inline.mx3.no-hover(
          v-for="(c, i) in 5"
          :class="cloverClass(c)"
          :foo="c == 3"
          :key="i"
          :noMoves="true"
          :autoPlay="true"
          :moveString="c == 3 ? heart : random()")
      router-link.block.mb3(
        :to="{ name: 'Field' }")
          dot-btn.mb3(
            label="Start Now"
            text="white"
            bg="green")
      .px3.py2 Discover, collect and trade mathematically generated artworks.
      hr
      h2.h2.green.font-exp The Field
      img.p3(src="/img/cloud-face.svg")
      .px3.py2 Like looking for shapes in clouds you can browse through the Field of clovers as they're grown in real time looking for rare or interesting shapes.
      hr
      h2.h2.green.font-exp The Feed
      img.p3(src="/img/feed.svg")
      .px3.py2 See, share and trade the latest Clovers that everyone has found!
      hr
      h2.h2.green.font-exp Club Tokens
      img.p3(src="/img/club.svg")
      .px3.py2 To register or buy Clovers, you use Club Tokens. You can get Club Tokens by blah blah blah.
      hr
      h2.h2.green.font-exp Contact
      img.p3(src="/img/letter.svg")
      .px3.py2 Feel free to contact us at email@domain.com or sign up for our newsletter here.
      hr
      h2.h2.green.font-exp Community
      img.p3(src="/img/github.svg")
      .px3.py2 Clovers is an open source project. You can #[a(href="//github.com/clovers-network") find us on Github.]

</template>

<script>
import Reversi from 'clovers-reversi'
import DotBtn from '@/components/DotBtn'

export default {
  name: 'Welcome',
  data () {
    return {
      heart:
        'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3'
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
      // + 6 because of the weird flex bug cutting off the final margin of the clover
    },
    random () {
      const reversi = new Reversi()
      reversi.mine()
      return reversi.movesString
    }
  },
  components: { DotBtn }
}
</script>

<style lang="stylus" >
  .wide
    width 100vw
</style>
