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
            .flex.items-center.justify-start.p2
              img(:src="img" width="64" height="64")
              p.font-exp.h2.m0.px3.flex-auto.truncate {{ name }}
              span(@click="toggleChat").pointer.h1 &times;

          .overflow-auto.touch.flex-auto(ref="chat")
            view-nav.bg-green.white.sticky.top-0.z1(:items="[{lbl: 'Comments', value:'chat'}, {lbl: 'Activity', value:'logs'}]", @change="view = $event", :thick="false")

            div(v-if="view === 'chat'")
              ul.list-reset.m0
                li(v-if="loading || moreCommentsToLoad").p3.white.h6.opacity-50 Loading...
                li(v-else).p3.white.h6.opacity-50 Start of chat
                //- li(v-else).p3.white.h6 nothing here yet
                li(v-for="comment in comments", :key="comment.id", ref="comment").px2.pb2
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

            div(v-else)
              .fade-enter-active(v-if="hasResults", :class="{'opacity-50': loading}")
                .mx-auto.bg-green.white
                  nav(v-if="prevPossible || nextPossible").list-reset.border-bottom.flex.h5.white
                    li(v-if="prevPossible" @click="filters.page--").col-6.flex-grow.pointer.px2.py3.center
                      span &larr; Previous
                    li(v-if="nextPossible" @click="filters.page++").col-6.flex-grow.pointer.px2.py3.center
                      span Next &rarr;

                  ul.m0.p0.list-reset
                    //- log item
                    li(v-for="log in activity" :key="log.id || log.transactionHash").border-bottom
                      activity-item(:item="log", :no-img="true")

                  nav(v-if="prevPossible || nextPossible").list-reset.flex.h5.white
                    li(v-if="prevPossible" @click="filters.page--").col-6.flex-grow.pointer.px2.py4.center
                      span &larr; Previous
                    li(v-if="nextPossible" @click="filters.page++").col-6.flex-grow.pointer.px2.py4.center
                      span Next &rarr;

                  .center.h5.font-mono.border-top.border-green.h-bttm-bar.px2.py3(v-else)
                    span.opacity-50 End of results

              div(v-else)
                .center.h5.font-mono.px2.py4
                  span.opacity-50 {{ loading ? 'Loading...' : 'No results' }}

          .sticky.left-0.right-0.bottom-0.bg-green(v-if="view === 'chat'")
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
import axios from 'axios'
import moment from 'moment'
import ChatIcon from '@/components/Icons/ChatIcon'
import ViewNav from '@/components/ViewNav'
import ActivityItem from '@/components/ActivityItem'
import { apiBase } from '@/store/actions'
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
      posting: false,
      view: 'chat', // || 'logs'
      loading: false,
      doneFirstLoad: false,
      moreCommentsToLoad: true,
      scrollAfter: true,
      commentCount: 0,
      filters: {
        page: 1
      },
      logs: {}
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
    user () {
      return this.$store.state.account
    },
    activity () {
      if (!this.logs.results) return []
      return this.logs.results
    },
    prevPossible () {
      return this.logs.prevPage
    },
    nextPossible () {
      return this.logs.nextPage
    },
    maxPage () {
      if (!this.logs.allResults) return 0
      return Math.ceil(this.logs.allResults / 24)
    },
    hasResults () {
      return this.logs.results && !!this.logs.results.length
    },
    commentsBefore () {
      return this.comments.length ? this.comments[0].created
        : new Date().toISOString()
    }
  },
  methods: {
    toggleChat () {
      this.showChat = !this.showChat
      const rtName = this.showChat ? 'Clover/Comments' : 'Clover'
      this.board && this.$router.replace({name: rtName, params: {board: this.board}})
      this.$nextTick(() => {
        this.showChat && this.scrollDown()
        if (this.moreCommentsToLoad && this.showChat) {
          this.$refs.chat.addEventListener('scroll', this.scrollListen)
        }
      })
      if (!this.showChat) this.view = 'chat'
    },
    scrollListen ({ target }) {
      if (this.view !== 'chat') return
      if (target.scrollTop < 10 && !this.loading) {
        this.loadComments().then(() => {
          if (!this.moreCommentsToLoad) {
            this.$refs.chat &&
              this.$refs.chat.removeEventListener('scroll', this.scrollListen)
          }
        })
      }
    },
    commentDate (d) {
      return moment(d).fromNow()
    },
    postComment () {
      if (!this.newComment || !this.newComment.length) return

      this.posting = true
      this.scrollAter = true
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
    loadComments () {
      if (!this.moreCommentsToLoad) return Promise.resolve()
      const params = { before: this.commentsBefore }
      return this.getComments({ board: this.board, params }).then(({ data }) => {
        this.commentCount = data.allResults
        this.moreCommentsToLoad = data.allResults > data.pageResults
        const { chat } = this.$refs
        let prevBottom = 0
        if (chat) {
          const prevHeight = chat.scrollHeight
          prevBottom = prevHeight - (chat.clientHeight + chat.scrollTop)
        }

        data.results.forEach((doc) => {
          const e = this.comments.findIndex(d => d.id === doc.id) > -1
          if (!e) {
            this.comments.unshift(doc)
          }
        })

        if (chat) {
          this.$nextTick(() => {
            let newHeight = chat.scrollHeight
            let newTop = newHeight - prevBottom - chat.clientHeight
            chat.scrollTop = newTop
          })
        }
      }).catch(() => {
        this.moreCommentsToLoad = false
      })
    },
    loadActivity () {
      axios.get(`${apiBase}/clovers/${this.board}/activity`, {
        params: { page: this.filters.page }
      }).then(({ data }) => {
        this.logs = data
        this.scrollUp()
      })
    },
    scrollUp () {
      const { chat } = this.$refs
      chat.scrollTop = 0
    },
    scrollDown (behavior = 'auto', block = 'end') {
      if (!this.showChat) return

      const { chat } = this.$refs
      if (behavior === 'auto') {
        this.$nextTick(() => {
          chat.scrollTop = chat.scrollHeight - chat.clientHeight
        })
      } else {
        let newOne = this.$refs.comment[this.comments.length - 1]
        newOne.scrollIntoView({ behavior, block })
      }
    },

    ...mapActions([
      'getComments',
      'addComment',
      'flagOrDeleteComment',
      'signIn'
    ])
  },
  watch: {
    view (newVal) {
      if (newVal === 'chat') {
        this.scrollDown()
      } else {
        this.loadActivity()
      }
    },
    filters: {
      deep: true,
      handler ({ filter }) {
        this.loadActivity()
      }
    }
  },
  mounted () {
    this.loadComments().then(() => {
      this.doneFirstLoad = true
    })

    // listen for new comments and changes
    this.socket = io(process.env.VUE_APP_API_URL, { path: '/comments' })

    this.socket.on('new comment', (doc) => {
      if (doc.board === this.board) {
        const scrollAfter = atBottom(this.$refs.chat)
        this.comments.push(doc)
        this.commentCount++
        if (scrollAfter || this.scrollAfter) {
          this.$nextTick(() => {
            this.scrollDown('smooth')
            this.scrollAfter = false
          })
        }
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
  components: { ChatIcon, ViewNav, ActivityItem }
}

function atBottom (el) {
  if (!el) return
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 5
}
</script>

<style>
@import '../style/settings.css';

.chat-scroll {
  max-height: 100%;
  min-height: 100%;
  /*padding-bottom: 67px;*/
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
