<template lang="pug">
  article.mt2.md-mt4.mx3.md-mx0
    header
      page-title
        h1 Users
        p(slot="info") Some more info about our users
    section.mt4
      p list of users here {{ users && users.allResults }}

      div(v-if="users")
        ul.list-reset.flex.flex-wrap
          li.col-6(v-for="user in users.results" :key="user.address")
            user-card(:user="user")
</template>

<script>
import axios from 'axios'
import PageTitle from '@/components/PageTitle'
import UserCard from '@/components/UserCard'

export default {
  name: 'Users',
  data () {
    return {
      searchResults: null
    }
  },
  computed: {
    users () {
      return this.$store.state.pagedUsers
    }
  },
  method: {
    searchUsers ({ getters }, { s }) {
      if (!s) return []
      return axios.get(getters.baseURL('/users'), {
        params: { s }
      })
    }
  },
  mounted () {
    this.$store.dispatch('getUsers', { page: 1 })
  },
  components: { PageTitle, UserCard }
}
</script>
