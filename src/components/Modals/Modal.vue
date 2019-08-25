<template lang="pug">
  //- fullscreen overlay
  .fixed.z5.flex.modal.touch-scroll(@click.self="close")
    //- card
    .relative.pt3.m-auto.bg-white.border.border-dashed.rounded(@click.stop)
      //- header
      nav.absolute.z2.top-0.left-0.col-12.h-header.flex.justify-between.items-center.px2
        //- btn: close
        button.p1.pointer(@click="close")
          //- span.h5(v-if="cancel") Cancel
          svg-x(style="width:1.2rem;height:1.2rem", thickness="1.1")
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
    },
    onKeydown (e) {
      return e.keyCode === 27 && this.close() // ESC > close
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKeydown)
  },
  destroyed () {
    window.removeEventListener('keydown', this.onKeydown)
  },
  components: { svgX }
}
</script>

<style>
</style>
