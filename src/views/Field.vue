<template lang="pug">
  .mt3.pb-full-height
    ul.list-reset.flex.flex-wrap.mxn2.mt0.mb3.px2.pb-full-height
      field-item(v-for='(clover, i) in generated' :key='i' data-expand='-50' :data-appear='i % 3' :clover="clover" :in-field="true")

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import { mapActions } from 'vuex'
import KeepClover from '@/views/KeepClover'
import FieldItem from '@/components/FieldItem'
import Bottleneck from 'bottleneck'
import Reversi from 'clovers-reversi'
import { cloverIsMonochrome } from '@/utils'
import { debounce } from 'underscore'

const clover = new Reversi()
const scrollEl = document.scrollingElement

export default {
  name: 'Field',
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
  components: { KeepClover, FieldItem }
}
</script>
