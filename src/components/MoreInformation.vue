<template lang="pug">
    div
        p.center.h6.underline.mb0.help(@click="showMore = true" v-if="!showMore") {{title}}
        p.h6.mb0.mt3.pointer(v-if="showMore" @click="showMore = false" v-html="content")
</template>
<script>
export default {
  name: 'MoreInformation',
  data () {
    return {
      showMore: false
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
