<template lang="pug">
  div
    .material-icons.pointer(@click="showChat = true") chat_bubble_outline

    transition(name="fade")
      section(v-if="showChat", name="comments").fixed.left-0.top-0.right-0.bottom-0.bg-white.black.z4.overflow-auto
        .relative.bg-black.white.p1.sticky.top-0
          p.center.font-exp.h2.m0 Comments
          span(@click="showChat = false").absolute.top-0.right-0.mr2.mt1.pointer.h2 &times;
        .overflow-auto
          ul.list-reset.m0.border-top
            li(v-for="comment in comments" :key="comment.id").border-top.p2
              .flex.mb1
                p(v-text="comment.userName").col-6.font-exp.m0
                p(v-text="commentDate(comment.created)").col-6.h6.right-align.m0
              p(v-text="comment.comment").m0
        .p2.black.sticky.bottom-0.bg-white.border-top
          div(v-if="signedIn")
            p.font-exp Add a comment 💬
            form(@submit.prevent="postComment")
              textarea(v-model="newComment", rows="4", placeholder="Your comment").p2.col-12.h4
              .right-align.mt2.border-green
                button(type="submit").px3.py2.bg-black.white.font-exp Post
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
      newComment: ''
    }
  },
  computed: {
    signedIn () {
      return !!this.$store.getters.authHeader
    }
  },
  methods: {
    commentDate (d) {
      return moment(d).fromNow()
    },
    postComment () {
      if (!this.newComment || !this.newComment.length) return

      this.addComment({
        board: this.board,
        comment: this.newComment
      }).then(() => {
        this.newComment = ''
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
