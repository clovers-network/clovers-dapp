<template lang="pug">
  nav.relative.flex
    .flex.flex-auto.pointer.items-center.justify-center(v-for="(item, index) in items", @click="onClick(item, index)", :class="{'p2': !thick, 'p3': thick}", :style="itemStyle")
      span.block(v-html="item.lbl", :class="{'py1 h6': !thick, 'font-exp': thick}")
    //- highlight bar
    .absolute.top-0.left-0.h-100.trans-transform.pointer-events-none.flex(:style="barStyle")
      .border.rounded-2.col-12
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
        // bottom: '-2px',
        // height: '3px',
        transform: 'translateX(' + 100 * this.active + '%)',
        width: 'calc(100% / ' + this.items.length + ')'
        // background: 'currentColor'
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
