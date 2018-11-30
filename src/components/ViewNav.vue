<template lang="pug">
  nav.relative.h-header.flex.border-bottom
    .flex.flex-auto.pointer(v-for="(item, index) in items", @click="onClick(item, index)", :class="{'opacity-50': index !== active}", :style="itemStyle")
      span.block.m-auto.h6(v-html="item.lbl")
    //- highlight bar
    .absolute.bg-green.left-0.trans-transform.pointer-events-none(:style="barStyle")
</template>

<script>
export default {
  name: 'ViewNav',
  props: ['items', 'initial'],
  inheritAttrs: false,
  data () {
    return {
      active: 0
    }
  },
  computed: {
    itemStyle () {
      return {
        width: 'calc(100% / ' + this.items.length + ')'
      }
    },
    barStyle () {
      return {
        bottom: '-2px',
        height: '3px',
        transform: 'translateX(' + 100 * this.active + '%)',
        width: 'calc(100% / ' + this.items.length + ')'
      }
    }
  },
  methods: {
    onClick (item, index) {
      this.active = index
      this.$emit('change', item.value)
    },
    setActive (val) {
      val = !val ? this.initial : val
      this.items.forEach((item, index) => {
        if (val === item.value) this.active = index
      })
    }
  },
  created () {
    this.setActive()
  }
}
</script>
