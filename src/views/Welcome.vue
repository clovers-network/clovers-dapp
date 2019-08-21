<template lang="pug">
  .pt2.mt3.mb4.overflow-hidden.rounded.sm-mx2.sm-border.sm-pt4.md-mx0
    h1.h1.center.green.font-exp.strong.pb3
      | Clovers
    .center.my3.relative
      section.pb4
        .col-12.overflow-x-scroll.invisible-scrollbar.momentum(ref="wide")
          .pb4.nowrap
            .inline-block.mx2.no-hover(v-for="(c, i) in list", style="width:12em")
              clv(
                :class="cloverClass(i)"
                :foo="i == 2"
                :key="i"
                :noMoves="true"
                :autoPlay="i == 2"
                :moveString="c")
        p.px3.my2.h2 Discover, collect & trade cryptographic icons
        router-link.inline-block.mt3.mb2.bg-green.white.p2.px4.rounded-2.font-ext.h3(:to="{ name: 'Learn' }") Learn More

      //- Garden
      section.border-top.pt3.pb4.px2
        router-link.block.mt2.mb1(:to="{ name: 'Garden' }")
          h2.h2.green.font-exp.mb2.px2 Wander in your Garden
          figure.px3.my3
            img.block.mx-auto.md-p2(src="/img/cloud-face-animated.svg")
          p.px2.my2.h3 Your Garden grows new clovers as&nbsp;you&nbsp;scroll.<br class="hidden sm-inline"> Earn a <u>reward</u> for rare, symmetrical&nbsp;clovers.
          router-link.inline-block.mt3.bg-green.white.p2.px4.rounded-2.font-ext.h3(:to="{ name: 'Garden' }") Pick Clovers

      //- Feed
      section.border-top.pt3.pb4.px2
        router-link.block.mt2.mb1(:to="{ name: 'Feed' }")
          h2.h2.green.font-exp.pb1 Jump in the Feed
          figure.px2.my3
            img.block.col-12.mx-auto(src="/img/feed.svg")
          p.px3.mt3.mb2.pt2.h3 Browse, trade, and comment on all the clovers in the network.
          router-link.inline-block.mt3.bg-green.white.p2.px4.rounded-2.font-ext.h3(:to="{ name: 'Feed' }") Browse Clovers
      //- router-link.block.mb3(
      //-   :to="{ name: 'Trade' }")
      //-   h2.h2.green.font-exp Coins
      //-   img.p3(src="/img/club.svg")
      //-   .px3.py2 Earn Coins by finding or selling Clovers. <br> Redeem Coins for Ether straight from your account page.
      //- router-link.block.mb3(
      //-   :to="{ name: 'Trade' }")
      //-     dot-btn.mb3(
      //-       label="Get Coins"
      //-       text="white"
      //-       bg="green")
      //- hr
      section.border-top.pt3.pb4
        h2.h2.green.font-exp.mt2.pb1 Stay Updated
        figure.px2.my3
          img.block.col-12.mx-auto(src="/img/letter.svg")
        p.px3.my2.h3 Sign up for our newsletter, #[br]or say hi at #[u #[a(target="_blank" href="mailto:hello@clovers.network") hello@clovers.network]].
        newsletter-signup
      section.border-top.py3
        h2.h2.green.font-exp.mt2.px3 Join the Community
        figure.px3.my3
          img.block.col-12.mx-auto(src="/img/github.svg")
        p.px3.h3.mt2.mb0
          | You can find us on #[u #[a(target="_blank" href="//twitter.com/cloversnetwork") Twitter]],
          | #[u #[a(target="_blank" href="//t.me/cloversnetwork") Telegram]],
          | our&nbsp;#[u #[a(target="_blank" href="//forum.clovers.network") Forum]],
          | and on&nbsp;#[u #[a(target="_blank" href="//github.com/clovers-network") Github]]
        p.mt1.h3.px3 Clovers is an open source project built by&nbsp;#[u #[a(target="_blank" href="//bin.am") Bin&nbsp;Studio]].

</template>

<script>
import DotBtn from '@/components/DotBtn'
import NewsletterSignup from '@/components/NewsletterSignup'

export default {
  name: 'Welcome',
  components: { DotBtn, NewsletterSignup },
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
        'Hold'
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
      { name: 'description', content: 'Discover, collect & trade cryptographic icons.', id: 'meta-desc' }
    ]
  },
  computed: {
    cloversVerb () {
      return this.cloversVerbs[this.cloversVerbIndex]
    }
  },
  mounted () {
    this.$nextTick(() => this.scrollTo())
  },
  destroyed () {
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
  }
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

<style  scoped>
  @import '../style/custom-animate.min.css';
  img {
    max-width: 380px;
  }
  .cloverVerb:after {
    content: '';
    width:50px;
    position: absolute;
    right:0px;
    bottom:0px;
  }
</style>
