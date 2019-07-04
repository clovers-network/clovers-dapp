<template lang="pug">
  section
    header.flex.border-bottom(v-if="!isRFT")
      .col-6.p2
        small.lh2.block.h6 My Balance
        .font-exp.mt1.truncate {{prettyUserBalance}} &clubs;&#xfe0e;
      .col-6.p2.border-left(v-if="!isRFT")
        small.lh2.block.h6 Total Value
        .font-exp.mt1.truncate ${{userBalanceInUSD.toFixed(2)}}
    section
      .flex.flex-column
        //- chart
        .col-12.relative
          span.block.absolute.left-0.top-0.p2.h6 Price Graph in {{collateral}} per <span v-html="currentToken" />
          span.block.absolute.right-0.top-0.p2.h6.pointer(@click="switchMax") Last {{orders.slice(0, max).length}} trades
          chart.border-bottom(:market="market", :orders="orders.slice(0,max)")
        //- details
        .col-12.flex.flex-wrap(:class="{'flex-order_-1': isRFT}")
          //- price
          .col-12.md-col-4.p2.border-bottom.md-border-right
            small.lh2.block.h6 {{isRFT ? 'Share Price' : '&clubs;&#xfe0e; Value in USD'}}
            .font-exp.mt1.truncate(v-if="isRFT") ${{ priceInUSD.toFormat(4) }}
            .font-exp.mt1.truncate(v-else) ${{ priceInUSD.toFormat(2) }} <span class="opacity-50 font-reg"> / <span v-html="currentToken" /></span>
          //- supply
          .col-6.md-col-4.p2.border-bottom
            small.lh2.block.h6 Total {{currentTokenPlural}}
            .font-exp.mt1.truncate {{ totalSupply.toFormat(0) }}
          //- market cap
          .col-6.md-col-4.p2.border-left.border-bottom
            small.lh2.block.h6 Market Cap
            .font-exp.mt1.truncate(v-if="isRFT") ${{ marketCapInUSD.toFormat(2) }}
            .font-exp.mt1.truncate(v-else) ${{ marketCapInUSD.toFormat(2) }}
      //- TRADE
      view-nav.bg-green.white(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event", :thick="true")
      //- BUY
      section.bg-green.white(v-if="view === 'buy'")
        form(@submit.prevent="buyTokens")
          .p2
            p.h7.mb1
              span Spend
              span.opacity-50.pointer(v-if="isRFT", @click="spendAll") &emsp;(all)
            .relative
              input.input.border.font-exp.white(v-model="buy", placeholder="0", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{collateral}}
          .p2.pb3
            p.h7.mb1 Receive
            .relative
              .pt1.pl2.pb2.border-bottom.font-exp {{clubReceive}}
              span.absolute.top-0.right-0.py1.claimed {{currencies}}
          button(:disabled="working").h-bttm-bar.bg-green.white.bottom-0.col-12.pointer.border-top
            span.font-exp(v-if="!working") Confirm
            wavey-menu.m-auto(v-else, :is-white="true")

      //- SELL
      section.bg-green.white(v-else)
        form(@submit.prevent="sellTokens")
          .p2
            p.h7.mb1
              span Amount
              span.opacity-50.pointer(@click="sellAll") &emsp;(all)
            .relative
              input.input.border.font-exp.white(v-model="sell", placeholder="0", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{currencies}}
          .p2.pb3
            p.h7.mb1 Receive
            .relative
              //- input.input.border.font-exp(v-model="ethReceive", placeholder="ETH", disabled="true")
              .pt1.pl2.pb2.border-bottom.font-exp {{ethReceive}}
              span.absolute.top-0.right-0.py1.pr2.pb2.claimed {{collateral}}
          button(:disabled="working").h-bttm-bar.bg-green.white.bottom-0.col-12.pointer.border-top.pointer
            span.font-exp(v-if="!working") Confirm
            wavey-menu.m-auto(v-else, :is-white="true")
</template>

<script>
import utils from 'web3-utils'
import BigNumber from 'bignumber.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'
import { prettyBigNumber } from '@/utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'

export default {
  name: 'Trade',
  props: {
    market: {
      type: String,
      default: 'ClubToken'
    },
    sharesOwnedWei: String
  },
  data () {
    return {
      max: 100,
      view: 'buy',
      buy: '1',
      clubReceive: '1',
      sell: '10',
      ethReceive: '1',
      working: false
    }
  },
  head: {
    title: { inner: 'Trade' },
    meta: [{ name: 'description', content: 'Exchange Ether for Clovers Coins', id: 'meta-desc' }]
  },
  watch: {
    'orders.length' () {
      this.checkOutMarket()
    },
    buy (amount) {
      this.checkPrice(amount)
    },
    sell (amount) {
      this.checkSell(amount)
    }
  },
  computed: {
    isRFT () {
      return this.market !== 'ClubToken'
    },
    marketContract () {
      return this.isRFT ? 'CurationMarket' : 'ClubTokenController'
    },
    collateral () {
      return this.isRFT ? '♣︎' : 'ETH'
    },
    currentToken () {
      return this.isRFT ? 'Share' : '♣︎&#xfe0e;'
    },
    currentTokenPlural () {
      return this.currentToken === 'Share' ? 'Shares' : '♣︎'
    },
    currencies () {
      return this.currentToken === 'Share' ? 'Shares' : 'Coins (♣︎)'
    },
    priceInEth () {
      if (this.marketContract === 'CurationMarket') {
        return this.priceInCollateral.div(new BigNumber(utils.fromWei(this.clubTokenPrice)))
      } else {
        return this.priceInCollateral
      }
    },
    priceInUSD () {
      return this.priceInEth.times(new BigNumber(this.ethPrice))
    },
    userBalanceInUSD () {
      return parseFloat(this.prettyUserBalance) * this.priceInUSD
    },
    totalSupplyWei () {
      if (!this.orders.length) return new BigNumber(0)
      let recent = this.orders[0]
      return new BigNumber(recent.tokenSupply)
    },
    totalSupply () {
      return new BigNumber(
        utils.fromWei(this.totalSupplyWei.round().toString(10))
      )
    },
    marketCapInCollateralWei () {
      return this.priceInCollateral.times(this.totalSupplyWei)
    },
    marketCapInCollateral () {
      return new BigNumber(
        utils.fromWei(this.marketCapInCollateralWei.round().toString(10))
      )
    },
    marketCapInUSD () {
      return this.totalSupply.times(this.priceInUSD)
    },

    ...mapState(['ethPrice', 'clubTokenPrice', 'orders']),
    ...mapGetters(['userBalance', 'prettyUserBalance', 'priceInCollateral'])
  },
  methods: {
    switchMax () {
      let len = this.orders.length
      if (len <= 10) return false
      else if (this.max === 10 && len >= 10) this.max = 100
      else if (this.max === 100 && len >= 100) this.max = 1000
      else this.max = 10
    },
    checkPrice (amount = '1') {
      this.getBuy({ market: this.market, amount }).then(tokens => {
        this.clubReceive = prettyBigNumber(tokens, 0)
      })
    },
    checkSell (amount = '10') {
      this.getSell({ market: this.market, amount }).then(eths => {
        this.ethReceive = prettyBigNumber(eths, 6)
      })
    },
    buyTokens () {
      const receiving = this.clubReceive
      this.working = true
      this.invest({ market: this.market, amount: this.buy })
        .then((res) => {
          this.working = false
          this.handleSuccess(
            `Success! You bought ${receiving} ${this.currentTokenPlural}`
          )
          this.$emit('trade')
        })
        .catch(err => {
          this.working = false
          this.handleError(err)
        })
    },
    sellTokens () {
      const selling = this.sell
      this.working = true
      this.divest({
        market: this.market,
        amount: this.sell,
        clover: this.board
      })
        .then((res) => {
          this.working = false
          this.handleSuccess(
            `Success! You sold ${selling} ${this.currentTokenPlural}`
          )
          this.$emit('trade')
        })
        .catch(err => {
          this.working = false
          this.handleError(err)
        })
    },
    handleError ({ message }) {
      this.selfDestructMsg({
        msg: message.replace('Error: ', ''),
        type: 'error'
      })
    },
    handleSuccess (msg) {
      this.addMessage({
        msg,
        type: 'success'
      })
    },
    checkOutMarket () {
      this.getClubTokenPrice()
      this.getOrders(this.market || 'ClubToken')
      this.checkPrice(this.buy)
      this.checkSell()
    },
    spendAll () {
      this.buy = this.userBalance
    },
    sellAll () {
      this.sell = this.isRFT ? prettyBigNumber(this.sharesOwnedWei, 18) : this.userBalance
    },

    ...mapActions([
      'getClubTokenPrice',
      'clearOrders',
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
    this.checkOutMarket()
  },
  destroyed () {
    this.clearOrders()
  },
  components: { ViewNav, Chart, WaveyMenu }
}
</script>
