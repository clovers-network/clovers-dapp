<template lang="pug">
  //- fullscreen overlay
  .fixed.z3.flex.modal(@click.self="close")
    //- card
    .relative.pt3.m-auto.bg-white.border.border-dashed.rounded
      //- header
      nav.absolute.top-0.left-0.col-12.h-header.flex.justify-between.items-center.px2
        //- btn: close
        button.p1.pointer(@click="close")
          span.h5(v-if="cancel") Cancel
          svg-x(v-else, style="width:1.2rem;height:1.2rem", thickness="1.1")
        //- (right-btn)
        slot(name="top-right-btn")
      //- main
      slot
</template>

<script>
import svgX from '@/components/Icons/SVG-X'
export default {
  name: 'Modal',
  props: ['cancel'],
  methods: {
    close () {
      this.$emit('close')
      // let current = { name: this.$route.name }
      // this.$router.push(current)
    }
  },
  components: { svgX }
}
</script>

<style>
</style>
