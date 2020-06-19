<template lang="pug">
  article.mx3
    header.mb2.md-mb0
      page-title
        h1 Garden
        p(slot="info") Your <b>Garden</b> generates new clovers as your scoll. Click a clover to register it for a small fee, or save it to your <router-link :to="{name: 'Picks'}" class="underline">Basket</router-link> for later. Registered clovers are added to your Collection and will appear on your Profile.

    section.mxn2.px1.md-px0
      .sm-col-10.lg-col-12.mx-auto.pb-full-height
        section.flex.flex-wrap.mxn2.mb4.md-px2
          field-item(v-for='(clover, i) in generated' :key='i' data-expand='-50' :data-appear='i % 3' :clover="clover" :in-field="true")

    button.fixed.bottom-0.right-0.block.pointer.z2.px2.py1.m4(@click="scrollUp", title="Jump to Top")
      img.block(src="@/views/Learn/learn-icon-arrow-down.svg", style="transform: rotate(180deg)")

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import { mapActions } from 'vuex'
import KeepClover from '@/views/KeepClover'
import FieldItem from '@/components/FieldItem'
import PageTitle from '@/components/PageTitle'
import CoinIcon from '@/components/Icons/CoinIcon'
import Bottleneck from 'bottleneck'
import Reversi from 'clovers-reversi'
import { cloverIsMonochrome } from '@/utils'
import { debounce } from 'underscore'

const clover = new Reversi()
const scrollEl = document.scrollingElement

export default {
  name: 'Garden',
  data () {
    return {
      limiter: new Bottleneck({
        minTime: 260
      }),
      growing: false,
      generated: [],
      entryRt: this.$route.name
    }
  },
  head: {
    title: { inner: 'The Field' },
    meta: [
      { id: 'meta-desc', name: 'description', content: 'Find new Clovers' }
    ]
  },
  computed: {
    showPickModal () {
      return this.$route.query.pick
    }
  },
  methods: {
    scrollUp () {
      window.scrollTo(0, 0) // values are x,y-offset
    },
    getNext () {
      if (this.growing) return
      this.growing = true
      for (let i = 24; i; i--) {
        this.limiter.submit(this.mineOne, i === 1, this.miningDone)
      }
    },
    miningDone () {
      /* no op, `limiter` callback */
    },
    async mineOne (last) {
      clover.mine()
      if (
        clover.byteBoard === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ||
        clover.byteBoard === '55555555555555555555555555555555'
      ) {
        clover.mine()
      }
      const clvr = await this.formatFoundClover(clover)
      const isMono = cloverIsMonochrome(clover)
      // add
      if (!isMono) this.generated.push(clvr)
      if (last) {
        this.growing = false
      }
    },

    ...mapActions(['formatFoundClover'])
  },
  beforeMount () {
    this.getNext()
  },
  mounted () {
    window.onscroll = debounce(() => {
      let nearBottom =
        scrollEl.scrollTop + scrollEl.clientHeight >
        scrollEl.scrollHeight - (scrollEl.clientHeight - 140)
      if (nearBottom) this.getNext()
    }, 30)
  },
  beforeRouteLeave (to, from, next) {
    this.limiter.stop({ dropWaitingJobs: true })
    next()
  },
  components: { KeepClover, FieldItem, PageTitle, CoinIcon }
}
</script>
<style lang="css" scoped>
  .arrow-up {
    overflow: hidden;
    border-radius: 100%;
    width: 50px;
    height: 50px;
    padding: 8px 6px;
    border-radius: 100%;

    img {
      width: 50%;
    }
  }
</style>
