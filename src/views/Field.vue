<template lang="pug">
  .mt1.mx3.sm-mt3.pb-full-height
    more-information(title="?") In the <b>Garden</b>, you can generate new clovers and pick favorites. Picked clovers go to your <router-link :to="{name: 'Picks'}" class="underline">Basket</router-link>. If you'd like to add a clover to your collection, you need to register it on the network. Registration costs a base fee of <router-link :to="{name: 'Trade'}">10 <coin-icon class="inline-block" /></router-link>. If the clover is symmetrical however, you can instead exchange it for a reward! Use your Pig to rapidly sniff-out symmetrical clovers, and start earning.

    .arrow-up.center.bg-green.fixed.bottom-0.right-0.mb4.mr4.block.pointer.z3(@click="scrollUp")
      img(:src="require('../assets/icons/arrow-up.svg')")

    .sm-col-10.lg-col-12.mx-auto
      section.flex.flex-wrap.mxn2.mb4.md-px2
        field-item(v-for='(clover, i) in generated' :key='i' data-expand='-50' :data-appear='i % 3' :clover="clover" :in-field="true")

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import { mapActions } from 'vuex'
import KeepClover from '@/views/KeepClover'
import FieldItem from '@/components/FieldItem'
import MoreInformation from '@/components/MoreInformation'
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
  components: { KeepClover, FieldItem, MoreInformation, CoinIcon }
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
  }
</style>
