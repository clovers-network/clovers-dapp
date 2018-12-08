<template lang="pug">
  div
    .material-icons.pointer(@click="showChat = true") chat_bubble_outline

    transition(name="fade")
      section(v-if="showChat", name="comments").fixed-center-max-width.top-0.bottom-0.bg-white.green.z4.overflow-hidden
        .relative.bg-green.white.p1.sticky.top-0
          p.center.font-exp.h2.m0 Comments
          span(@click="showChat = false").absolute.top-0.right-0.mr2.mt1.pointer.h2 &times;
        div(v-chat-scroll="{ smooth: true }").chat-scroll.overflow-auto
          ul.list-reset.m0.border-top
            li(v-if="comments.length").px2.py3.center.light-green Start of chat
            li(v-else).px2.py3.center.light-green Nothing here yet
            li(v-for="comment in comments" :key="comment.id").px2.pb2
              .p2.border.rounded.msg
                .flex.mb1
                  p(v-text="comment.userName").col-6.font-exp.m0
                  p(v-text="commentDate(comment.created)").col-6.h6.right-align.m0
                p(v-text="comment.comment").m0.pre-line
        .p2.green.sticky.bottom-0.bg-white.border-top
          div(v-if="signedIn")
            p.font-exp Add a comment 💬
            form(@submit.prevent="postComment", @keydown.meta.enter.prevent="postComment")
              textarea(v-model="newComment", rows="4", placeholder="Your comment").p2.col-12.h4.green
              .right-align.mt2
                button(type="submit", :disabled="posting", v-text="buttonTxt").px3.py2.bg-green.white.font-exp
          div(v-else).gray
            p.font-exp.m0 Sign in to comment
</template>

<script>
import io from 'socket.io-client'
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Comments',
  props: {
    board: { type: String, required: true }
  },
  data () {
    return {
      socket: null,
      showChat: false,
      comments: [],
      newComment: '',
      posting: false
    }
  },
  computed: {
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    buttonTxt () {
      return this.posting ? 'Posting...' : 'Submit'
    }
  },
  methods: {
    commentDate (d) {
      return moment(d).fromNow()
    },
    postComment () {
      if (!this.newComment || !this.newComment.length) return

      this.posting = true
      this.addComment({
        board: this.board,
        comment: this.newComment
      }).then(() => {
        this.newComment = ''
        this.posting = false
      })
    },

    ...mapActions([
      'getComments',
      'addComment'
    ])
  },
  mounted () {
    this.getComments(this.board).then(({ data }) => {
      console.log(`got ${data.length} comment(s)`)
      this.comments = data
    })

    // listen for new comments and changes
    console.log('create socket')
    this.socket = io(process.env.VUE_APP_API_URL, { path: '/comments' })

    this.socket.on('new comment', (doc) => {
      if (doc.board === this.board) {
        this.comments.push(doc)
      }
    })
    this.socket.on('edit comment', (doc) => {
      console.log('comment edited')
      // handleEditComment(doc)
    })
  },
  destroyed () {
    console.log('destroying socket..')
    this.socket.destroy()
  }
}
</script>

<style>
.chat-scroll {
  height: 50%;
  min-height: calc(100vh - 257px);
}

.msg {
  border-radius: 3px;
  border-color: rgba(0, 180, 100, .4);
}

.pre-line { white-space: pre-line; }
</style>
