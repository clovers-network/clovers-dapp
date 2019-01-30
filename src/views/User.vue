<template lang="pug">
  article.green.relative(v-if="user")
    header.sticky.top-header-h.left-0.bg-white.z1.border-bottom.md-py2
      h1.block.m-auto.px2.font-mono.h-header.flex
        span.block.m-auto {{user.name}}
    section
      clover-list-cards(v-if="clovers.length", :clovers="clovers")
</template>

<script>
import { mapState } from 'vuex'
import CloverListCards from '@/components/CloverList--Cards'
import moment from 'moment'
export default {
  name: 'User',
  props: ['addr'],
  components: { CloverListCards },
  computed: {
    ...mapState(['allUsers', 'allClovers']),
    user () {
      if (!this.allUsers.length || !this.addr) return false
      return this.allUsers.filter(usr => usr.address.toLowerCase() === this.addr.toLowerCase())[0]
    },
    clovers () {
      if (!this.allClovers.length || !this.user) return []
      return this.user.clovers.map(clvr => this.allClovers.filter(itm => itm && itm.board === clvr)[0])
    }
  }
}
</script>

<style>
</style>
