<template>
  <div>
    <header class="bg-green white p2 flex justify-between items-center">
      <h4 class="h3 m0 lh1 pr2">Mine Clover</h4>
      <strong v-if="niceOnes.length" class="mx2 h3">&clubs; {{ niceOnes.length }}</strong>
      <strong class="mx2" v-if="mining">{{ hashRate }} games/sec</strong>
      <div class="ml2">
        <button @click="mine" class="btn btn-primary bg-orange">{{ mineBtn }}</button>
      </div>
    </header>
    <div class="p2">
      <p><strong>{{ timeSpent }}</strong></p>
      <p>Cores: <strong>{{ miningPower }}</strong></p>
      <button v-if="miners.length" @click="stopAll">{{ stopBtn }}</button>
      <div v-if="niceOnes.length">
        <ul class="list-reset flex mxn1 nowrap overflow-auto">
          <clv v-for="board in niceOnes" :key="board.movesString" :board="miner.byteBoardToRowArray(board.byteBoard)"></clv>
        </ul>
      </div>
    </div>
    <div class="bg-teal">
      <p class="white m0 py1 px2">Games played <strong>~ {{ totalMined.toLocaleString() }}</strong></p>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'
  import CloverWorker from 'worker-loader!../assets/clover-worker'
  import Clover from '../assets/clovers'
  import Clv from '@/components/CloverFunc'
  import moment from 'moment'

  export default {
    name: 'miner',
    data () {
      return {
        miners: [],
        miner: new Clover(),
        niceOnes: [],
        interval: null
      }
    },
    computed: {
      mining: {
        get () {
          return this.$store.state.mining
        },
        set (newVal) {
          this.toggleMiner(newVal)
        }
      },
      hashRate: {
        get () {
          return this.$store.state.hashRate
        },
        set (newVal) {
          this.newHashRate(newVal)
        }
      },
      totalMined: {
        get () {
          return this.$store.state.totalMined
        },
        set (newVal) {
          this.addMineTotal(newVal)
        }
      },
      mineTime: {
        get () {
          return this.$store.state.mineTime
        },
        set () {
          this.addMineTime()
        }
      },
      miningPower: {
        get () {
          return this.$store.state.miningPower
        },
        set (newVal) {
          this.changePower(newVal)
        }
      },
      mineBtn () {
        return this.miners.length ? 'More power' : 'Start mining'
      },
      stopBtn () {
        return this.miners.length === 1 ? 'Stop mining' : 'Slow down!'
      },
      timeSpent () {
        let d = this.mineTime
        if (d < 120) {
          return `${moment.duration(d * 1000).as('seconds')} seconds`
        } else if (d < (60 * 60)) {
          return `${moment.duration(d * 1000).as('minutes').toFixed(2)} mins`
        }
        return `${moment.duration(d * 1000).as('hours').toFixed(2)} hours`
      }
    },
    methods: {
      mine () {
        this.mining = true
        if (!this.start) this.start = new Date()
        let miner = new CloverWorker()
        miner.onmessage = this.handleSymmetry
        miner.postMessage('start')
        this.miners.push(miner)
        this.miningPower = this.miners.length
      },
      stop () {
        if (this.miners.length) {
          let removed = this.miners.pop()
          removed.postMessage('stop')
          if (!this.miners.length) this.mining = false
          this.miningPower = this.miners.length
        } else {
          this.mining = false
        }
      },
      stopAll () {
        while (this.miners.length > 0) {
          this.stop()
        }
      },
      handleSymmetry (event) {
        let { data } = event
        if ('hashRate' in data) {
          this.hashRate = data.hashRate
          this.totalMined = data.hashRate
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
      confirm (moves) {
        this.$emit('try-moves', moves)
      },
      timer () {
        if (this.mining) this.mineTime = this.mineTime + 1
      },

      ...mapMutations({
        toggleMiner: 'TOGGLE_MINER',
        newHashRate: 'HASH_RATE',
        addMineTotal: 'MINE_INCREMENT',
        addMineTime: 'TIME_INCREMENT',
        changePower: 'CORE_COUNT'
      })
    },
    mounted () {
      this.interval = setInterval(this.timer, 1000)
    },
    destroyed () {
      clearInterval(this.interval)
    },
    components: { Clv }
  }
</script>
