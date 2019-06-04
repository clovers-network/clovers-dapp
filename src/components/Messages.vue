<template lang="pug">
  .fixed.top-0.left-0.ml2.z3.pointer-events-none.col-12(style="max-height:100vh;overflow-y:auto;")
    .max-width-1.pointer-events-auto
      ul.list-reset(v-if="messages.length > 0")
        li.relative.pt2.px3.pb2.mb2.h4.rounded.border.shadow.border-dashed.bg-white(v-for="msg in messages", :class="msgClass(msg)" :key="msg.id")
          .flex.items-center.justify-between.wrap-word
            h6.h2.mb1(v-if="msg.title", :class="{'anim--msg-strobe': msg.type === 'progress'}" v-html="escape(msg.title)")
            p.block.m0(:class="msg.link ? 'pointer' : ''" @click="clickMessage(msg)" v-html="escape(msg.msg)")

            button.pointer.pl3(@click="removeMessage(msg.id)")
              svg-x(width="12" height="12")
</template>

<script>
import { mapMutations } from 'vuex'
import xss from 'xss'
import svgX from '@/components/Icons/SVG-X'

export default {
  name: 'Messages',
  computed: {
    messages () {
      return this.$store.state.messages
    }
  },
  methods: {
    checkEsc (e) {
      if (e.keyCode === 27 && this.messages.length > 0) {
        this.removeMessage(this.messages[0].id)
      }
    },
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
        case 'info': return 'orange'
        case 'error': return 'red'
        default: return 'green'
      }
    },
    ...mapMutations({
      removeMessage: 'REMOVE_MSG'
    })
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
  },
  destroyed () {
    window.removeEventListener('keyup', this.checkEsc)
  },
  components: { svgX }
}
</script>

<style>
  .anim--msg-strobe{
    animation:msg-strobe 1.25s infinite;
  }

  @keyframes msg-strobe {
    0%{ opacity:1; }
    50%{opacity:0.25;}
    100%{opacity:1;}
  }
</style>
