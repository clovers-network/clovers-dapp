<template lang="pug">
    div
      .absolute.right-0.top-0.mt4.pt2.mr3
        button.flex.bg-lightest-green.green.items-center.justify-center(@click="show", style="font-size:0.75em;width:1.5em;height:1.5em;border-radius:100%")
          span.block(style="transform:translateY(-5%)") ?
      .pt2.h4.mb0.mt3.pointer.bg-lightest-green.rounded.py3.px3(v-if="showMore" @click="show" v-html="content")
</template>
<script>
export default {
  name: 'MoreInformation',
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
  },
  props: {
    content: {
      type: String
    },
    title: {
      type: String,
      default: 'More information'
    }
  }
}
</script>
