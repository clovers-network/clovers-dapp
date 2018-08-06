<template lang="pug">
  section
    header.flex.border-bottom
      .col-6.p3.border-right
        small.lh2.block ETH / ♣
        .font-exp.mt1.truncate {{ lastEthPrice }}
      .col-6.p3
        small.lh2.block Value (ETH)
        .font-exp.mt1.truncate {{ marketCap }}
    section
      .relative
        span.block.absolute.left-0.top-0.p2.z1 All time, ETH
        chart.border-bottom(market="ClubToken", :orders="orders")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      section.py3
        button.h-bttm-bar.bg-green.white.flex.col-12
          span.block.m-auto.font-exp Confirm
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapGetters, mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'
import { prettyBigNumber } from '@/utils'

export default {
  name: 'Trade',
  data () {
    return {
      view: 'buy',
      orders: []
    }
  },
  // tokenSupply * (tokens / value)
  // (tokens / value)
  computed: {
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
        10
      )
    },

    ...mapGetters([
      'userBalance'
    ])
  },
  methods: {
    ...mapActions([
      'getOrders'
    ])
  },
  mounted () {
    this.getOrders(this.market).then((orders) => {
      this.orders.push(...orders)
    })
  },
  components: { ViewNav, Chart }
}
</script>
