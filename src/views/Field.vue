<template lang="pug">
  .mt1.mx3.sm-mt3.pb-full-height
    more-information(title="?" content="<u>The Garden</u> is where you can grow new Clovers and pick the ones you like. They'll go into your basket until they get registered. If you'd like to register the Clover to keep it, you'll be charged 10 Clover Coins. If the Clover is symmetrical however, you can exchange it for a reward! Use your Pig to search quickly for only symmetrical Clovers and begin earning Clover Coins.")

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
  components: { KeepClover, FieldItem, MoreInformation }
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
