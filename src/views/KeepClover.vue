<template lang="pug">
  article.green.fixed.z3.overlay.bg-white.flex
    .col-12.max-width-3.mx-auto.flex.flex-column.justify-between.outline
      header
        .h-header.border-bottom.flex.justify-between.items-center
          .col-3.pl2
            button.pointer(@click="close") Back
          //- h1.col-6.font-exp.center.nowrap Keep or Sell
          .col-9.pr2.right-align
            router-link.font-mono(:to="{name: 'Account/Trade'}") {{prettyUserBalance}} ♣
      figure.flex-auto.relative
        .absolute.bg-contain.bg-no-repeat.bg-center(role="img", v-if="clover", :style="'background-image:url(' + cloverImage(clover) + ')'")
      footer
        .flex.border-top
          .col-6.p3.border-right.relative(@click="action = 'keep'")
            div(:class="{'opacity-25': action !== 'keep'}")
              small.block.lh1 Keep for ♣
              .font-exp.mt1.truncate {{tokenValue}}
              //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'keep'")
                .icon-radio(:class="{'icon-radio--selected': action === 'keep'}")
          .col-6.p3.relative(@click="action = 'sell'")
            div(:class="{'opacity-25': action !== 'sell'}")
              small.block.lh1 Sell instantly for ♣
              .font-exp.mt1.truncate {{tokenValue}}
              //- button.absolute.top-0.right-0.p2.pointer(@click="action = 'sell'")
                .icon-radio(:class="{'icon-radio--selected': action === 'sell'}")
        //- keep btn
        button.bg-green.white.font-exp.flex.col-12.h-bttm-bar.pointer(@click="btnClick", :class="{'pointer-events-none': submitting}")
          span.block.m-auto.capitalize(v-show="!submitting") {{action}}
          wavey-menu.m-auto(v-show="submitting", :isWhite="true")
</template>

<script>
import WaveyMenu from '@/components/Icons/WaveyMenu'
import { mapGetters, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import { fromWei } from 'web3-utils'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
const reversi = new Reversi()
export default {
  name: 'KeepClover',
  props: ['clover'],
  data() {
    return {
      action: 'keep',
      value: null,
      submitting: false
    }
  },
  computed: {
    ...mapGetters(['prettyUserBalance']),
    tokenValue() {
      return this.value ? fromWei(this.value.toString()) : '...'
    },
    sellValue() {
      return this.value
        ? fromWei(this.value.minus(this.$store.state.basePrice).toString())
        : '...'
    }
  },
  methods: {
    cloverImage,
    close() {
      this.$emit('close')
      this.action = 'keep'
    },
    btnClick() {
      if (this.action === 'keep') return this.keep()
      if (this.action === 'sell') return this.sellToBank()
    },
    async keep() {
      this.submitting = true
      try {
        const tx = await this.buy(this.clover)
        this.submitting = false
        console.log('SUCCESS', tx)
      } catch (error) {
        console.log(error)
        this.submitting = false
        // notification
        let msg = { type: 'error', msg: 'Error :-(' }
        switch (error.message) {
          case 'cant-buy-not-for-sale':
            msg.msg = 'Already Registered or Not for Sale :-('
        }
        this.$store.dispatch('addMessage', msg)
      }
    },
    async sellToBank() {
      this.submitting = true
      try {
        const tx = await this.sell({ clover: this.clover })
        this.submitting = false
        console.log('SUCCESS', tx)
      } catch (error) {
        console.log(error)
        this.submitting = false
        // notification
        let msg = { type: 'error', msg: 'Error :-(' }
        switch (error.message) {
          case 'cant-sell-dont-own':
            msg.msg = "Can't Sell, this belongs to another owner"
        }
        this.$store.dispatch('addMessage', msg)
      }
    },
    getValue() {
      reversi.playGameMovesString(this.clover.movesString)
      const syms = reversi.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        wei = new BigNumber(wei)
        this.value = wei.plus(this.$store.state.basePrice)
      })
    },
    ...mapActions(['buy', 'sell'])
  },
  mounted() {
    this.getValue()
  },
  components: { WaveyMenu }
}
</script>

<style lang="css" scoped>
figure > div {
  width: calc(100% - 2rem);
  height: calc(100% - 4rem);
  top: 2rem;
  left: 1rem;
}
</style>
