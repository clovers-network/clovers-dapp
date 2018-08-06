<template lang="pug">
  section
    header.flex.border-bottom
      .col-6.p3.border-right
        small.lh2.block ETH / ♣
        .font-exp.mt1.truncate {{ ethPriceNum }}
      .col-6.p3
        small.lh2.block Value (ETH)
        .font-exp.mt1.truncate {{ marketCap }}
    section
      .relative
        span.block.absolute.left-0.top-0.p2.z1.h6 ETH Price
        chart.border-bottom(market="ClubToken", :orders="orders")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      section(v-if="view === 'buy'")
        form(@submit.prevent="buyTokens")
          .p2
            p.h7.mb1 I want to spend
            .relative
              input.input.border.font-exp(v-model="buy", placeholder="ETH", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed ETH
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="clubReceive", placeholder="♣ Tokens", disabled="true")
              span.absolute.top-0.right-0.p2.claimed ♣
          .h-bttm-bar.bg-green.white.sticky.bottom-0.col-12
            button.h-bttm-bar.block.m-auto.font-exp(v-if="!working") Buy
            .h-bttm-bar.block.m-auto.flex.justify-center.items-center(v-else)
              wavey-menu(:is-white="true")

      section(v-else)
        form(@submit.prevent="sellTokens")
          .p2
            p.h7.mb1 I want to sell
            .relative
              input.input.border.font-exp(v-model="sell", placeholder="♣ Tokens", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed ♣
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="ethReceive", placeholder="ETH", disabled="true")
              span.absolute.top-0.right-0.p2.claimed ETH
          .h-bttm-bar.bg-green.white.sticky.bottom-0.col-12
            button.h-bttm-bar.block.m-auto.font-exp(v-if="!working") Sell
            .h-bttm-bar.block.m-auto.flex.justify-center.items-center(v-else)
              wavey-menu(:is-white="true")

</template>

<script>
import BigNumber from 'bignumber.js'
import { mapGetters, mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'
import { prettyBigNumber } from '@/utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'

const market = 'ClubTokenController'

export default {
  name: 'Trade',
  data () {
    return {
      view: 'buy',
      orders: [],
      buy: '1',
      clubReceive: '1',
      sell: '10',
      ethReceive: '1',
      working: false
    }
  },
  watch: {
    buy (amount) {
      this.checkPrice(amount)
    },
    sell (amount) {
      this.checkSell(amount)
    }
  },
  computed: {
    ethPriceNum () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return new BigNumber(recent.value)
        .div(new BigNumber(recent.tokens)).toFormat(2)
    },
    lastEthPrice () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return new BigNumber(recent.value)
        .div(new BigNumber(recent.tokens))
    },
    lastTokenPrice () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return new BigNumber(recent.tokens)
        .div(new BigNumber(recent.value))
    },
    marketCap () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return prettyBigNumber(this.lastTokenPrice.times(recent.tokenSupply).toFixed(0), 0)
    },

    ...mapGetters([
      'userBalance'
    ])
  },
  methods: {
    checkPrice (amount = '1') {
      this.getBuy({ market, amount }).then((tokens) => {
        this.clubReceive = prettyBigNumber(tokens, 0)
      })
    },
    checkSell (amount = '10') {
      this.getSell({ market, amount }).then((eths) => {
        this.ethReceive = prettyBigNumber(eths, 6)
      })
    },
    buyTokens () {
      this.working = true
      this.invest({ market, amount: this.buy }).then((res) => {
        this.working = false
        this.handleSuccess(`Success! You bought ${this.buy} ♣ token(s)`)
        console.log(res)
      }).catch((err) => {
        this.working = false
        this.handleError(err)
      })
    },
    sellTokens () {
      this.working = true
      this.divest({ market, amount: this.sell }).then((res) => {
        this.working = false
        this.handleSuccess(`Success! You sold ${this.sell} ♣ token(s)`)
        console.log(res)
      }).catch((err) => {
        this.working = false
        this.handleError(err)
      })
    },
    handleError (err) {
      this.selfDestructMsg({ msg: err.message, type: 'error' })
    },
    handleSuccess (msg) {
      this.addMessage({
        msg,
        type: 'success'
      })
    },

    ...mapActions([
      'getOrders',
      'getBuy',
      'getSell',
      'invest',
      'divest',
      'addMessage',
      'selfDestructMsg'
    ])
  },
  mounted () {
    this.getOrders(this.market).then((orders) => {
      this.orders.push(...orders)
    })
    this.checkPrice()
    this.checkSell()
  },
  components: { ViewNav, Chart, WaveyMenu }
}
</script>
