<template lang="pug">
  .fixed.overlay.z5.overflow-y-scroll.touch-scroll.bg-white-a70.flex.p2.md-py4.items-start(@mousedown.self="$emit('close')", v-on:keydown.esc="$emit('close')")
    .relative.col-12.mx-auto.my4.md-my3.border.border-dashed.rounded-2.max-width-3.bg-white.shadow
      form
        .flex.items-center.h1
          img.block.ml3.mr2.sm-mr3(src="@/assets/icons/search.svg", style="height:.9em")
          input.block.col-12.h-bttm-bar.pr3(ref="input", name="search", type="search", v-model="query", placeholder='Search', spellcheck="false", autocomplete="off")
      ul.list-reset.m0.h3.pointer.overflow-y-scroll.touch-scroll(v-if="query.length", style="max-height:calc(100vh - 20rem)")
        //- matches go here
        template(v-if="query.toLowerCase() === 'me'")
          li.p3.truncate.hover-bg-l-green Your Profile
          li.p3.truncate.hover-bg-l-green Your Account
          li.p3.truncate.hover-bg-l-green Your Clovers
          li.p3.truncate.hover-bg-l-green Your Basket
          li.p3.truncate.hover-bg-l-green Your Albums
        li.p3.truncate.hover-bg-l-green.bg-lightest-green
          span.opacity-50.mr1 Clovers named
          | "{{query}}"

</template>

<script>
export default {
  name: 'Search',
  props: ['visible'],
  data () {
    return {
      query: '',
      active: 0
    }
  },
  methods: {
    focusInput () {
      if (!this.$refs.input) return
      this.$refs.input.focus()
      this.$refs.input.addEventListener('keydown', this.bindUpDown)
    },
    bindUpDown (e) {
      // if (e.key === 'ArrowDown' || e.keyCode === 40)
    }
  },
  watch: {
    visible (vis) {
      if (vis) return this.focusInput()
      this.query = ''
    }
  }
}
</script>
