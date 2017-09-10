<template>
  <div >
    <div class="bg-darken-4 fixed top-0 left-0 right-0 bottom-0 z2 pointer" @click="close"></div>
    <div class="bg-black z1 fixed left-0 right-0 white absolute col-12 overflow-hidden z2">
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
            <span>{{ cloversFound }}</span>
            <clover-icon></clover-icon>
          </p>
        </div>
        <div class="py1 px2 min-width-1">
          <p class="m0 h6">Current mining speed</p>
          <p class="m0 h1 nowrap">{{ hashRate }} games/sec</p>
        </div>
        <div class="px1 flex-auto flex justify-end items-stretch self-stretch">
          <template v-if="!mining">
            <button @click="mine" class="py1 px2 border bg-black white h4 bold pointer no-select">Mine Clover</button>
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
      <div v-if="selectedClover" class="relative">
        <div class="lh1 absolute top-0 left-0 m2 z2 pointer p1">
          <a @click="deselect">❌</a>
        </div>
        <claim-clover :clover-data="selectedClover" @claimed="claimed" @remove="remove"></claim-clover>
      </div>
      <div v-if="clovers.length" :class="{'border-top': !selectedClover}"  class="p2 relative">
        <p class="h6 m0 pt1 silver absolute top-0">Mined clovers</p>
        <div>
          <ul class="list-reset flex mxn1 nowrap overflow-auto items-center">
            <li @click="select(board)" v-for="board in newClovers" class="py1 px2 pointer h6" :class="isFocus(board)">
              <clv :no-click='true' :key="board.movesString" :byteBoard="board.byteBoard"></clv>
            </li>
            <li @click="select(board)" v-for="board in claimedClovers" class="py1 px2 pointer h6 claimed" :class="isFocus(board)">
              <clv :no-click='true' :key="board.movesString" :byteBoard="board.byteBoard"></clv>
            </li>
            <li>
              <p v-if="this.limit && this.claimedClovers.length > 4" @click="limit = false" class="mx3 m0 pointer">👁 more</p>
              <p v-if="!this.limit && this.claimedClovers.length > 5" @click="limit = true" class="mx3 m0 pointer">🗃 collapse</p>
            </li>
          </ul>
        </div>
        <!-- <form @submit.prevent='submitCustom()'><input v-model='customMoves'></form> -->
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapGetters } from 'vuex'
  import CloverWorker from 'worker-loader!../assets/clover-worker'
  import Reversi from '../assets/reversi'
  import ClaimClover from '@/components/ClaimClover'
  import moment from 'moment'

  export default {
    name: 'miner',
    data () {
      return {
        miners: [],
        reversi: new Reversi(),
        customMoves: 'C4C5D6C7C6D3E6D7C2B3A2F5C8E3G5B6A5H5F6B1H4A4E7G7E2F7G6B7G8G4F4F3D8H7E8F2H8B5A7E1H3D2G2H2C1C3F1D1A1G1G3A6H6F8B2B8A3H1A8B4',
        interval: null,
        hasStorage: !!window.localStorage,
        selectedClover: null,
        limit: true
      }
    },
    watch: {
      account () {
        this.checkRead()
      },
      showMiner () {
        if (!this.showMiner) this.selectedClover = null
      }
    },
    props: {
      showMiner: {
        type: Boolean,
        default: false
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
      newClovers () {
        return this.clovers.filter(c => !c.claimed)
      },
      claimedClovers () {
        let claims = this.clovers.filter(c => c.claimed).sort((a, b) => {
          return moment(b.claimed) - moment(a.claimed)
        })
        if (this.limit) {
          return claims.slice(0, 5)
        }
        return claims
      },
      cloversFound () {
        return this.$store.state.cloversFound
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
      },

      ...mapGetters({
        account: 'account',
        clover: 'clover'
      })
    },
    methods: {
      checkRead () {
        if (this.hasStorage) {
          this.storedClovers(this.getItem('clovers') || [])
          this.storedMineCount(this.getItem('totalMined') || 0)
          this.storedMineDuration(this.getItem('mineTime') || 0)
          this.storedCloversFound(this.getItem('cloversFound') || 0)
        }
      },
      getItem (key) {
        let res = window.localStorage.getItem(this.account + '_' + key)
        return res && JSON.parse(res)
      },
      setItem (key, val) {
        window.localStorage.setItem(this.account + '_' + key, JSON.stringify(val))
      },
      claimed (byteBoard) {
        console.log('miner claimed:', byteBoard)
        this.claimedClover(byteBoard)
        this.setItem('clovers', this.clovers)
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
        if ('movesString' in data) {
          this.clover.cloverExists(data.byteBoard).then((exists) => {
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
      deselect () {
        this.selectedClover = null
      },
      timer () {
        if (this.mining) {
          this.mineTime = 1
          this.setItem('totalMined', this.totalMined)
          this.setItem('mineTime', this.mineTime)
        }
        if (this.account) {
          this.setItem('clovers', this.clovers)
          this.setItem('cloversFound', this.cloversFound)
        }
      },
      isFocus (board) {
        if (!this.selectedClover) return false
        return board.byteBoard === this.selectedClover.byteBoard ? 'active-clover' : false
      },
      remove () {
        this.$set(this.selectedClover, 'removed', new Date())
        this.removeMinedClover(this.selectedClover)
      },
      updateFindersFee (newVal) {
        this.$set(this.selectedClover, 'findersFee', newVal)
      },
      close () {
        this.$emit('close')
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
        storedMineDuration: 'STORED_DURATION',
        storedCloversFound: 'STORED_CLOVERS_FOUND',
        removeMinedClover: 'REMOVE_MINED_CLOVER',
        claimedClover: 'CLAIMED_CLOVER'
      })
    },
    mounted () {
      this.checkRead()
      this.interval = setInterval(this.timer, 1000)
    },
    destroyed () {
      clearInterval(this.interval)
    },
    components: { ClaimClover }
  }

</script>
