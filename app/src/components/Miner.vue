<template>
  <div class="fixed bottom-0 right-0 mr3 mb3 bg-silver rounded">
    <header class="bg-green white rounded p2 flex justify-between items-center" :class="{ 'rounded-top': opened }">
      <h4 @click="toggleMiner" class="h3 m0 lh1 px2 pointer">Mine Clover</h4>
      <strong v-if="niceOnes.length" class="mx2 h3">&clubs; {{ niceOnes.length }}</strong>
      <strong class="mx2" v-if="mining">{{ hashRate * miners.length }} games/sec</strong>
      <div class="ml2">
        <button @click="mine" class="btn btn-primary bg-orange">{{ mineBtn }}</button>
      </div>
    </header>
    <div class="p2" v-if="opened">
      <p>Time spent mining: <strong>{{ mineTime }}s</strong></p>
      <p>Cores: <strong>{{ miners.length }}</strong></p>
      <button v-if="miners.length" @click="stop">{{ stopBtn }}</button>
      <br>
      <p v-if="totalMined">Total c. <strong>{{ totalMined.toLocaleString() }}</strong></p>
      <div v-if="niceOnes.length">
        <p>Symmetrical findings <strong>{{ niceOnes.length }}</strong></p>
        <pre v-for="clover of niceOnes" v-text="draw(clover.visualBoard)" @click="confirm(clover.movesString)"></pre>
        <ul class="list-reset flex flex-wrap mxn1">
          <clv v-for="board in niceOnes" :key="board.movesString" :board="miner.byteBoardToRowArray(board.byteBoard)"></clv>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import CloverWorker from 'worker-loader!../assets/clover-worker'
  import Clover from '../assets/clovers'
  import Clv from '@/components/CloverFunc'

  export default {
    name: 'mine',
    data () {
      return {
        miners: [],
        miner: new Clover(),
        hashRate: 0,
        mining: false,
        mineTime: 0,
        totalMined: 0,
        opened: false,
        niceOnes: []
      }
    },
    computed: {
      mineBtn () {
        return this.miners.length ? 'More power' : 'Start mining'
      },
      stopBtn () {
        return this.miners.length === 1 ? 'Stop mining' : 'Slow down!'
      }
    },
    methods: {
      toggleMiner () {
        this.opened = !this.opened
      },
      mine () {
        this.mining = true
        if (!this.start) this.start = new Date()
        let miner = new CloverWorker()
        miner.onmessage = this.handleSymmetry
        miner.postMessage('start')
        this.miners.push(miner)
      },
      stop () {
        if (this.miners.length) {
          let removed = this.miners.pop()
          removed.postMessage('stop')
          if (!this.miners.length) this.mining = false
        } else {
          this.mining = false
        }
      },
      handleSymmetry (event) {
        let { data } = event
        if ('hashRate' in data) {
          this.hashRate = data.hashRate
          this.totalMined = this.totalMined + data.hashRate
        }
        if ('visualBoard' in data) {
          console.log(data.movesString)
          this.miner.boardExists(data.byteBoard).then((exists) => {
            if (!exists) {
              this.niceOnes.push(data)
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      },
      draw (clover) {
        if (!clover.length) return 'empty...'

        let display = ''
        for (let row of clover) {
          display += row.join(' ') + '\n'
        }
        return display
      },
      confirm (moves) {
        this.$emit('try-moves', moves)
      }
    },
    mounted () {
      setInterval(() => {
        if (this.mining) this.mineTime = this.mineTime + 1
      }, 1000)
    },
    components: { Clv }
  }
</script>
