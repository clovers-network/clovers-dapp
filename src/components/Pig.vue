<template lang="pug">
  div
    .py3
      nav
        h6.center.h3 Clover Pig
        toggle-btn.mx-auto.my3(:active="minerOn" @click="togglePig" @swiperight="togglePig(true)" @swipeleft="togglePig(false)")
        .flex.justify-between.items-center
          .col-6.px2.h3
            div Speed
            .font-exp.mt1 {{ hashRate }}/s
            .h7.pt1 {{ timeSpent }}
          .col-6.px2.h3(:class="totalMined !== 0 ? 'pointer' : ''" @click="$emit('viewPicks')")
            .nowrap Rare Clovers
            .font-exp.mt1 {{ symms }}
            .h7.pt1 ~ {{ totalMined.toLocaleString() }} mined
</template>

<script>
import ToggleBtn from '@/components/ToggleBtn'

import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { cloverIsMonochrome } from '@/utils'
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
    togglePig (value = null) {
      this.minerOn = value === null ? !this.minerOn : value
      this.$emit('minerstatus', this.minerOn)
      if (this.minerOn) {
        this.resetStats()
        this.mine()
        return
      }
      this.stopAll()
    },
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
      this.stop()
      while (this.miners.length > 0) {
        this.stop()
      }
    },
    async minerEvent (event) {
      let { data } = event
      if ('hashRate' in data) {
        this.hashRate = data.hashRate
        this.totalMined = data.hashRate
      }
      if ('symmetrical' in data) {
        try {
          const exists = await this.cloverExists('0x' + data.byteBoard)
          const isMono = cloverIsMonochrome(data)
          if (!exists && !isMono) {
            this.symms = 1
            const clvr = await this.formatFoundClover(data)
            this.saveClover(clvr)
          }
        } catch (error) {
          console.error(error)
        }
      }
    },
    timer () {
      if (this.mining) {
        this.mineTime = 1
      }
    },
    ...mapActions(['cloverExists', 'formatFoundClover']),
    ...mapMutations({
      addMineTotal: 'MINE_INCREMENT',
      addMineTime: 'TIME_INCREMENT',
      incSymms: 'SYMMS_INCREMENT',
      saveClover: 'SAVE_CLOVER',
      resetStats: 'RESET_MINE_STATS'
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
