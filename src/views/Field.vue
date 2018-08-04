<template>
  <div class="p2 my4">
    <single-view v-show="viewSingle" :clover="viewSingle" @close="viewSingle = null"></single-view>
    <ul class="list-reset flex flex-wrap">
      <li v-for="(clover, i) in generated" :key="i" class="pr4 pb4">
        <img class="pointer" :src="cloverImage(clover)" @click="viewSingle = clover"/>
        <p class="h2">
          <span v-if="isSaved(clover)" class="green">&hearts;</span>
          <a v-else @click="saveClover(clover)" class="green pointer" style="opacity:.3">&hearts;</a>
        </p>
      </li>
    </ul>
    <button @click="getNext" class="btn btn-big btn-primary bg-green">Get some</button>
    <div class="fixed left-0 right-0 bottom-0 bg-green white p2">
      <span class="mr2">Grown: {{ generated.length }}</span>
      <span>Saved: {{ pickCount }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import SingleView from '@/views/FieldSingle'
import Bottleneck from 'bottleneck'
import Reversi from 'clovers-reversi'
import { pad0x, cloverImage } from '@/utils'
const clover = new Reversi()

export default {
  name: 'Field',
  components: { SingleView },
  data () {
    return {
      limiter: new Bottleneck({
        minTime: 250
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

    getNext () {
      if (this.growing) return
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
  beforeRouteLeave (to, from, next) {
    this.limiter.stop({ dropWaitingJobs: true })
    next()
  }
}
</script>
