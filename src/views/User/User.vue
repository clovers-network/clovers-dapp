<template lang="pug">
  .green.relative.mb4.pb4(v-if="user")
    //- profile
    header
      user-card(:user="user")
    //- main
    .relative.sm-pt1
      header.mx2.px1.mb3.pb2.sm-pb0.sm-mb0.sm-px2.lg-absolute.md-mx0.md-px0.md-pt1.md-pb1
        nav.h2.lg-h3.font-exp.lh2.h-select.flex.items-end
          router-link.inline-block.mr3(:to="{name: 'User', params: {addr: user.address}}", :class="{'opacity-25': $route.name !== 'User'}") Clovers
          router-link.inline-block(:to="{name: 'User/Albums', params: {addr: user.address}}", :class="{'opacity-25': $route.name !== 'User/Albums'}") Albums
      router-view(:user="user")
  not-found(v-else)
</template>

<script>
import store from '@/store'
import UserCard from '@/components/UserCard'
import NotFound from '@/views/404'

export default {
  name: 'User',
  props: {
    addr: String
  },
  computed: {
    name () {
      return this.$store.getters.userName(this.user)
    },
    user () {
      if (this.$route.name === 'Account/Clovers') return this.$store.getters.user
      return this.$store.state.otherUser
    }
  },
  beforeRouteEnter (to, from, next) {
    const { addr } = to.params
    store.dispatch('getUser', addr).finally(next)
  },
  beforeRouteUpdate (to, from, next) {
    const { addr } = to.params
    store.dispatch('getUser', addr).finally(next)
  },
  components: { UserCard, NotFound }
}
</script>
