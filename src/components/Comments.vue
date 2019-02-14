<template lang="pug">
  div
    //- toggle button
    .pointer(@click="toggleChat")
      chat-icon.block(:invert="commentCount > 0" :count="commentCount")

    //- comments view
    transition(name="fade")
      section(v-if="showChat", @click.stop.prevent, name="comments").fixed-center-max-width.top-0.bottom-0.bg-green.white.z4.overflow-hidden
        .flex.flex-column.chat-scroll
          .relative.white.p1.border-bottom
            .flex.items-center.justify-start.p2(style="height:88px;")
              img(:src="img")
              p.font-exp.h2.m0.px3.flex-auto.truncate {{ name }}
              span(@click="toggleChat").pointer.h1 &times;
          div(v-chat-scroll="{ smooth: true }", ref="chat").overflow-auto.touch.flex-auto
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
                      router-link(:to="'/users/' + comment.userAddress")
                        span(v-text="comment.userName").font-mono.pr2.nowrap
                      span(v-text="comment.comment").bold.pr2.break-word
                      span(v-if="owner && !commentOwner(comment)", @click="flagOrDeleteComment(comment.id)").hvr.pr2.h6.red.pointer Flag
                      span(v-if="commentOwner(comment)", @click="flagOrDeleteComment(comment.id)").hvr.pr2.h6.red.pointer Delete
                    span.block.sm-inline
                    span(v-text="commentDate(comment.created)").hvr.h6.lighten-4.pr2
          .fixed.left-0.right-0.bottom-0.bg-green
            div(v-if="signedIn").border-top
              form(@submit.prevent="postComment")
                input(v-model="newComment", type="text", placeholder="Comment...").p3.col-12.h4.border-none.bg-green.font-exp.white
                //- .right-align.mt2.hide
                //-   button(type="submit", :disabled="posting", v-text="buttonTxt").px3.py2.bg-green.white.font-exp
            div(v-else).border-top
              p.font-exp.p3.mb0
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
      showChat: this.$route.name === 'Clover/Comments',
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
    toggleChat () {
      this.showChat = !this.showChat
      const rtName = this.showChat ? 'Clover/Comments' : 'Clover'
      return this.board && this.$router.replace({name: rtName, params: {board: this.board}})
    },
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
    this.socket.destroy()
  },
  components: { ChatIcon }
}
</script>

<style>
@import '../style/settings.css';

.chat-scroll {
  max-height: 100%;
  padding-bottom: 67px;
}

@media (--breakpoint-sm) {
  .msg {
    & .hvr {
      opacity: 0;
      transition: opacity .1s;
    }

    &:hover .hvr { opacity: 1; }
  }
}

.touch {
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
}

.break-word {
  overflow-wrap: break-word;
  hyphens: auto;
}

.lighten-4 { color: var(--lighten-4); }
</style>
