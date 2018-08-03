<template>
  <div class="p2 my4">
    <ul class="list-reset flex flex-wrap">
      <li v-for="clover in generated" class="pr4 pb4">
        <img :src="cloverImage(clover)"/>
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
  import Bottleneck from 'bottleneck'
  import Reversi from 'clovers-reversi'
  import { pad0x, cloverImage } from '@/utils'

  const limiter = new Bottleneck({
    minTime: 250
  })
  const clover = new Reversi()

  export default {
    name: 'Field',
    data () {
      return {
        growing: false,
        generated: []
      }
    },
    computed: {
      ...mapGetters([
        'picks',
        'pickCount'
      ])
    },
    methods: {
      cloverImage,

      getNext () {
        if (this.growing) return
        this.growing = true
        for (let i = 30; i; i--) {
          limiter.submit(this.mineOne, i === 1, this.miningDone)
        }
      },
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
      miningDone () {
        // no op
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
    }
  }
</script>
