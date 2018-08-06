<template>
  <div class="mt2 mb-full-height">
    <single-view v-if="viewSingle" :clover="viewSingle" @close="viewSingle = null"></single-view>
    <ul class="list-reset flex flex-wrap mxn2 mt0 mb3 px2">
      <!-- item -->
      <li v-for="(clover, i) in generated" :key="i" class="p2 col-6 sm-col-4 relative appear-off" data-expand="-50" :data-appear="i % 3">
        <div class="pb-100 relative">
          <div class="absolute overlay flex">
            <!-- image -->
            <img :src="cloverImage(clover)" @click="viewSingle = clover" class="block m-auto pointer"/>
          </div>
        </div>
        <!-- fav btn -->
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
import SingleView from '@/views/KeepClover'
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
      this.growing = true
      for (let i = 24; i; i--) {
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
  .mb-full-height {
    margin-bottom: calc(150vh - 275px);
  }

  [data-appear] img{ animation-duration: 800ms; }
  [data-appear="0"] img{ animation-name: appear0; }
  [data-appear="1"] img{ animation-name: appear1; }
  [data-appear="2"] img{ animation-name: appear2; }

  @keyframes appear0 {
    from { opacity: 0; transform: translate(8%, 3%);}
    to { opacity: 1; transform: none;}
  }
  @keyframes appear1 {
    from { opacity: 0; transform: translate(-3%, 8%); }
    to { opacity: 1; }
  }
  @keyframes appear2 {
    from { opacity: 0; transform: translate(-8%, 3%);}
    to { opacity: 1; transform: none;}
  }
</style>
