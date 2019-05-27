
<template lang="pug">
  .mt2.pb-full-height
    ul.list-reset.flex.flex-wrap.mxn2.mt0.mb3.px2.pb-full-height
      // item
      li.p2.col-6.sm-col-4.relative.appear-off(v-for='(clover, i) in generated' :key='i' data-expand='-50' :data-appear='i % 3')
        .pb-100.relative
          router-link(:to="{ query: {pick: clover.movesString } }")
            .absolute.overlay.flex
              // image
              img.block.m-auto.pointer(:src='cloverImage(clover)' @click='viewSingle = clover')
        // fav btn
        heart-icon.green.h2.absolute.top-0.right-0.mr2(:active='isSaved(clover)' @click='saveClover(clover)')
    .fixed-center-max-width.bottom-0.bg-green.white
      router-link.block.h-bttm-bar.flex(to='/account')
        span.block.m-auto.h3.font-exp Picked {{ pickCount}} {{ pluralize(&apos;Clover&apos;, pickCount) }}

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import HeartIcon from '@/components/Icons/HeartIcon'
import KeepClover from '@/views/KeepClover'
import Bottleneck from 'bottleneck'
import Reversi from 'clovers-reversi'
import { pad0x, cloverImage, pluralize, cloverIsMonochrome } from '@/utils'
import { debounce } from 'underscore'

const clover = new Reversi()
const scrollEl = document.scrollingElement

export default {
  name: 'Field',
  components: { HeartIcon, KeepClover },
  data () {
    return {
      limiter: new Bottleneck({
        minTime: 260
      }),
      growing: false,
      generated: [],
      viewSingle: null,
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
    },

    ...mapGetters(['picks', 'pickCount'])
  },
  methods: {
    cloverImage,
    pluralize,

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
    isSaved ({ board }) {
      if (!this.picks.length) return false
      return this.picks.findIndex(c => c.board === board) >= 0
    },
    closeKeep () {
      /* go BACK if didn't enter component on `/keep` */
      if (this.entryRt === 'Keep') {
        this.entryRt = null
        this.$router.push({name: 'Field'})
        return this.getNext()
      }
      return this.$router.go(-1)
    },

    ...mapMutations({
      saveClover: 'SAVE_CLOVER'
    }),
    ...mapActions(['formatFoundClover'])
  },
  beforeRouteUpdate (to, from, next) {
    next()
    if (!this.generated.length) this.getNext()
  },
  beforeMount () {
    if (this.entryRt !== 'Keep') this.getNext()
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
  }
}
</script>

<style>
.pb-full-height {
  padding-bottom: calc(100vh - 375px);
}
img {
  animation-duration: 800ms;
}
[data-appear='0'] img {
  animation-name: appear0;
}
[data-appear='1'] img {
  animation-name: appear1;
}
[data-appear='2'] img {
  animation-name: appear2;
}

@keyframes appear0 {
  from {
    opacity: 0;
    transform: translate(8%, 3%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes appear1 {
  from {
    opacity: 0;
    transform: translate(-3%, 8%);
  }
  to {
    opacity: 1;
  }
}
@keyframes appear2 {
  from {
    opacity: 0;
    transform: translate(-8%, 3%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
