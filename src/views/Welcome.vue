<template lang="pug">
  .div.pt4
    h1.h1.center.green.font-exp.strong.pb3(@click="scrollTo") Find Rare<br>Clovers
    .center.my3.relative
      .wide.h1.inline-flex.overflow-auto.pb4(ref="wide")
        clv.small-clover.inline.mx3.no-hover(
          v-for="(c, i) in list"
          :class="cloverClass(i)"
          :foo="i == 2"
          :key="i"
          :noMoves="true"
          :autoPlay="i == 2"
          :moveString="c")
      router-link.block.mb3(
        :to="{ name: 'Field' }")
          dot-btn.mb3(
            label="Start Now"
            text="white"
            bg="green")
      .px3.py2 Discover, collect and trade mathematically generated artworks.
      hr
      h2.h2.green.font-exp The Field
      img.p3(src="/img/cloud-face-animated.svg")
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
import DotBtn from '@/components/DotBtn'

export default {
  name: 'Welcome',
  data () {
    return {
      list: [
        'c4c3c2e3f5b2f4g5g3e6d2e1d7e7a2c1f7e2f2g4g6b4b3d6a5a1c6h7d3a3g7g2b1c7f1h5f6a4g1c5g8h1b5h6f8h8d8h2h4f3d1h3b7a6b6e8c8a8b8a7',
        'c4c3d3e3f4f5c2c6f2g3h4b4g6f3d6e6a5d2c1b3c5h3e2a4d7e7a3g1c7b8b7g4b5d8h2g2c8d1e1h7a8g5e8f6h5b6h1a2a7b1a1f8f1b2f7a6g8h6h8g7',

        // heart
        'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',

        'c4e3f5b4c3g6a4c5c6b3c2a2b2a1f4f3f6b5g4f7h7h5f8d7d2e2d1d3e6g5h4c1f1d6g7g3a6b6c8d8g2e8a5h2a7g1a3h6h1h3f2b8g8e7c7a8b1h8e1b7',
        'c4c5e6c3b5f4b2c6g4a5d6e3b4f6c7b3g7g5g6b8a4d3f2b7e7h4e2h6c2f3f7e1g2b6a8d8f8a6c8a2a7h2g1b1f5g3h3g8d7d2f1h1h8h5e8h7a1d1a3c1'
      ]
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
        'no-border': c === 2,
        'bg-green': c === 2
      }
    },
    scrollTo () {
      this.$refs.wide.scrollLeft =
        this.$refs.wide.scrollWidth / 2 - window.innerWidth / 2 + 6
      // + 6 because of the weird flex bug cutting off the final margin of the clover
    }
  },
  components: { DotBtn }
}
</script>

<style lang="stylus" >
  .wide
    width 100vw
</style>
