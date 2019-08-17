<template lang="pug">
    div
      .absolute.right-0.top-0.mt4.pt2.mr3(v-if="btn")
        button.flex.bg-lightest-green.green.items-center.justify-center(@click="show", style="font-size:0.75em;width:1.5em;height:1.5em;border-radius:100%")
          span.block(style="transform:translateY(-5%)") ?
      .mb0.pt2.h4.my3.pointer.bg-lightest-green.rounded.p3(v-if="showMore || parentShow")
        slot
</template>
<script>
export default {
  name: 'MoreInformation',
  props: ['btn', 'parentShow'],
  data () {
    return {
      showMore: false
    }
  },
  methods: {
    show () {
      if (this.showMore) {
        this.showMore = false
      } else {
        this.showMore = true
      }
    }
  }
}
</script>
