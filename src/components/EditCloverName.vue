<template lang="pug">
  form.mx3.mb3.mt2(@submit.prevent="confirm")
    label.block.mb2.h5.center Change Clover name
    input.border.py2.px2.rounded.col-12.input(v-model="form.name" autocomplete="off" placeholder="Edit Clover name" v-autofocus="true")

    .pt3.center
      input.font-ext.pointer.py2.px3.rounded.bg-green.white(type="submit" value="Save" :disabled="!changed")
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'EditCloverName',
  data () {
    return {
      form: { name: null },
      submitting: false
    }
  },
  computed: {
    clover () {
      return this.$store.state.currentClover
    },
    cloverName () {
      if (!this.clover) return ''
      return this.clover.name || ''
    },
    changed () {
      return !this.submitting && (this.form.name !== this.cloverName)
    }
  },
  methods: {
    async confirm () {
      const c = {
        board: this.clover.board,
        ...this.form
      }
      this.updateCloverName(c).then(() => {
        this.$emit('cancel')
      })
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.$emit('cancel')
      }
    },

    ...mapActions(['updateCloverName'])
  },
  mounted () {
    this.form.name = this.cloverName
    window.addEventListener('keyup', this.checkEsc)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.checkEsc)
  }
}
</script>
