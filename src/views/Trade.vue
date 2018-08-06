<template lang="pug">
  section
    header.flex.border-bottom
      .col-6.p3.border-right
        small.lh2.block ♣ / ETH
        .font-exp.mt1.truncate {{ lastEthPrice }}
      .col-6.p3
        small.lh2.block Value (ETH)
        .font-exp.mt1.truncate {{ marketCap }}
    section
      .relative
        span.block.absolute.left-0.top-0.p2.z1.h6 ETH Price
        chart.border-bottom(market="ClubToken", :orders="orders")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      section(v-if="view === 'buy'")
        form(@submit.prevent)
          .p2
            p.h7.mb1 I want to spend
            .relative
              input.input.border.font-exp(v-model="buy", placeholder="ETH", type="number", min="0")
              span.absolute.top-0.right-0.p2.claimed ETH
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="clubReceive", placeholder="♣ Tokens", disabled="true")
              span.absolute.top-0.right-0.p2.claimed ♣
          button.h-bttm-bar.bg-green.white.sticky.bottom-0.col-12
            span.block.m-auto.font-exp Buy
      section(v-else)
        form(@submit.prevent)
          .p2
            p.h7.mb1 I want to sell
            .relative
              input.input.border.font-exp(v-model="sell", placeholder="♣ Tokens", type="number", min="0")
              span.absolute.top-0.right-0.p2.claimed ♣
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="ethReceive", placeholder="ETH", disabled="true")
              span.absolute.top-0.right-0.p2.claimed ETH
          button.h-bttm-bar.bg-green.white.sticky.bottom-0.col-12
            span.block.m-auto.font-exp Sell
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapGetters, mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'
import { prettyBigNumber } from '@/utils'

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
      return new BigNumber(recent.tokens)
        .div(new BigNumber(recent.value)).toNumber()
    },
    lastEthPrice () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return new BigNumber(recent.tokens)
        .div(new BigNumber(recent.value)).toFormat(0)
    },
    marketCap () {
      if (!this.orders.length) return 0
      let recent = this.orders[0]
      return prettyBigNumber(
        new BigNumber(recent.tokenSupply)
          .times(new BigNumber(this.lastEthPrice)),
        0
      )
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

    ...mapActions([
      'getOrders',
      'getBuy',
      'getSell'
    ])
  },
  mounted () {
    this.getOrders(this.market).then((orders) => {
      this.orders.push(...orders)
    })
    this.checkPrice()
    this.checkSell()
  },
  components: { ViewNav, Chart }
}
</script>
