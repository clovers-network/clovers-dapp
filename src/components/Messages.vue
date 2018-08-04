<template>
  <div class="fixed bottom-0 left-0 z3 m1">
    <div
      :class="buildClass(msg)"
      class="block btn p2 m1"
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
    buildClass (msg) {
      return {
        'bg-green': msg.type === 'success',
        'bg-orange': msg.type === 'progress',
        'bg-red': msg.type === 'error'
      }
    },
    ...mapMutations({
      removeMessage: 'REMOVE_MSG',
      addMessage: 'ADD_MSG'
    })
  }
}
</script>
