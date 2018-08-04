<template>
  <div class="mt3 mb-full-height">
    <single-view v-show="viewSingle" :clover="viewSingle" @close="viewSingle = null"></single-view>
    <ul class="list-reset flex flex-wrap mxn2 mt0 mb3 px1">
      <li v-for="(clover, i) in generated" :key="i" class="px2 mb3 col-6 relative appear" data-expand="-50">
        <img :src="cloverImage(clover)" @click="viewSingle = clover" class="pointer"/>
        <div class="h2 line-height-1 absolute top-0 right-0 mr2">
          <span v-if="isSaved(clover)" class="green">&hearts;</span>
          <a v-else @click="saveClover(clover)" class="green pointer" style="opacity:.3">&hearts;</a>
        </div>
      </li>
    </ul>
    <!-- <button @click="getNext" class="btn btn-big btn-primary bg-green">Get some</button> -->
    <div class="fixed left-0 right-0 bottom-0 bg-green white center p2">
      <router-link to="/account">
        <span class="h3 font-exp">{{ pickCount }} {{ pluralize('Pick', pickCount) }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import SingleView from '@/views/FieldSingle'
import Bottleneck from 'bottleneck'
import Reversi from 'clovers-reversi'
import { pad0x, cloverImage, pluralize } from '@/utils'
import { debounce } from 'underscore'

const clover = new Reversi()
const scrollEl = document.scrollingElement

export default {
  name: 'Field',
  components: { SingleView },
  data () {
    return {
      limiter: new Bottleneck({
        minTime: 260
      }),
      growing: false,
      generated: [],
      viewSingle: null
    }
  },
  computed: {
    ...mapGetters(['picks', 'pickCount'])
  },
  methods: {
    cloverImage,
    pluralize,

    getNext () {
      if (this.growing) return
      console.log('getting next ones!')
      this.growing = true
      for (let i = 30; i; i--) {
        this.limiter.submit(this.mineOne, i === 1, this.miningDone)
      }
    },
    miningDone () { /* no op, `limiter` callback */ },
    mineOne (last) {
      clover.mine()
      this.generated.push({
        board: pad0x(clover.byteBoard),
        movesString: clover.movesString,
        createdAt: new Date()
      })
      if (last) {
        this.growing = false
      }
    },
    isSaved ({ board }) {
      if (!this.picks.length) return false
      return this.picks.findIndex(c => c.board === board) >= 0
    },

    ...mapMutations({
      saveClover: 'SAVE_CLOVER'
    })
  },
  beforeMount () {
    this.getNext()
  },
  mounted () {
    window.onscroll = debounce(() => {
      let nearBottom = (scrollEl.scrollTop + scrollEl.clientHeight) >
        scrollEl.scrollHeight - (scrollEl.clientHeight / 2)
      console.log(nearBottom)
      if (nearBottom) this.getNext()
    }, 200)
  },
  beforeRouteLeave (to, from, next) {
    this.limiter.stop({ dropWaitingJobs: true })
    next()
  }
}
</script>

<style>
  .mb-full-height {
    margin-bottom: 100vh;
  }

  .appear {
    animation-name: appear;
    animation-duration: 600ms;
  }

  @keyframes appear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
