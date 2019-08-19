<template lang="pug">
  .my3.sm-my4.sm-mx3.md-mx0.bg-lightest-green.sm-bg-none.sm-col-9(v-if="user")
    //- border
    .block.sm-inline-block.sm-min-width-2.relative.sm-border.rounded(:class="{'sm-border-dashed pointer hover-border-solid hover-shadow': signIn}", @click="onCardClick")
      .py2.sm-py1.px3.flex.justify-between.sm-justify-start
        //- info
        .pt2.pb3.flex.flex-column
          h2.h3.mb1.font-exp.lh1.sm-pt1
            router-link(v-if="user.address", :to="{name: 'User', params: {addr: user.address}}") {{ userName(user) }}
            span(v-else-if="signIn") Sign In...
          small.block.h7.flex-auto
            span(v-if="user.created") Member since block # {{ user.created.toLocaleString() }}
            span(v-else-if="user.modified") Last active, block # {{ user.modified.toLocaleString() }}
          //- stats
          .mt3.pt1.flex.items-center.h5.lh1
            .flex.items-center.mr3
              img.block.mr1(src="@/assets/icons/clover-icon-1.svg")
              span.block {{ cloverCount }}
            .flex.items-center
              coin-icon.mr1(:width="16")
              span.block {{ prettyUserBalance }}
        //- avatar
        figure.py2.my1.sm-pr1.sm-mr3.sm-flex-first(style="flex-shrink:0")
          img.block(:src="userImage(user, 128)" width="87" height="87", alt="User Avatar")
        //- edit btn
        .absolute.top-0.right-0(v-if="editable && user.address")
          a.p2.block.h4.pointer(@click="$emit('edit')" style="transform:scale(-1, 1)") ✎
</template>

<script>
import { mapGetters } from 'vuex'
import { concatPrice, prettyBigNumber } from '@/utils'
import CoinIcon from '@/components/Icons/CoinIcon'
export default {
  name: 'UserCard',
  props: ['user', 'editable'],
  computed: {
    prettyUserBalance () {
      return concatPrice(prettyBigNumber(this.user.balance || '0'))
    },
    signIn () {
      return (!this.user || !this.user.address) && this.editable
    },
    cloverCount () {
      let c = this.$store.state.pagedClovers.allResults || 0
      return c.toLocaleString()
    },

    ...mapGetters(['userName', 'userImage'])
  },
  methods: {
    onCardClick () {
      return this.signIn && this.$store.dispatch('signIn')
    }
  },
  components: { CoinIcon }
}
</script>
