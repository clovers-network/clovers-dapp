<template lang="pug">
  article#learn.fixed.top-0.left-0.right-0.bottom-0.bg-white.overflow-y-scroll(ref="body", style="z-index: 90")
    #learn_index_0.h-100vh.relative
      intro(@next="next(1)")
    #learn_index_1.h-100vh.relative(v-if="index > 0")
      create-clovers
</template>

<script>
import Intro from './Learn__Section--Intro'
import CreateClovers from './Learn__Section--CreateClovers'
export default {
  name: 'Learn',
  data () {
    return {
      index: 0
    }
  },
  methods: {
    next (to) {
      console.log('next')
      this.index++
      this.$nextTick(() => this.$scrollTo('#learn_index_' + to, 600, { container: '#learn' }))
    }
  },
  components: {
    Intro,
    CreateClovers
  }
}
</script>

<style>
</style>
