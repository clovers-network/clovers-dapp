<template lang="pug">
  section
    header.flex.border-bottom
      .col-4.p2.border-right
        small.lh2.block Price
        .font-exp.mt1.truncate ${{ priceInUSD.toFormat(4) }} per {{ currentToken }}
      .col-4.p2.border-right
        small.lh2.block Total Supply
        .font-exp.mt1.truncate {{ totalSupply.toFormat(2) }} {{ currentTokenPlural }}
      .col-4.p2
        small.lh2.block Market Cap
        .font-exp.mt1.truncate ${{ marketCapInUSD.toFormat(2) }}
    section
      .relative
        span.block.absolute.left-0.top-0.p2.h6 Price Graph in {{collateral}} per {{currentToken}}
        chart.border-bottom(:market="market", :orders="orders.slice(0,6)")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      //- BUY
      section.pb4(v-if="view === 'buy'")
        form(@submit.prevent="buyTokens")
          .p2
            p.h7.mb1
              span Spend
              span.light-green.pointer(@click="spendAll") &emsp;(all)
            .relative
              input.input.border.font-exp.green(v-model="buy", placeholder="0", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{collateral}}
          .p2
            p.h7.mb1 Receive
            .relative
              .pt1.pl2.pb2.border-bottom.font-exp {{clubReceive}}
              span.absolute.top-0.right-0.py1.claimed {{currencies}}
          button(:disabled="working").h-bttm-bar.bg-green.white.fixed-center-max-width.bottom-0.col-12.pointer
            span.font-exp.h3(v-if="!working") Buy
            wavey-menu.m-auto(v-else, :is-white="true")

      //- SELL
      section.pb4(v-else)
        form(@submit.prevent="sellTokens")
          .p2
            p.h7.mb1
              span Amount
              span.light-green.pointer(@click="sellAll") &emsp;(all)
            .relative
              input.input.border.font-exp.green(v-model="sell", placeholder="0", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{currencies}}
          .p2
            p.h7.mb1 Receive
            .relative
              //- input.input.border.font-exp(v-model="ethReceive", placeholder="ETH", disabled="true")
              .pt1.pl2.pb2.border-bottom.font-exp {{ethReceive}}
              span.absolute.top-0.right-0.py1.pr2.pb2.claimed {{collateral}}
          button(:disabled="working").h-bttm-bar.bg-green.white.fixed-center-max-width.bottom-0.col-12.pointer
            span.font-exp.h3(v-if="!working") Sell
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
  data () {
    return {
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
    meta: [{ name: 'description', content: 'Exchange Ether for Clovers Club Tokens', id: 'meta-desc' }]
  },
  props: {
    market: {
      type: String,
      default: 'ClubToken'
    },
    sharesOwnedWei: String
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
      return this.isRFT ? 'Share' : '♣︎'
    },
    currentTokenPlural () {
      return this.currentToken === 'Share' ? 'Shares' : '♣︎'
    },
    currencies () {
      return this.currentToken === 'Share' ? 'Shares' : 'Club Tokens (♣︎)'
    },
    priceInCollateral () {
      if (!this.orders.length) return new BigNumber(0)
      let recent = this.orders[0]
      return new BigNumber(recent.value).div(new BigNumber(recent.tokens))
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
    ...mapGetters(['userBalance'])
  },
  methods: {
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
      this.buy = prettyBigNumber(this.userBalance, 18)
    },
    sellAll () {
      this.sell = prettyBigNumber(this.sharesOwnedWei, 18)
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
