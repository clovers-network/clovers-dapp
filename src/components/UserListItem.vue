<template lang="pug">
  .flex.items-end.mb3.lg-pb2
    .mr2.relative
      .absolute.right-0.bottom-0.font-mono.h1.light-green {{ index }}

    figure.pr2
      img.block(:src="userImage(user, 80)" width="50" height="50", alt="User Avatar")
    .pointer(is="router-link", tag="div", :to="{name: 'User', params: {addr: user.address}}")
      .h2.font-exp {{ userName(user) }}
      .light-green.font-mono {{ user.address }}
    .separate.flex-auto.mx2
    .flex.items-center(v-if="filter === 'clovers'")
      img.block.mr1(src="@/assets/icons/clover-icon-1.svg")
      span.block.h2 {{ cloverCount }}
    .flex(v-else-if="filter === 'albums'")
      span.block.h2 {{ albumCount }}
    .flex.items-center(v-else)
      coin-icon.mr1(:width="16")
      span.block.h2 {{ prettyUserBalance }}
</template>

<script>
import { mapGetters } from 'vuex'
import { concatPrice, prettyBigNumber } from '@/utils'
import CoinIcon from '@/components/Icons/CoinIcon'

export default {
  name: 'UserListItem',
  props: {
    user: {
      type: Object,
      required: true
    },
    index: Number,
    filter: [String, null]
  },
  computed: {
    prettyUserBalance () {
      return concatPrice(prettyBigNumber(this.user.balance || '0'))
    },
    cloverCount () {
      return parseInt(this.user.cloverCount).toLocaleString()
    },
    albumCount () {
      return parseInt(this.user.albumCount).toLocaleString()
    },

    ...mapGetters(['userName', 'userImage'])
  },
  components: { CoinIcon }
}
</script>

<style>
  .separate {
    border-bottom: 1px dotted;
    margin-bottom: 5px;
  }
</style>
