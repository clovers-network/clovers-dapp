<template>
  <div class="fixed top-0 left-0 col-12 z3 mt2">
    <div
      :class="msgClass(msg)"
      class="p2 flex items-center mx2 mb1 h6"
      @click="clickMessage(msg)"
      :key="msg.id"
      v-for="msg in messages" >
      <span v-html="escape(msg.msg)"/>
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
      return {
        'bg-green white': msg.type === 'success',
        'bg-white green border': msg.type === 'progress',
        'bg-red white': msg.type === 'error'
      }
    },
    ...mapMutations({
      removeMessage: 'REMOVE_MSG',
      addMessage: 'ADD_MSG'
    })
  }
}
</script>
