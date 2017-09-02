<template>
  <div>
    <header class="flex bg-fuchsia items-center white">
      <div class="p3 mr2 bg-black"></div>
      <h1 class="m0 flex-auto">{{ tokenName }}</h1>
      <p class="m0 pr2">
        <span id="balance" :class="{white: balance !== '0', red: balance === '0'}">{{ parseFloat(balance).toLocaleString() }}</span> {{ tokenSymbol }}
      </p>
      <p @click="toggleMinePanel" class="m0 pr3 pointer no-select">
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
        showMiner: true
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
