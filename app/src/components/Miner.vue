<template>
  <div>
    <button @click="mine">{{ mineBtn }}</button>
    <!-- <button @click="">More cores+</button> -->
    <p>Time spent mining: <strong>{{ mineTime }}s</strong></p>
    <p>Cores: <strong>{{ miners.length }}</strong></p>
    <button v-if="miners.length" @click="stop">{{ stopBtn }}</button>
    <br>
    <h1 v-if="mining">{{ hashRate * miners.length }} games/sec</h1>
    <p v-if="totalMined">Total c. <strong>{{ totalMined.toLocaleString() }}</strong></p>

    <div v-if="niceOnes.length">
      <p>Symmetrical findings <strong>{{ niceOnes.length }}</strong></p>
      <pre v-for="clover of niceOnes" v-text="draw(clover.visualBoard)"></pre>
    </div>
  </div>
</template>

<script>
  const CloverWorker = require('worker-loader!../assets/clover-worker')

  export default {
    name: 'mine',
    data () {
      return {
        miners: [],
        miner: null,
        hashRate: 0,
        mining: false,
        mineTime: 0,
        totalMined: 0,
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
          this.niceOnes.push(data)
        }
      },
      draw (clover) {
        if (!clover.length) return 'empty...'

        let display = ''
        for (let row of clover) {
          display += row.join(' ') + '\n'
        }
        return display
      }
    },
    mounted () {
      setInterval(() => {
        if (this.mining) this.mineTime = this.mineTime + 1
      }, 1000)
    }
  }
</script>
