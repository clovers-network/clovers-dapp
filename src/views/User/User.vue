<template lang="pug">
  .green.relative.mb4.pb4(v-if="user")
    //- profile
    header
      user-card(:user="user")
    //- main
    router-view(:user="user")
</template>

<script>
import store from '@/store'
import UserCard from '@/components/UserCard'
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
    store.dispatch('getUser', addr).then(next)
  },
  beforeRouteUpdate (to, from, next) {
    const { addr } = to.params
    store.dispatch('getUser', addr).then(next)
  },
  components: { UserCard }
}
</script>
