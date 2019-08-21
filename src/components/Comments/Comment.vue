<template lang="pug">
  .flex.flex-wrap.col-12(:class="{ 'justify-end right-align': commentOwner(comment) }")
    .comment__msg.rounded.bg-lightest-green.pt2.px2.pb1
      .mr1
        template(v-if="comment.deleted")
          span(v-text="comment.userName").pr2.nowrap.h5
          span.pr2.light-green.h5 [Deleted]
        template(v-else-if="comment.flagged")
          span.pr2.light-green.h5 [Flagged]
        template(v-else)
          //- username
          router-link(:to="'/users/' + comment.userAddress")
            span(v-text="userName(comment.userName)").mr2.nowrap.h5
          //- comment
          span(v-text="comment.comment").break-word.font-exp.h5
        //- span.block.sm-inline
      .flex.font-mono.h7.nowrap.light-green
        .inline-block.py1.mr1.sm-mr2(v-text="commentDate(comment.created)")
        //- flag / delete
        button.p1.hvr.pointer(v-if="owner && !commentOwner(comment)", @click="flagOrDeleteComment(comment.id)") Flag
        button.p1.hvr.pointer(v-if="commentOwner(comment) && !comment.deleted", @click="flagOrDeleteComment(comment.id)") Delete
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Comment',
  props: ['comment', 'owner'],
  data () {
    return {
      showActions: false
    }
  },
  computed: {
    ...mapGetters(['userName'])
  },
  methods: {
    ...mapActions(['flagOrDeleteComment']),
    commentOwner ({ userAddress }) {
      return this.$store.state.account === userAddress
    },
    commentDate (d) {
      return moment(d).fromNow()
    }
  }
}
</script>

<style>
.comment__msg { max-width: 93%; }

@media (--breakpoint-sm) {
  .comment__msg { max-width:75%; }
}

@media (hover:hover) {
  .hvr { visibility: hidden; }
  .comment__msg:hover .hvr { visibility: visible }
}
</style>
