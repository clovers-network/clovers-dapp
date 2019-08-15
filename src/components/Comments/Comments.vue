<template lang="pug">
  section(name="social", ref="chat")
    header.pt2.mx2
      view-nav.font-ext.h3.rounded-2(:items="[{lbl: 'Comments', value:'chat'}, {lbl: 'Albums', value: 'albums'}, {lbl: 'Activity', value:'logs'}]", @change="view = $event", @click.native="maybeScroll", :thick="false")

    //- tab: comments
    .px2.mb3.relative(v-if="view === 'chat'")
      h6.my2.h6.opacity-50.center
        span.mt3.block(v-if="noComments") No comments yet
        span(v-else-if="loading || moreCommentsToLoad") Loading...
        span(v-else) Start of chat
      ul.list-reset.m0
        //- li(v-else).p3.white.h6 nothing here yet
        li(v-for="comment in comments", :key="comment.id", ref="comment", style="margin:5px 0")
          comment(:comment="comment", :owner="owner")
      //- input: comment / sign in
      .sticky.mt3.z2.left-0.right-0.bottom-0.mt2.chat-hover
        .rounded-2.pb2(v-if="signedIn")
          form(@submit.prevent="postComment")
            input.p3.col-12.h4.border-dashed.bg-white.font-exp.rounded-2.line-height-2.focus-border(@focus="focusActivity()" v-model="newComment", ref="input", type="text", placeholder="Comment...")
            //- .right-align.mt2.hide
            //-   button(type="submit", :disabled="posting", v-text="buttonTxt").px3.py2.bg-green.white.font-exp
        .bg-white.rounded.pb2(v-else)
          button.block.col-12.font-exp.p3.mb0.border.rounded-2.line-height-2.pointer.hover-bg-l-green(@click="signIn")
            | <span class="underline"> Sign in</span> to comment...

    //- tab: albums
    .px1(v-else-if="view === 'albums'")
      h6.my2.p3.h6.opacity-50.center(v-if="!albums.length") No Albums yet
      ul.mt3.mb0.list-reset.flex.flex-wrap
        li.col-12.sm-col-6.px1(v-for="(album, i) in albums")
          router-link.block.px2.py3.my1.rounded.clover-item-border.flex.justify-center(:to="{name: 'Album', params: {id: i}}")
            h4.font-exp {{album.name}}
            //- h6.h6 [username]
      footer.sticky.bottom-0.left-0.mt1.px1.pb2
        .rounded(style="background:rgba(255,255,255,.9)")
          //- (btn: add to album)
          button.block.col-12.font-exp.p3.border-dashed.hover-border-solid.bg-lightest-green.rounded.lh1.pointer(v-if="signedIn", @click="$router.push({hash: 'connect'})") Add to Album
          //- (sign in...)
          button.block.col-12.font-exp.p3.bg-white.border.rounded.lh1.hover-bg-l-green.pointer(v-else, @click="signIn")
            | <span class="underline">Sign in</span> to add...
      //- modal: add to album
      transition(name="fade")
        add-to-album-modal(v-show="$route.hash === '#connect'", @close="$router.push({hash: ''})")
    
    //- tab: activity
    .px2(v-else-if="view === 'logs'")
      .fade-enter-active(v-if="hasResults", :class="{'opacity-50': loading}")
        .mx-auto
          .flex.justify-end.items-center
            router-link.block.h5.pt2.mr3.light-green.hover-underline(to="/activity") view all logs
            .pt3.pb2.center(style="min-width:140px")
              .center.h4.border.rounded.h-100.px2.py1.flex.items-center.justify-between.hover-bg-l-green
                span.pr2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !prevPossible }", @click="back")
                  img(src="@/assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
                span {{ filters.page }} of {{ maxPage }}
                span.pl2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !nextPossible }", @click="forward")
                  img(src="@/assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

          ul.m0.p0.list-reset.mt2
            //- log item
            li.border.border-dashed.rounded.mb2(v-for="log in activity" :key="log.id || log.transactionHash")
              activity-item(:item="log", :no-img="true")

          nav.list-reset.flex.h5.green.items-center.justify-center.my3.pb2(v-if='(prevPossible || nextPossible) && hasResults')
            li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !prevPossible }", @click="back")
              img(src="@/assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
              span.pl1 Previous
            li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !nextPossible }", @click="forward")
              span.pr1 Next
              img(src="@/assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

          .center.h5.font-mono.h-bttm-bar.px2.py3(v-else)
            span.opacity-50 End of results

      div(v-else)
        .center.h5.font-mono.px2.py4
          span.opacity-50 {{ loading ? 'Loading...' : 'No results' }}
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'
import Comment from './Comment'
import ChatIcon from '@/components/Icons/ChatIcon'
import ViewNav from '@/components/ViewNav'
import ActivityItem from '@/components/ActivityItem'
import AddToAlbumModal from '@/components/Modals/AddToAlbumModal'
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
      view: 'chat', // || 'logs'
      socket: null,
      showChat: true,
      comments: [],
      newComment: '',
      posting: false,
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
    activity () {
      if (!this.logs.results) return []
      return this.logs.results
    },
    albums () {
      // demo
      return this.$store.state.albums
    },
    prevPossible () {
      return this.logs.prevPage
    },
    nextPossible () {
      return this.logs.nextPage
    },
    maxPage () {
      if (!this.logs.allResults) return 0
      return Math.ceil(this.logs.allResults / 12)
    },
    hasResults () {
      return this.logs.results && !!this.logs.results.length
    },
    commentsBefore () {
      return this.comments.length ? this.comments[0].created
        : new Date().toISOString()
    },
    noComments () {
      return !this.moreCommentsToLoad && !this.comments.length
    }
  },
  methods: {
    addListener () {
      if (!this.moreCommentsToLoad) return
      this.$refs.chat &&
        this.$refs.chat.addEventListener('scroll', this.scrollListen)
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
    loadComments () {
      if (!this.moreCommentsToLoad) return Promise.resolve()
      const params = { before: this.commentsBefore }
      return this.getComments({ board: this.board, params }).then(({ data }) => {
        this.commentCount = data.allResults
        this.moreCommentsToLoad = data.pageResults !== 0
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
        // if (this.$refs.input) this.$refs.input.focus()
      }).catch(() => {
        this.moreCommentsToLoad = false
      })
    },
    loadActivity () {
      return axios.get(`${apiBase}/clovers/${this.board}/activity`, {
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
    scrollDown (behavior = 'auto', block = 'start') {
      const { chat } = this.$refs
      if (behavior === 'auto') {
        this.$nextTick(() => {
          chat.scrollTop = chat.scrollHeight - chat.clientHeight
        })
      } else {
        // if (this.noComments) {
        //   return this.focusActivity()
        // }
        let newOne = this.$refs.comment[this.comments.length - 1]
        newOne.scrollIntoView({ behavior, block })
      }
    },
    forward () {
      if (!this.nextPossible) return
      this.filters.page++
    },
    back () {
      if (!this.prevPossible) return
      this.filters.page--
    },
    focusActivity () {
      this.$refs.chat.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    },
    maybeScroll () {
      this.$nextTick(() => {
        if (this.view === 'chat') {
          this.focusActivity()
        }
      })
    },

    ...mapActions([
      'getComments',
      'addComment',
      'signIn'
    ])
  },
  watch: {
    view (newVal) {
      if (newVal === 'chat') {
        this.scrollDown()
        this.addListener()
        setTimeout(this.focusActivity, 30)
      } else if (newVal === 'logs') {
        this.loadActivity().then(this.focusActivity)
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
      this.addListener()
      if (!this.doneFirstLoad) {
        this.doneFirstLoad = true
        this.loadComments()
      }
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
  components: { Comment, ChatIcon, ViewNav, ActivityItem, AddToAlbumModal }
}

function atBottom (el) {
  if (!el) return
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 5
}
</script>

<style>
@import '../../style/settings.css';

.touch {
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
}

.break-word {
  overflow-wrap: break-word;
  hyphens: auto;
}

.mobile-delete{
  display:inline-block;
  position: relative;
}
</style>
