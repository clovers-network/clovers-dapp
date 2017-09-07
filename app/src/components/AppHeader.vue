<template>
  <div class="overflow-hidden">
    <header class="flex bg-purple items-center white">
      <ul class="list-reset px2 py1 my0 flex-auto">
        <li class="inline-block mr2">
          <router-link to="/" class="white">Clovers</router-link>
        </li>
        <li class="inline-block mr2">Latest</li>
        <li class="inline-block mr2">
          <router-link to="/wallet" class="white">Wallet</router-link>
        </li>
        <li class="inline-block mr2"></li>
      </ul>
      <p class="m0 pr3">
        <span>{{ cloversFound }}</span>
        <clover-icon width="14" height="14"></clover-icon>
      </p>
      <p class="m0 pr3">
        <span id="balance" :class="{white: balance !== '0', red: balance === '0'}">{{ balanceString }}</span> {{ tokenSymbol }}
      </p>
      <p @click="toggleMinePanel" class="m0 py2 px3 pointer no-select bg-black white">
        {{ mineText }}
      </p>
    </header>
    <miner v-show="showMiner" @close="toggleMinePanel"></miner>
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
        if (!this.mining) return 'Miner stopped'
        return `Mining at ${this.hashRate} g/s`
      },
      cloversFound () {
        return this.$store.state.cloversFound
      },
      balanceString () {
        return parseInt(this.balance).toLocaleString()
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
