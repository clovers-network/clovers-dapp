<template lang="pug">
  .my3.sm-my4.sm-mx3.md-mx0.bg-lightest-green.sm-bg-none(v-if="user")
    .relative.sm-border.rounded.py2.sm-py1.px3.max-width-2.flex.items-center.justify-between.sm-justify-start
      //- info
      .pt2.pb3
        h2.h3.md-h2.mb1.font-exp
          router-link(:to="{name: 'User', params: {addr: user.address}}") {{ userName(user) }}
        small.block.h7
          span(v-if="user.created") Member since block # {{ user.created.toLocaleString() }}
          span(v-else-if="user.modified") Last active, block # {{ user.modified.toLocaleString() }}
        .mt3.flex.items-center.h5.lh1
          .flex.items-center.mr3(v-if="user.clovers && user.clovers.length")
            img.block.mr1(src="@/assets/icons/clover-icon-1.svg")
            span.block {{ user.clovers.length }}
          .flex.items-center(v-if="Number(user.balance)")
            coin-icon.mr1(:width="16")
            span.block {{ prettyUserBalance }}
      //- avatar
      figure.py2.sm-pr1.sm-mr3.sm-flex-first
        img(:src="userImage(user, 87)" width="87" height="87", alt="User Avatar")
      //- edit btn
      .absolute.top-0.right-0(v-if="editable")
        a.p2.block.h4.pointer(@click="$emit('edit')" style="transform:scale(-1, 1)") ✎
</template>

<script>
import { mapGetters } from 'vuex'
import { prettyBigNumber } from '@/utils'
import CoinIcon from '@/components/Icons/CoinIcon'
export default {
  name: 'UserCard',
  props: ['user', 'editable'],
  computed: {
    ...mapGetters(['userName', 'userImage']),
    prettyUserBalance () {
      return prettyBigNumber(this.user.balance || '0')
    }
  },
  components: { CoinIcon }
}
</script>
