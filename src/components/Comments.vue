<template lang="pug">
  div
    .pointer(@click="showChat = true")
      chat-icon(:count="commentCount")

    transition(name="fade")
      section(v-if="showChat", name="comments").fixed-center-max-width.top-0.bottom-0.bg-green.white.z4.overflow-hidden
        .relative.white.p1.sticky.top-0.border-bottom
          .flex.items-center.justify-start.p2
            img(:src="img")
            p.font-exp.h2.m0.pl3.flex-auto.truncate {{ name }}
            span(@click="showChat = false").pointer.h1 &times;
        div(v-chat-scroll="{ smooth: true }").chat-scroll.overflow-auto
          ul.list-reset.m0
            li(v-if="comments.length").p3.white.h6 start of chat
            li(v-else).p3.white.h6 nothing here yet
            li(v-for="comment in comments" :key="comment.id").px2.pb2
              .px2.msg
                .mb1
                  template(v-if="comment.deleted")
                    span(v-text="comment.userName").font-mono.pr2.nowrap
                    span.pr2.light-gray.h5 [Deleted]
                  template(v-else-if="comment.flagged")
                    span.pr2.light-gray.h5 [Flagged]
                  template(v-else)
                    span(v-text="comment.userName").font-mono.pr2.nowrap
                    span(v-text="comment.comment").bold.pr2
                    span(v-if="owner", @click="flagOrDeleteComment(comment.id)").hvr.pr2.h5.red.pointer Flag
                    span(v-if="commentOwner(comment)", @click="flagOrDeleteComment(comment.id)").hvr.pr2.h5.red.pointer Delete
                  span(v-text="commentDate(comment.created)").hvr.h6.lighten-4
        .sticky.bottom-0.bg-green
          div(v-if="signedIn").border-top
            form(@submit.prevent="postComment")
              input(v-model="newComment", type="text", placeholder="Comment...").p3.col-12.h4.border-none.bg-green.font-exp

              .right-align.mt2.hide
                button(type="submit", :disabled="posting", v-text="buttonTxt").px3.py2.bg-green.white.font-exp
          div(v-else).border-top
            p.font-exp.p3
              span(@click="signIn").pointer.underline Sign in
              span  to comment
</template>

<script>
import io from 'socket.io-client'
import moment from 'moment'
import ChatIcon from '@/components/Icons/ChatIcon'
import { mapActions } from 'vuex'
import { cloverImage } from '@/utils'

export default {
  name: 'Comments',
  props: {
    board: { type: String, required: true },
    name: { type: String, required: true },
    owner: Boolean
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
    },
    img () {
      return cloverImage({ board: this.board }, 64)
    },
    commentCount () {
      return this.comments.length
    },
    user () {
      return this.$store.state.account
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
    commentOwner ({ userAddress }) {
      return this.user === userAddress
    },

    ...mapActions([
      'getComments',
      'addComment',
      'flagOrDeleteComment',
      'signIn'
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
      if (doc.board === this.board) {
        let idx = this.comments.findIndex(c => c.id === doc.id)
        if (idx > -1) {
          this.comments.splice(idx, 1, doc)
        }
      }
    })
  },
  destroyed () {
    console.log('destroying socket..')
    this.socket.destroy()
  },
  components: { ChatIcon }
}
</script>

<style>
.chat-scroll {
  height: 50%;
  min-height: calc(100vh - 168px);
}

.msg {
  .hvr {
    opacity: 0;
    transition: opacity .1s;
  }

  &:hover .hvr { opacity: 1; }
}

.pre-line { white-space: pre-line; }
</style>
