<template>
  <div>
    <header class="flex bg-purple items-center white">
      <ul class="list-reset px2 py1 flex-auto">
        <li class="inline-block mr2">Clovers</li>
        <li class="inline-block mr2">Latest</li>
        <li class="inline-block mr2">Wallet</li>
      </ul>
      <p class="m0 pr3">
        <span id="balance" :class="{white: balance !== '0', red: balance === '0'}">{{ parseFloat(balance).toLocaleString() }}</span> {{ tokenSymbol }}
      </p>
      <p @click="toggleMinePanel" class="m0 pr2 pointer no-select">
        {{ mineText }}
      </p>
    </header>
    <miner v-show="showMiner"></miner>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Miner from '@/components/Miner'

  export default {
    name: 'header',
    data () {
      return {
        showMiner: false
      }
    },
    methods: {
      toggleMinePanel () {
        this.showMiner = !this.showMiner
      }
    },
    computed: {
      mineText () {
        if (!this.mining) return 'Miner'
        return `Mining at ${this.hashRate} g/s`
      },

      ...mapGetters({
        tokenName: 'name',
        tokenSymbol: 'symbol',
        balance: 'balance',
        hashRate: 'hashRate',
        mining: 'mining'
      })
    },
    components: { Miner }
  }
</script>
