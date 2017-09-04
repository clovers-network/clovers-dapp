<template>
  <div class="bg-black white">
    <header class="p2 flex flex-wrap items-center mxn1">
      <div class="py1 px2 min-width-1">
        <p class="m0 h6">Time spent mining</p>
        <p class="m0 h1 nowrap">{{ timeSpent }}</p>
      </div>
      <div class="py1 px2 min-width-1">
        <p class="m0 h6">Games played</p>
        <p class="m0 h1 nowrap">{{ totalMined.toLocaleString() }}</p>
      </div>
      <div class="py1 px2 min-width-1">
        <p class="m0 h6">Clovers found</p>
        <p class="m0 h1 nowrap">
          <svg width="24" height="24" viewBox="0 0 19 20" xmlns="http://www.w3.org/2000/svg"><title>Group</title><g fill-rule="nonzero" fill="#FFF"><path d="M9.818 9.682a.326.326 0 0 1-.099-.248l.032-4.957a1.882 1.882 0 0 1 0-.216c.003-.096.02-.26.052-.49.03-.231.076-.456.135-.673a3.64 3.64 0 0 1 .29-.712c.135-.258.294-.48.48-.664.607-.608 1.25-.916 1.926-.925.676-.008 1.31.282 1.899.872.163.163.3.359.41.588.11.229.188.467.233.714.045.246.076.467.093.66.017.194.023.388.018.582.194-.005.388.001.582.018.193.017.414.048.66.093.247.045.485.123.714.233.23.11.425.247.588.41.59.59.88 1.223.872 1.9-.009.676-.317 1.318-.925 1.926-.61.61-1.533.93-2.768.96l-4.944.028a.326.326 0 0 1-.248-.099M9.818 10.318a.326.326 0 0 0-.099.248l.032 4.957c-.004.048-.005.12 0 .216.003.096.02.26.052.49.03.231.076.456.135.673.06.217.156.454.29.712.135.258.294.48.48.664.607.608 1.25.916 1.926.925.676.008 1.31-.282 1.899-.872.163-.163.3-.359.41-.588.11-.229.188-.467.233-.714a7.16 7.16 0 0 0 .093-.66c.017-.194.023-.388.018-.582.194.005.388-.001.582-.018a7.16 7.16 0 0 0 .66-.093c.247-.045.485-.123.714-.233.23-.11.425-.247.588-.41.59-.59.88-1.223.872-1.9-.009-.676-.317-1.318-.925-1.926-.61-.61-1.533-.93-2.768-.96l-4.944-.028a.326.326 0 0 0-.248.099M9.281 9.434l-.032-4.957c.004-.048.005-.12 0-.216a5.958 5.958 0 0 0-.052-.49 5.198 5.198 0 0 0-.135-.673 3.64 3.64 0 0 0-.29-.712 2.683 2.683 0 0 0-.48-.664c-.607-.608-1.25-.916-1.926-.925-.676-.008-1.31.282-1.899.872-.163.163-.3.359-.41.588-.11.229-.188.467-.233.714a7.16 7.16 0 0 0-.093.66 5.235 5.235 0 0 0-.018.582 5.235 5.235 0 0 0-.582.018 7.16 7.16 0 0 0-.66.093 2.801 2.801 0 0 0-.714.233c-.23.11-.425.247-.588.41-.59.59-.88 1.223-.872 1.9.009.676.317 1.318.925 1.926.61.61 1.533.93 2.768.96l4.944.028c.097.002.18-.03.248-.099a.326.326 0 0 0 .099-.248zM9.182 10.318a.326.326 0 0 1 .099.248l-.032 4.957c.004.048.005.12 0 .216-.003.096-.02.26-.052.49a5.198 5.198 0 0 1-.135.673 3.64 3.64 0 0 1-.29.712c-.135.258-.294.48-.48.664-.607.608-1.25.916-1.926.925-.676.008-1.31-.282-1.899-.872-.163-.163-.3-.359-.41-.588a2.801 2.801 0 0 1-.233-.714 7.16 7.16 0 0 1-.093-.66 5.235 5.235 0 0 1-.018-.582 5.235 5.235 0 0 1-.582-.018 7.16 7.16 0 0 1-.66-.093 2.801 2.801 0 0 1-.714-.233 2.129 2.129 0 0 1-.588-.41c-.59-.59-.88-1.223-.872-1.9.009-.676.317-1.318.925-1.926.61-.61 1.533-.93 2.768-.96l4.944-.028c.097-.002.18.03.248.099"/></g></svg>
          <span>{{ clovers.length }}</span>
        </p>
      </div>
      <div class="py1 px2 min-width-1">
        <p class="m0 h6">Current mining speed</p>
        <p class="m0 h1 nowrap">{{ hashRate }} games/sec</p>
      </div>
      <div class="px1 flex-auto flex justify-end items-stretch self-stretch">
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
          <li @click="select(board)" v-for="board in clovers" class="py1 px2 pointer h6" :class="isFocus(board)">
            <clv :key="board.movesString" :board="miner.byteBoardToRowArray(board.byteBoard)"></clv>
          </li>
        </ul>
      </div>
      <form @submit.prevent='submitCustom()'><input v-model='customMoves'></form>
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
        hashRate: 0,
        mining: false,
        mineTime: 0,
        totalMined: 0,
        opened: false,
        niceOnes: [],
        customMoves: 'C4C5D6C7C6D3E6D7C2B3A2F5C8E3G5B6A5H5F6B1H4A4E7G7E2F7G6B7G8G4F4F3D8H7E8F2H8B5A7E1H3D2G2H2C1C3F1D1A1G1G3A6H6F8B2B8A3H1A8B4',
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
      submitCustom () {
        console.log('submit custom')
        this.miner.playGameMovesString(this.customMoves)
        this.miner.buildString()
        // this.miner.buyClover()
      },
      toggleMiner () {
        this.opened = !this.opened
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
      isFocus (board) {
        if (!this.selectedClover) return false
        return board.byteBoard === this.selectedClover.byteBoard ? 'active-clover' : false
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
