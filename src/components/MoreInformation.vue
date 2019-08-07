<template lang="pug">
    div
        .absolute.right-0.top-0.mt4.help.p2.mr1(@click="show") {{title}}
        .pt2.h3.mb0.mt3.pointer(v-if="showMore" @click="show" v-html="content")
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
