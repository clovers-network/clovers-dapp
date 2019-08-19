<template lang="pug">
  .mx3.mb3.mt2

    .center
      .inline-block.py2.px3.border-dashed.rounded
        span.h3.font-exp.flex.items-center.wrap-word {{ cloverPrice }} <coin-icon class="ml1"/>

    .flex.justify-around.my3.bg-lightest-green.green.rounded.py3.center.items-center
      .px1.col-6.border-right
        small.block.lh1.h6.mb1 Your Balance
        span.flex.items-center.justify-center.font-exp {{ prettyUserBalance }} <coin-icon class="ml1"/>
      .px1.col-6
        small.block.lh1.h6.mb1 Balance After
        span.flex.items-center.justify-center.font-exp.wrap-word {{ balanceAfter }} <coin-icon class="ml1"/>

    footer.font-exp.center.mb2(:class="{'pointer-events-none': submitting}")
      button.pointer.py2.px3.rounded-2.white.trans-bg.h3(:class="cancelled ? 'bg-red' : 'bg-green'", type="submit", @click="confirm") {{ buttonText }}
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { prettyBigNumber, bnMinus } from '@/utils'
import { fromWei, toWei } from 'web3-utils'
import CoinIcon from '@/components/Icons/CoinIcon'

export default {
  name: 'BuyClover',
  data () {
    return {
      submitting: false,
      cancelled: false
    }
  },
  computed: {
    clover () {
      return this.$store.state.currentClover
    },
    price () {
      return this.clover.price
    },
    cloverPrice () {
      if (!this.clover) return '0'
      return parseFloat(fromWei(this.price.toString(10))).toLocaleString()
    },
    buttonText () {
      if (this.cancelled) return 'Transaction cancelled'
      return this.submitting ? 'Submitting...' : 'Buy'
    },
    balanceAfterBn () {
      if (!this.userBalance) return new this.$BN('0')
      if (!this.price) return new this.$BN('0')
      return bnMinus(this.userBalanceWei, this.price, 0)
    },
    balanceAfter () {
      if (!this.userBalance) return '0'
      if (!this.price) return new this.$BN('0')

      return prettyBigNumber(this.balanceAfterBn, 0)
    },

    ...mapGetters(['userBalance', 'userBalanceWei', 'prettyUserBalance'])
  },
  methods: {
    async confirm () {
      if (this.submitting) return
      try {
        this.submitting = true
        await this.buy(this.clover)
        this.addMessage({
          msg: 'Clover purchased!',
          type: 'success'
        })
        this.submitting = false
        this.$emit('cancel')
      } catch (err) {
        this.submitting = false
        const { message } = err
        if (message.includes('User denied')) {
          this.cancelled = true
          return
        }
        this.addMessage({
          msg: err.message,
          type: 'error'
        })
      }
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.$emit('cancel')
      }
    },

    ...mapActions(['buy', 'addMessage'])
  },
  watch: {
    cancelled (newVal) {
      if (newVal) {
        setTimeout(() => {
          this.cancelled = false
        }, 1500)
      }
    }
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.checkEsc)
  },
  components: { CoinIcon }
}
</script>
