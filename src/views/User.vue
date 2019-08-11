<template lang="pug">
  .green.relative(v-if="user")
    //- profile
    header
      user-card(:user="user")
    //- main
    section.mx3
      //- filters
      filters-nav(:page="filters.page", :maxPages="maxPage", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
        select(slot="filter", v-model="filters.filter")
          option(:value="undefined") All Clovers
          option(value="forsale") Clovers for Sale
          option(value="Sym") Symmetrical Clovers
        select(slot="sort", v-model='filters.sort')
          option(:value='undefined') Sort by Date
          option(value='price') Sort by Price
      section
        //- (list)
        .fade-enter-active(v-if="hasResults", :class="{'opacity-50':loading}")
          clover-list-cards(v-if="clovers.length", :clovers="clovers")
        //- (empty)
        div(v-else)
          p.center.p2.m0 Nothing to show

        page-nav(:hasResults="hasResults", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")

</template>

<script>
import store from '@/store'
import UserCard from '@/components/UserCard'
import CloverListCards from '@/components/CloverList--Cards'
import FiltersNav from '@/components/FiltersNav'
import PageNav from '@/components/PageNav'
import { cleanObj } from '@/utils'
import svgX from '@/components/Icons/SVG-X'

export default {
  name: 'User',
  props: {
    addr: String
  },
  data () {
    return {
      filtersVisible: false,
      loading: false,
      filters: {
        sort: undefined,
        filter: undefined,
        page: undefined,
        asc: undefined
      }
    }
  },
  computed: {
    name () {
      return this.userName(this.user)
    },
    user () {
      if (this.$route.name === 'Account/Clovers') return this.$store.getters.user
      return this.$store.state.otherUser
    },
    results () {
      return this.$store.state.pagedClovers
    },
    clovers () {
      if (!this.results.results) return []
      return this.results.results
    },
    apiUrl () {
      return `${process.env.VUE_APP_API_URL}/users/${this.user.address}/clovers`
    },
    feedFilterName () {
      let type = null
      let by = this.filters.sort ? ' by Price' : ''
      let order = !this.filters.asc ? '' : this.filters.sort ? ' (low to high)' : ' (oldest first)'

      switch (this.filters.filter) {
        case 'forsale':
          type = 'For Sale'; break
        case 'rft':
          type = 'RFT'; break
        default:
          type = 'All'
      }
      return type + by + order
    },
    filtersColors () {
      return this.showFilters ? 'bg-green white' : 'bg-white green'
    },
    prevPossible () {
      return this.results.prevPage
    },
    nextPossible () {
      return this.results.nextPage
    },
    maxPage () {
      if (!this.results.allResults) return 0
      return Math.ceil(this.results.allResults / 12)
    },
    hasResults () {
      return this.results.results && !!this.results.results.length
    },
    isFiltered () {
      return !!Object.keys(this.$route.query).length
    },
    showFilters () {
      if (!this.hasResults) return false
      return !!this.filters.filter || this.filters.asc || !!this.filters.sort
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
        this.$router.push({ query: { ...q } })
      }
    },
    $route () {
      this.setFilters()
      this.query()
    }
  },
  mounted () {
    this.setFilters()
    this.query()
  },
  methods: {
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    hideFilters () {
      this.filtersVisible = false
    },
    setFilters () {
      const { query } = this.$route
      this.filters.filter = query.filter || undefined
      this.filters.sort = query.sort || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading || !this.apiUrl) return
      this.filtersVisible = false
      this.loading = true

      this.$store.dispatch('getPagedClovers', {
        url: this.apiUrl,
        filters: this.filters
      }).then(() => {
        this.loading = false
      }).catch((error) => {
        console.error(error)
        this.loading = false
      })
    },
    addNew () {
      if (this.isFiltered) {
        this.$router.push({ name: 'User', params: { addr: this.user.address } })
      } else {
        this.results.results.unshift(...this.newClovers)
        this.$store.commit('CLEAR_NEW_CLOVERS')
      }
    },
    back () {
      if (!this.prevPossible) return
      this.filters.page = this.results.prevPage
    },
    forward () {
      if (!this.nextPossible) return
      this.filters.page = this.results.nextPage
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
  components: { UserCard, CloverListCards, svgX, FiltersNav, PageNav }
}
</script>
