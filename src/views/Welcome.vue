<template lang="pug">
  .div.pt4.overflow-hidden
    h1.h1.center.green.font-exp.strong.pb3.flex

      span.col-6.align-right.cloverVerb.relative
        transition(
          mode="out-in"
          name="custom-classes-transition"
          enter-active-class="animated faster fadeInDown"
          leave-active-class="animated faster fadeOutDown"
        )
          span.inline-block(:key="cloversVerbIndex") {{cloversVerb}}&nbsp;
      span.col-6.align-left Clovers <!--♣&#xFE0E;-->
    .center.my3.relative
      .col-12.overflow-x-scroll.invisible-scrollbar.momentum(ref="wide")
        .pb4.nowrap
          .inline-block.mx2.no-hover(v-for="(c, i) in list", style="width:13em")
            clv(
              :class="cloverClass(i)"
              :foo="i == 2"
              :key="i"
              :noMoves="true"
              :autoPlay="i == 2"
              :moveString="c")
      .px3.py2.h2.black Discover, collect & trade cryptographic icons
      //- router-link.block.my3(
        :to="{ name: 'Activity' }")
          dot-btn.mb3(
            label="See the Latest Activity"
            text="white"
            bg="green")
      hr
      router-link.block.mb3(
        :to="{ name: 'Account/Trade' }")
        h2.h2.green.font-exp Club Tokens
        img.p3(src="/img/club.svg")
        .px3.py2.black Earn Club Tokens by finding or selling Clovers. <br> Redeem Club Tokens for Ether straight from your account page.
      router-link.block.mb3(
        :to="{ name: 'Account/Trade' }")
          dot-btn.mb3(
            label="Get Club Tokens"
            text="white"
            bg="green")
      hr
      router-link.block.mb3(
        :to="{ name: 'Feed' }")
        h2.h2.green.font-exp The Latest
        img.p3(src="/img/feed.svg")
        .px3.py2.black See all of the most recent Clovers activities.
      router-link.block.mb3(
        :to="{ name: 'Feed' }")
          dot-btn.mb3(
            label="See The Latest"
            text="white"
            bg="green")
      hr
      router-link.block.mb3(
        :to="{ name: 'Field' }")
        h2.h2.green.font-exp The Field
        img.p3(src="/img/cloud-face-animated.svg")
        .px3.py2.black This is where Clovers grow. <br>Take a walk and take a look; like finding shapes in clouds <br>you can pick and claim anything you find—it may come with a reward.
      router-link.block.mb3(
        :to="{ name: 'Field' }")
          dot-btn.mb3(
            label="Grow New Clovers"
            text="white"
            bg="green")
      hr
      h2.h2.green.font-exp Newsletter
      img.p3(src="/img/letter.svg")
      .px3.py2.black Sign up for our newsletter and feel free to email us at #[u #[a(href="mailto:info@clovers.network") info@clovers.network]].
      newsletter-signup
      hr
      h2.h2.green.font-exp Community
      img.p3(src="/img/github.svg")
      .px3.py2.black
        | Clovers is an open source project by #[u #[a(href="//bin.am") Bin Studio]].<br>
        | You can #[u #[a(href="//github.com/clovers-network") find us on Github]].<br>
        //- | You can also see our Contracts at #[u #[a(href="//rinkeby.etherscan.io/token/0x8a0011ccb1850e18a9d2d4b15bd7f9e9e423c11b") Etherscan]].<br>
    h1.bg-green.white.h1.center.py4 ♣&#xFE0E;
</template>

<script>
import DotBtn from '@/components/DotBtn'
import NewsletterSignup from '@/components/NewsletterSignup'

export default {
  name: 'Welcome',
  data () {
    return {
      interval: null,
      // cloversVerbs: shuffle([
      cloversVerbs: ([
        // 'Welcome to',
        '_',
        'Play',
        'Find',
        'Mine',
        'Pick',
        // 'Win',
        // 'Lose',
        'Give',
        // 'Receive',
        'Trade',
        'Buy',
        'Sell',
        'Grow',
        // 'Hoard',
        'Hold',
        // 'Behold',
        // 'Discover',
        // 'Covet',
        // 'Explain',
        // 'Print',
        // 'Amass',
        // 'Hodl',
        // 'Love',
        // 'Get',
        // 'Redeem',
        // 'Track'
      ]),
      cloversVerbIndex: 0,
      cloversVerbChanging: false,
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
  head: {
    title: { inner: 'Welcome' },
    meta: [
      { name: 'description', content: 'Discover, collect and trade mathematically generated artworks.', id: 'meta-desc' }
    ]
  },
  computed: {
    cloversVerb () {
      return this.cloversVerbs[this.cloversVerbIndex]
    }
  },
  mounted () {
    this.$nextTick(() => this.scrollTo())
    setTimeout(() => {
      this.interval = setInterval(() => {
        this.swapVerb()
      }, 1800)
    }, 2700)
  },
  destroyed () {
    console.log('destroyed')
    clearInterval(this.interval)
  },
  methods: {
    swapVerb () {
      if (this.cloversVerbIndex === this.cloversVerbs.length - 1) {
        this.cloversVerbIndex = 1
        clearInterval(this.interval)
      } else {
        this.cloversVerbIndex++
      }
      // this.cloversVerbChanging = true
      // this.cloversVerbIndex = Math.floor(Math.random() * (this.cloversVerbs.length))
      // setTimeout(() => {
      //   this.cloversVerbChanging = false
      // }, 50)
    },
    cloverClass (c) {
      return {
        'no-border': c === 2,
        'bg-green': c === 2
      }
    },
    scrollTo () {
      this.$refs.wide.scrollLeft = this.$refs.wide.scrollWidth / 2 - this.$el.offsetWidth / 2
    }
  },
  components: { DotBtn, NewsletterSignup }
}
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle (a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
</script>

<style lang="scss" scoped>
  @import '../style/custom-animate.min.css';
  img {
    max-width: 380px;
  }
  .cloverVerb:after {
    content: '';
    width:50px;
    // border-bottom: 5px solid var(--green);
    position: absolute;
    right:0px;
    bottom:0px;
  }
</style>
