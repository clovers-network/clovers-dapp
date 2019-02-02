<template lang="pug">
  article.green.relative(v-if="user")
    header.sticky.top-header-h.left-0.bg-white.z1.border-bottom.md-py1
      h1.block.m-auto.pt2.font-mono.h-header.flex
        span.block.m-auto {{username}}
        span.block.m-auto {{prettyBigNumber(user.balance)}} ♣&#xFE0E;
    section
      clover-list-cards(v-if="clovers.length", :clovers="clovers")
</template>

<script>
import { mapState } from 'vuex'
import CloverListCards from '@/components/CloverList--Cards'
import { getUsername, prettyBigNumber } from '@/utils'
export default {
  name: 'User',
  props: ['addr'],
  components: { CloverListCards },
  methods: {
    prettyBigNumber (foo) {
      return prettyBigNumber(foo)
    }
  },
  computed: {
    ...mapState(['allUsers', 'allClovers']),
    user () {
      if (!this.allUsers.length || !this.addr) return false
      return this.allUsers.filter(usr => usr.address.toLowerCase() === this.addr.toLowerCase())[0]
    },
    clovers () {
      if (!this.allClovers.length || !this.user) return []
      const items = this.user.clovers.map(clvr => this.allClovers.filter(itm => itm && itm.board === clvr)[0])
      return items.sort((a, b) => a.modified > b.modified ? -1 : a.modified < b.modified ? 1 : 0)
    },
    username () {
      const name = getUsername(this.addr)
      return name || this.addr
    }
  }
}
</script>

<style>
</style>
