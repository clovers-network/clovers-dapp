<template>
  <div >
    <div class="py3">
      <nav>
        <h6 class="center h3">Clover Pig</h6>
        <toggle-btn class="mx-auto my3" :active="minerOn" @click="minerOn = !minerOn"></toggle-btn>
        <div class="flex justify-between items-center">
          <div class="col-6 px2 h3">
            <div>Speed</div>
            <div class="font-exp mt1">0/s</div>
          </div>
          <div class="col-6 px2 h3">
            <div>Rare&nbsp;Clovers&nbsp;Found</div>
            <div class="font-exp mt1">{{ symmsSinceOpened }}</div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import ToggleBtn from '@/components/ToggleBtn'

import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import CloverWorker from 'worker-loader!../assets/clover-worker'
import Reversi from 'clovers-reversi'
import moment from 'moment'
let reversi = new Reversi()

export default {
  name: 'Pig',
  data() {
    return {
      miners: [],
      interval: null,
      hasStorage: !!window.localStorage,
      selectedClover: null,
      limit: true,
      minerOn: false,
      symmsSinceOpened: 0
    }
  },
  watch: {
    watch: {
      pickCount() {
        if (this.pickCount && this.pickCount.length > 0) {
          this.symmsSinceOpened++
        }
      },
      showMiner() {
        this.symmsSinceOpened = 0
      }
    }
  },
  computed: {
    ...mapGetters(['pickCount']),
    mining: {
      get() {
        return this.$store.state.mining
      },
      set(newVal) {
        this.toggleMiner(newVal)
      }
    },
    hashRate: {
      get() {
        return this.$store.state.hashRate
      },
      set(newVal) {
        this.newHashRate(newVal)
      }
    },
    totalMined: {
      get() {
        return this.$store.state.totalMined
      },
      set(newVal) {
        this.addMineTotal(newVal)
      }
    },
    mineTime: {
      get() {
        return this.$store.state.mineTime
      },
      set(newVal) {
        this.addMineTime(newVal)
      }
    },
    miningPower: {
      get() {
        return this.$store.state.miningPower
      },
      set(newVal) {
        this.changePower(newVal)
      }
    },
    mineBtn() {
      return this.miners.length ? 'More power' : 'Start mining'
    },
    stopBtn() {
      return this.miners.length === 1 ? 'Stop mining' : 'Slow down!'
    },
    timeSpent() {
      return moment.utc(this.mineTime * 1000).format('HH:mm:ss')
    }
  },
  methods: {
    mine() {
      this.mining = true
      if (!this.start) this.start = new Date()
      let miner = new CloverWorker()
      miner.onmessage = this.minerEvent
      miner.postMessage('start')
      this.miners.push(miner)
      this.miningPower = this.miners.length
    },
    stop() {
      console.log('stop')
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
    stopAll() {
      console.log('stop all')
      this.stop()
      while (this.miners.length > 0) {
        this.stop()
      }
    },
    minerEvent(event) {
      let { data } = event
      if ('hashRate' in data) {
        this.hashRate = data.hashRate
        this.totalMined = data.hashRate
      }
      if ('symmetrical' in data) {
        this.cloverExists(data.byteBoard)
          .then(exists => {
            if (!exists) {
              this.saveClover(data)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    timer() {
      if (this.mining) {
        this.mineTime = 1
      }
    },
    ...mapActions(['cloverExists']),
    ...mapMutations({
      toggleMiner: 'TOGGLE_MINER',
      newHashRate: 'HASH_RATE',
      addMineTotal: 'MINE_INCREMENT',
      addMineTime: 'TIME_INCREMENT',
      changePower: 'CORE_COUNT',
      saveClover: 'SAVE_CLOVER'
    })
  },
  mounted() {
    this.interval = setInterval(this.timer, 1000)
  },
  destroyed() {
    clearInterval(this.interval)
  },
  components: { ToggleBtn }
}
</script>

<style lang="scss">
#miner {
  max-height: calc(100vh - 56px);
  overflow: auto;
}
</style>
