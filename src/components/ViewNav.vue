<template lang="pug">
  nav.relative.flex.border-bottom
    .flex.flex-auto.pointer(v-for="(item, index) in items", @click="onClick(item, index)", :class="{'opacity-50': index !== active, 'h-header': !thick, 'p3': thick}", :style="itemStyle")
      span.block.m-auto(v-html="item.lbl", :class="{'h6': !thick, 'font-exp': thick}")
    //- highlight bar
    .absolute.left-0.trans-transform.pointer-events-none(:style="barStyle")
</template>

<script>
export default {
  name: 'ViewNav',
  inheritAttrs: false,
  props: ['items', 'initial', 'thick'],
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
        width: 'calc(100% / ' + this.items.length + ')',
        background: 'currentColor'
      }
    }
  },
  created () {
    this.setActive()
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
  }
}
</script>
