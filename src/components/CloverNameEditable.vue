<template lang="pug">
  .h-header.relative.flex.items-center.justify-center
    div.absolute.overlay.bg-white.flex(v-show="!formFocussed")
      label.input.truncate.flex-auto.center.px4.font-mono {{name}}
      label.absolute.top-0.right-0.h-100.px2.block.regular.nowrap.flex.pointer(for="clvname")
        span.block.flip-x.m-auto ✎
    form.col-12(@submit.prevent="updateName")
      input#clvname.input.font-mono.green.center.col-12.px4(@focus="onFocus", @blur="onBlur", ref="nameInput", placeholder="name", v-model="name", autocomplete="off")
      transition(name="fade")
        button.absolute.right-0.top-0.p2.pointer(v-show="formFocussed", type="submit", aria-label="Submit")
          img(src="~../assets/icons/arrow-right.svg", width="18", height="18")
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'CloverNameEditable',
  props: ['board', 'clover'],
  data () {
    return {
      name: '',
      submitting: false,
      formFocussed: false
    }
  },
  methods: {
    ...mapActions(['updateCloverName']),
    resetName () {
      this.name = this.clover.name
    },
    async updateName () {
      this.submitting = true
      // if no change, or empty: reset, blur
      const isSubmittable = this.name.length && this.name !== this.clover.name
      if (!isSubmittable) {
        this.submitting = false
        this.$refs.nameInput.blur()
        return this.resetName()
      }
      // go
      this.$refs.nameInput.blur()
      await this.updateCloverName({ board: this.clover.board, name: this.name })
      this.submitting = false
    },
    setName (clover) {
      this.name = clover && clover.name.length && clover.name || this.board
    },
    onFocus () {
      setTimeout(() => {
        this.formFocussed = true
      }, 100)
    },
    onBlur () {
      // add enough delay so that resetName() doesn't fire before @submit event
      setTimeout(() => {
        this.formFocussed = false
        if (!this.submitting) this.resetName()
      }, 100)
    }
  },
  watch: {
    clover (clover) {
      this.setName(clover)
    }
  },
  mounted () {
    this.setName(this.clover)
  }
}
</script>

<style>
</style>
