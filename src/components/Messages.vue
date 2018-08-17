<template>
  <div class="fixed top-0 left-0 col-12 z3 mt2">
    <div
      :class="msgClass(msg)"
      class="p2 flex items-center mx2 mb1 h6"
      @click="clickMessage(msg)"
      :key="msg.id"
      v-for="msg in messages" >
      <span >
        <div class="h2 pb2" v-if="msg.title" v-html="escape(msg.title)"/>
        <div v-html="escape(msg.msg)"/>
      </span>
      <span
        class='sending px1'
        v-if="msg.type === 'progress'">✨</span>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import xss from 'xss'

export default {
  name: 'Messages',

  data () {
    return {}
  },
  computed: {
    messages () {
      return this.$store.state.messages
    }
  },
  methods: {
    escape (msg) {
      return xss(msg)
    },
    clickMessage (msg) {
      if (msg.link) {
        this.$router.push(msg.link)
      }
      this.removeMessage(msg.id)
    },
    msgClass (msg) {
      switch (msg.type) {
        case 'success':
          return 'bg-green white'
        case 'progress':
          return 'bg-white green border'
        case 'error':
          return 'bg-red white'
        default:
          return 'bg-white green border'
      }
    },
    ...mapMutations({
      removeMessage: 'REMOVE_MSG',
      addMessage: 'ADD_MSG'
    })
  }
}
</script>
