<template>
  <div class="bg-black white">
    <header class="p2 flex flex-wrap border-bottom items-center mxn1">
      <div class="px1 col-2">
        <p class="m0 h6">Time spent mining</p>
        <p class="m0 h1 nowrap">{{ timeSpent }}</p>
      </div>
      <div class="px1 col-2">
        <p class="m0 h6">Games played</p>
        <p class="m0 h1 nowrap">{{ totalMined.toLocaleString() }}</p>
      </div>
      <div class="px1 col-2">
        <p class="m0 h6">Clovers found</p>
        <p class="m0 h1 nowrap">&clubs; {{ clovers.length }}</p>
      </div>
      <div class="px1 col-2">
        <p class="m0 h6">Current mining speed</p>
        <p class="m0 h1 nowrap">{{ hashRate }} games/sec</p>
      </div>
      <div class="px1 col-4 flex justify-end items-center">
        <template v-if="!mining">
          <button @click="mine" class="py1 px2 border bg-black white h4 bold">Mine Clovers</button>
        </template>
        <template v-else>
          <div class="mr2">
            {{ miningPower }}
          </div>
          <button @click="stopAll" class="py1 px2 border bg-black white h4 bold">Stop</button>
        </template>
      </div>
    </header>
    <div class="p2">
      <!-- <p>Cores: <strong>{{ miningPower }}</strong></p> -->

      <div v-if="clovers.length">
        <ul class="list-reset flex mxn1 nowrap overflow-auto">
          <clv v-for="board in clovers" :key="board.movesString" :board="miner.byteBoardToRowArray(board.byteBoard)"></clv>
        </ul>
      </div>
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
        interval: null
      }
    },
    computed: {
      clovers () {
        return this.$store.state.minedClovers
      },
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
          if (!this.miners.length) {
            this.mining = false
            this.hashRate = 0
          }
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
          this.miner.cloverExists(data.byteBoard).then((exists) => {
            if (!exists) {
              this.minedClover(data)
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
        changePower: 'CORE_COUNT',
        minedClover: 'MINED_CLOVER'
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
