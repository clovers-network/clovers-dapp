<template lang="pug">
  article.mx3.md-mx0.green

    featured(v-if="!filters.page || filters.page === 1")

    header
      page-title
        h1 Feed
        p(slot="info") <b>The Feed</b> is where all registerd clovers can be found.<br> You can filter by symmetry, clovers for sale or with comments, as well as sort by price or date.

    section
      //- filters
      filters-nav(:page="filters.page", :maxPages="maxPage", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
        //- filter
        select(slot="filter", v-model="filters.filter")
          option(:value="undefined") All Clovers
          option(value="market") Clovers for Sale
          option(value="Sym") Symmetrical Clovers
          option(value="RotSym") Sym. Rotational
          option(value="X0Sym") Sym. Vertical
          option(value="Y0Sym") Sym. Horizontal
          option(value="XYSym") Sym. Diagonal Up
          option(value="XnYSym") Sym. Diagonal Down
          option(value="multi-1") 1x Symmetries
          option(value="multi-3") 3x Symmetries
          option(value="multi-5") 5x Symmetries
          option(value="NonSym") Non-Symmetrical Clovers
          option(value="public") Human owned
          option(value="contract") Contract owned
          option(value="commented") With Comments
          option(value="pending") Pending Clovers
          //- option(value="rft") RFT
        //- sort
        select(slot="sort", v-model='filters.sort')
          option(:value='undefined') By Date
          option(value='price') By Price

      //- Clover List
      .fade-enter-active(v-if="hasResults", :class="{'opacity-50': loading}")
        clover-list-cards(:clovers='clovers')
      .fade-enter-active(v-else, :class="{'opacity-50': true}")
        clover-list-cards(:clovers='fakeClovers')

      page-nav(:canPrev="prevPossible", :canNext="nextPossible", :hasResults="hasResults", @prev="back", @next="forward")

</template>

<script>
import store from '@/store'
import { mapState, mapGetters } from 'vuex'
import { cleanObj, concatPrice } from '@/utils'
import CloverListCards from '@/components/CloverList--Cards'
import PageTitle from '@/components/PageTitle'
import PageNav from '@/components/PageNav'
import Featured from '@/components/Featured'
import svgX from '@/components/Icons/SVG-X'
import FiltersNav from '@/components/FiltersNav'
import BigNumber from 'bignumber.js'

export default {
  name: 'Feed',
  data () {
    return {
      filtersVisible: false,
      loading: false,
      filters: {
        sort: undefined,
        filter: undefined,
        page: undefined,
        asc: undefined
      },
      fakeClovers: [{ board: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', symmetries: {}, price: 0, commentCount: 0 },
        { board: '55555555555555555555555555555555', symmetries: {}, price: 0, commentCount: 0 },
        { board: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', symmetries: {}, price: 0, commentCount: 0 },
        { board: '0x55555555555555555555555555555555', symmetries: {}, price: 0, commentCount: 0 }]
    }
  },
  head: {
    title: { inner: 'Feed' },
    meta: [
      { name: 'description', content: 'The main feed of Clovers activity.', id: 'meta-desc' }
    ]
  },
  computed: {
    results () {
      return this.$store.state.pagedClovers
    },
    clovers () {
      if (!this.results.results) return []
      return this.results.results.map(c => {
        if (typeof c.price === 'string') {
          c.price = new BigNumber(c.price)
        }
        return c
      })
    },
    prevPossible () {
      return this.results.prevPage
    },
    nextPossible () {
      return this.results.nextPage
    },
    maxPage () {
      if (!this.results.allResults) return 0
      const perPage = this.results.perPage || 12
      return concatPrice(Math.ceil(this.results.allResults / perPage))
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
    },
    feedFilterName () {
      let type = null
      let by = this.filters.sort ? ' by Price' : ''
      let order = !this.filters.asc ? '' : this.filters.sort ? ' (low to high)' : ' (oldest first)'

      switch (this.filters.filter) {
        case 'market':
          type = 'For Sale'; break
        case 'rft':
          type = 'RFT'; break
        case 'Sym':
          type = 'Symmetrical'; break
        case 'RotSym':
          type = 'Rotational'; break
        case 'X0Sym':
          type = 'Horizontal'; break
        case 'Y0Sym':
          type = 'Vertical'; break
        case 'XYSym':
          type = 'Diagonal Up'; break
        case 'XnYSym':
          type = 'Diagonal Down'; break
        default:
          type = 'All'
      }
      return type + by + order
    },

    ...mapState(['newClovers']),
    ...mapGetters(['newCloversCount', 'apiBase'])
  },
  watch: {
    filters: {
      deep: true,
      handler ({ filter }) {
        let q = { ...this.filters }
        cleanObj(q)
        // handle multis
        if (filter && filter.includes('multi')) {
          let [f, x] = q.filter.split('-')
          q.filter = f
          q.x = x
        }
        const cf = this.$route.query.filter
        const cx = this.$route.query.x
        if (cf !== q.filter || cx !== q.x) {
          delete q.page
        }
        this.$router.push({ name: 'Feed', query: { ...q } })
      }
    },
    $route () {
      window.scroll(0, 0)
      this.setFilters()
      this.query()
    }
  },
  mounted () {
    this.setFilters()
    this.query()
    this.$store.dispatch('getClubTokenPrice')
  },
  methods: {
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    hideFilters () {
      this.filtersVisible = false
    },

    setFilters () {
      this.$store.commit('CLEAR_NEW_CLOVERS')
      const { query } = this.$route
      // handle multis
      if (query.filter === 'multi') {
        this.filters.filter = query.filter + '-' + (query.x || 1)
      } else {
        this.filters.filter = query.filter || undefined
      }
      this.filters.sort = query.sort || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading) return
      this.filtersVisible = false
      this.loading = true
      let q = { ...this.filters }
      if (q.filter && q.filter.includes('multi')) {
        let [f, x] = q.filter.split('-')
        q.filter = f
        q.x = x
      }
      this.$store.dispatch('getPagedClovers', {
        filters: q,
        url: this.apiBase + '/clovers'
      }).then(() => {
        this.loading = false
      }).catch((error) => {
        console.error(error)
        this.loading = false
      })
    },
    addNew () {
      if (this.isFiltered) {
        this.$router.push({ name: 'Feed' })
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
  components: { CloverListCards, svgX, PageTitle, PageNav, FiltersNav, Featured }
}
</script>
