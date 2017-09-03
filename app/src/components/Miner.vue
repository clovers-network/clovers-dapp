<template>
  <div class="bg-black white">
    <header class="p2 flex flex-wrap items-center mxn1">
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
      <div class="px1 col-4 flex justify-end items-stretch self-stretch">
        <template v-if="!mining">
          <button @click="mine" class="py1 px2 border bg-black white h4 bold pointer no-select">Mine Clovers</button>
        </template>
        <template v-else>
          <div class="mr2 border flex items-center">
            <div class="flex flex-column justify-stretch">
              <div @click="mine" class="pointer no-select py1 px2 lh1">&plus;</div>
              <div @click="stop" class="pointer no-select border-top py1 px2 lh1">&minus;</div>
            </div>
            <div class="border-left flex flex-column justify-center p1 center" style="height:100%">
              <p class="m0 h2 lh1">{{ miningPower }}</p>
              <p class="m0 h6 lh1">Active miners</p>
            </div>
          </div>
          <button @click="stopAll" class="py1 px3 border bg-black white h4 bold pointer no-select">Stop</button>
        </template>
      </div>
    </header>
    <div v-if="selectedClover">
      <claim-clover :clover="selectedClover" :miner="miner"></claim-clover>
    </div>
    <div class="p2">
      <div v-if="clovers.length">
        <ul class="list-reset flex mxn1 nowrap overflow-auto">
          <li @click="select(board)" v-for="board in clovers" class="px1 pointer h6">
            <clv :key="board.movesString" :board="miner.byteBoardToRowArray(board.byteBoard)"></clv>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'
  import CloverWorker from 'worker-loader!../assets/clover-worker'
  import Clover from '../assets/clovers'
  import ClaimClover from '@/components/ClaimClover'
  import moment from 'moment'

  export default {
    name: 'miner',
    data () {
      return {
        miners: [],
        miner: new Clover(),
        interval: null,
        hasStorage: !!window.localStorage,
        selectedClover: null
      }
    },
    computed: {
      clovers: {
        get () {
          return this.$store.state.minedClovers
        },
        set (newVal) {
          this.restoreMinedClovers(newVal)
        }
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
        set (newVal) {
          this.addMineTime(newVal)
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
        return moment.utc(this.mineTime * 1000).format('HH:mm:ss')
      }
    },
    methods: {
      mine () {
        this.mining = true
        if (!this.start) this.start = new Date()
        let miner = new CloverWorker()
        miner.onmessage = this.minerEvent
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
      minerEvent (event) {
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
      select (clover) {
        this.selectedClover = clover
      },
      timer () {
        if (this.mining) {
          this.mineTime = 1
          setItem('clovers', this.clovers)
          setItem('totalMined', this.totalMined)
          setItem('mineTime', this.mineTime)
        }
      },

      ...mapMutations({
        toggleMiner: 'TOGGLE_MINER',
        newHashRate: 'HASH_RATE',
        addMineTotal: 'MINE_INCREMENT',
        addMineTime: 'TIME_INCREMENT',
        changePower: 'CORE_COUNT',
        minedClover: 'MINED_CLOVER',
        restoreMinedClovers: 'EXISTING_CLOVERS',
        storedClovers: 'STORED_CLOVERS',
        storedMineCount: 'STORED_COUNT',
        storedMineDuration: 'STORED_DURATION'
      })
    },
    mounted () {
      if (this.hasStorage) {
        this.storedClovers(getItem('clovers'))
        this.storedMineCount(getItem('totalMined'))
        this.storedMineDuration(getItem('mineTime'))
      }
      this.interval = setInterval(this.timer, 1000)
    },
    destroyed () {
      clearInterval(this.interval)
    },
    components: { ClaimClover }
  }

  function getItem (key) {
    let res = window.localStorage.getItem(key)
    return res && JSON.parse(res)
  }

  function setItem (key, val) {
    window.localStorage.setItem(key, JSON.stringify(val))
  }
</script>
