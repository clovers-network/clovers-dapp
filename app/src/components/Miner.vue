<template>
  <div>
    <button @click="mine">Mine it</button>
    <p>Time spent mining: <strong>{{ mineTime }}s</strong></p>
    <button @click="stop">pls stop</button>
    <br>
    <h1 v-if="mining">{{ hashRate }} games/sec</h1>
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
        miner: null,
        hashRate: 0,
        mining: false,
        start: null,
        mineTime: 0,
        totalMined: 0,
        niceOnes: []
      }
    },
    methods: {
      mine () {
        this.mining = true
        this.start = new Date()
        this.miner = new CloverWorker()
        this.miner.onmessage = this.handleSymmetry
        this.miner.postMessage('start')
      },
      stop () {
        this.miner.postMessage('stop')
        this.mining = false
        this.start = null
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
