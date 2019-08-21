<template lang="pug">
  section.mx3.md-mx0
    //- filters
    filters-nav(v-if="hasResults", :page="filters.page", :maxPages="maxPage", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
      select(slot="filter", v-model="filters.filter")
        option(:value="undefined") All Clovers
        option(value="forsale") Clovers for Sale
        option(value="Sym") Symmetrical Clovers
      select(slot="sort", v-model='filters.sort')
        option(:value='undefined') Sort by Date
        option(value='price') Sort by Price
    header.hidden.md-block.h-select.py1.mb2.content-box(v-else)
    section
      //- (list)
      .fade-enter-active(v-if="hasResults", :class="{'opacity-50':loading}")
        clover-list-cards(v-if="clovers.length", :clovers="clovers")
      //- (empty)
      div(v-else)
        p.center.p2.m0 Nothing to show

      page-nav(v-if="hasResults", :hasResults="hasResults", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
</template>

<script>
import CloverListCards from '@/components/CloverList--Cards'
import FiltersNav from '@/components/FiltersNav'
import PageNav from '@/components/PageNav'
import { cleanObj } from '@/utils'
import {mapGetters} from 'vuex'
export default {
  name: 'User__Clovers',
  props: ['user'],
  data () {
    return {
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
    ...mapGetters(['apiBase']),
    clovers () {
      if (!this.results.results) return []
      return this.results.results
    },
    results () {
      return this.$store.state.pagedClovers
    },
    hasResults () {
      return this.results.results && !!this.results.results.length
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
    apiUrl () {
      return `${this.apiBase}/users/${this.user.address}/clovers`
    }
  },
  methods: {
    setFilters () {
      const { query } = this.$route
      this.filters.filter = query.filter || undefined
      this.filters.sort = query.sort || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading || !this.apiUrl) return
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
    back () {
      if (!this.prevPossible) return
      this.filters.page = this.results.prevPage
    },
    forward () {
      if (!this.nextPossible) return
      this.filters.page = this.results.nextPage
    }
  },
  mounted () {
    this.setFilters()
    this.query()
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
  components: { CloverListCards, FiltersNav, PageNav }
}
</script>
