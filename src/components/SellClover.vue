<template lang="pug">
  form.mx3.mb3.mt2(@submit.prevent="confirm")
    label.block.mb2.h5.center Sale price
    input.border.py2.px2.rounded.col-12.input(v-model="form.price" autocomplete="off" placeholder="Edit Clover price" step="any" type="number" min="0" required v-autofocus="true")

    p.center.h6.mb2.mt3.pointer(@click="form.price = '0'")
      span Set to <span class="font-mono">0</span> to remove from marketplace

    .pt2.center(:class="{'pointer-events-none': submitting}")
      input.font-ext.pointer.py2.px3.rounded.white.trans-bg(:class="cancelled ? 'bg-red' : 'bg-green'", type="submit", :value="buttonText", :disabled="!changed")
</template>

<script>
import { mapActions } from 'vuex'
import { fromWei, toWei } from 'web3-utils'

export default {
  name: 'SellClover',
  data () {
    return {
      form: { price: null },
      submitting: false,
      cancelled: false
    }
  },
  computed: {
    clover () {
      return this.$store.state.currentClover
    },
    cloverPrice () {
      if (!this.clover) return '0'
      return parseFloat(fromWei(this.clover.price.toString(10)))
    },
    sellPriceWei () {
      return this.form.price ? toWei(this.form.price.toString()) : '0'
    },
    changed () {
      if (this.form.price === '') return false
      return this.form.price !== this.cloverPrice
    },
    buttonText () {
      if (this.cancelled) return 'Transaction cancelled'
      if (this.submitting) return 'Submitting...'
      return this.form.price === '0' ? 'Remove from Market' : 'Update Price'
    }
  },
  methods: {
    async confirm () {
      if (this.submitting) return
      try {
        this.submitting = true
        const p = parseFloat(this.form.price).toLocaleString()
        await this.sell({ clover: this.clover, price: this.sellPriceWei })
        this.addMessage({
          msg: `Price changed to ${p}`,
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

    ...mapActions(['sell', 'addMessage'])
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
    this.form.price = this.cloverPrice
    window.addEventListener('keyup', this.checkEsc)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.checkEsc)
  }
}
</script>
