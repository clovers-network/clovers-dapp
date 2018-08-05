<template>
  <div >
    <div class="py3">
      <nav>
        <h6 class="center h3">Clover Pig</h6>
        <toggle-btn class="mx-auto my3" :active="minerOn" @click="pigToggler()"></toggle-btn>
        <div class="flex justify-between items-center">
          <div class="col-6 px2 h3">
            <div>Speed</div>
            <div class="font-exp mt1">{{ hashRate }}/s</div>
            <div class="h7 pt1">{{ timeSpent }}</div>
          </div>
          <div class="col-6 px2 h3">
            <div class="nowrap">Rare Clovers</div>
            <div class="font-exp mt1">{{ symms }}</div>
            <div class="h7 pt1">~ {{ totalMined.toLocaleString() }} mined</div>
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
import moment from 'moment'

export default {
  name: 'Pig',
  data () {
    return {
      mining: false,
      hashRate: 0,
      miningPower: 0,
      miners: [],
      interval: null,
      selectedClover: null,
      limit: true,
      minerOn: false
    }
  },
  computed: {
    totalMined: {
      get () {
        return this.$store.state.miningStats.totalMined
      },
      set (newVal) {
        this.addMineTotal(newVal)
      }
    },
    mineTime: {
      get () {
        return this.$store.state.miningStats.mineTime
      },
      set (newVal) {
        this.addMineTime(newVal)
      }
    },
    symms: {
      get () {
        return this.$store.state.miningStats.symms
      },
      set () {
        this.incSymms(1)
      }
    },
    timeSpent () {
      return moment.utc(this.mineTime * 1000).format('HH:mm:ss')
    }
  },
  methods: {
    pigToggler () {
      this.minerOn = !this.minerOn
      this.$emit('minerStatus', this.minerOn)
      if (this.minerOn) this.mine()
      else this.stopAll()
    },
    mine () {
      console.log('start mining')
      this.mining = true
      if (!this.start) this.start = new Date()
      let miner = new CloverWorker()
      miner.onmessage = this.minerEvent
      miner.postMessage('start')
      this.miners.push(miner)
      this.miningPower = this.miners.length
    },
    stop () {
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
    stopAll () {
      this.stop()
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
      if ('symmetrical' in data) {
        this.cloverExists(data.byteBoard)
          .then(exists => {
            if (!exists) {
              this.symms = 1
              data.createdAt = new Date()
              this.saveClover(data)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    timer () {
      if (this.mining) {
        this.mineTime = 1
      }
    },
    ...mapActions(['cloverExists']),
    ...mapMutations({
      addMineTotal: 'MINE_INCREMENT',
      addMineTime: 'TIME_INCREMENT',
      incSymms: 'SYMMS_INCREMENT',
      saveClover: 'SAVE_CLOVER'
    })
  },
  mounted () {
    this.interval = setInterval(this.timer, 1000)
  },
  destroyed () {
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
