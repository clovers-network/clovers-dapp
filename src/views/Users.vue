<template lang="pug">
  article.mt2.md-mt4.mx3.md-mx0
    header
      page-title
        h1 Users
        p(slot="info") The leaderboards! List users with the highest Clover Coin balance, most Clovers in their Collections, or the most Albums.

    section.mt4(name="Filters")
      view-nav.font-ext.h3.rounded-2(:items="tabItems", @change="filters.filter = $event", :bg="true", :initial="initial")
    //- section.mt2(name="Search users")
      input.block.col-12.input.rounded-2.h2.p3.border(ref="input", name="search", type="search", v-model="query", placeholder='Search', spellcheck="false", autocomplete="off")
    section.my4.pb4(name="Leaderboard")
      div(v-if="users", :class="{ 'opacity-30': loading }")
        ul.list-reset
          li(v-for="(user, i) in users.results" :key="user.address")
            user-list-item(:user="user", :index="users.perPage * (users.page - 1) + i + 1", :filter="filters.filter")
</template>

<script>
import axios from 'axios'
import PageTitle from '@/components/PageTitle'
import ViewNav from '@/components/ViewNav'
import UserListItem from '@/components/UserListItem'
import { cleanObj } from '@/utils'

export default {
  name: 'Users',
  data () {
    return {
      query: '',
      initial: 'clovers',
      loading: true,
      filters: {
        page: 1,
        filter: 'clovers'
      },
      searchResults: null,
      tabItems: [
        { lbl: 'Clovers', value: 'clovers' },
        { lbl: 'Balance', value: 'balance' },
        { lbl: 'Albums', value: 'albums' }
      ]
    }
  },
  computed: {
    users () {
      return this.$store.state.pagedUsers
    }
  },
  methods: {
    setFilters () {
      const { query } = this.$route
      this.filters.filter = query.filter || 'clovers'
      this.filters.page = query.page || 1
    },
    getUsers () {
      this.loading = true
      this.$store.dispatch('getUsers', this.filters).then(() => {
        this.loading = false
      })
    },
    searchUsers ({ getters }, { s }) {
      if (!s) return []
      axios.get(getters.baseURL('/users'), {
        params: { s }
      }).then(({ data }) => {
        this.searchResults = data
      })
    }
  },
  watch: {
    filters: {
      deep: true,
      handler ({ filter }) {
        let q = { ...this.filters }
        cleanObj(q)
        const cf = this.$route.query.filter
        if (cf !== filter) {
          delete q.page
        }
        this.$router.push({ name: 'Users', query: { ...q } }).catch(_ => {})
      }
    },
    $route () {
      window.scroll(0, 0)
      this.setFilters()
      this.getUsers()
    }
  },
  created () {
    this.setFilters()
    this.initial = this.filters.filter
    this.getUsers()
  },
  components: { PageTitle, ViewNav, UserListItem }
}
</script>
