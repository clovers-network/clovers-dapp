<template lang="pug">
  form.mx3.mb3.mt2(@submit.prevent="confirm")
    label.block.mb2.h5.center Send to Address (or ENS)
    input.border.py2.px2.rounded.col-12.input(v-model="form.address" autocomplete="off" placeholder="Address" v-autofocus)

    .pt3.center(:class="{'pointer-events-none': submitting}")
      input.font-ext.pointer.py2.px3.rounded.white.trans-bg(:class="cancelled ? 'bg-red' : 'bg-green'", :value="buttonText", :disabled="!changed", type="submit")
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'TransferClover',
  data () {
    return {
      form: { address: '' },
      submitting: false,
      cancelled: false
    }
  },
  computed: {
    clover () {
      return this.$store.state.currentClover
    },
    changed () {
      return this.form.address !== ''
    },
    buttonText () {
      if (this.cancelled) return 'Transaction cancelled'
      return this.submitting ? 'Submitting...' : 'Transfer Clover'
    }
  },
  methods: {
    async confirm () {
      this.submitting = true
      const t = {
        clover: this.clover,
        ...this.form
      }
      this.transferClover(t).then(() => {
        this.$emit('cancel')
      }).catch((err) => {
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
      })
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.$emit('cancel')
      }
    },

    ...mapActions(['transferClover', 'addMessage'])
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
  }
}
</script>
