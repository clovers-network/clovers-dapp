<template lang="pug">
  .mx3.green
    more-information(title="?" content="<b>The Feed</b> is where all registerd Clovers can be found. You can filter by symmetry, popularity, comments, clovers for sale as well as sort by price or date.")

    //- filters
    filters-nav
      //- .mt3.mb3.pb1.sm-pb0.sm-mb2.flex.flex-wrap.sm-flex-no-wrap.left-align.sm-justify-end.mxn2.px3.sm-px1
      //- filter
      .col-6.sm-col-auto.my1.px1
        .center.h4.select
          select(v-model="filters.filter")
            option(:value="undefined") All Clovers
            option(value="forsale") Clovers for Sale
            option(value="Sym") Symmetrical Clovers
            option(value="RotSym") Sym. Rotational
            option(value="X0Sym") Sym. Vertical
            option(value="Y0Sym") Sym. Horizontal
            option(value="XYSym") Sym. Diagonal Up
            option(value="XnYSym") Sym. Diagonal Down
            option(value="public") Human owned
            option(value="contract") Contract owned
            option(value="commented") With Comments
            //- option(value="rft") RFT
      //- sort
      .col-6.sm-col-auto.my1.px1
        .center.h4.select
          select(v-model='filters.sort')
            option(:value='undefined') Sort by Date
            option(value='price') Sort by Price
      //- page nav
      .col-12.sm-col-auto.my1.px1
        .center.h4.border.rounded.h-select.flex.items-center.justify-between.hover-bg-l-green.nowrap
          span.p2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !prevPossible }", @click="back")
            img.block(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
          span {{ filters.page }} of {{ maxPage }}
          span.p2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !nextPossible }", @click="forward")
            img.block(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

    //- Clover List
    .fade-enter-active(v-if="hasResults", :class="{'opacity-50': loading}")
      clover-list-cards(:clovers='clovers')
    .fade-enter-active(v-else, :class="{'opacity-50': true}")
      clover-list-cards(:clovers='fakeClovers')

    nav.flex.h5.green.items-center.justify-center.my3.pb4(v-if='(prevPossible || nextPossible) && hasResults')
      .col-6.flex.px1.sm-px2.justify-end
        button.pointer.px3.py2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !prevPossible }", @click="back")
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
      .col-6.flex.px1.sm-px2
        button.pointer.px3.py2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !nextPossible }", @click="forward")
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

    //- .sticky.bottom-0.bg-green.white.p2.center.h-bttm-bar.flex.pointer(v-if='newCloversCount' @click='addNew')
      span.block.m-auto.font-exp Show {{ newCloversCount }} new {{ pluralize(&apos;Clover&apos;, newCloversCount) }}
</template>

<script>
import store from '@/store'
import { mapState, mapGetters } from 'vuex'
import { pluralize, cleanObj } from '@/utils'
import CloverListCards from '@/components/CloverList--Cards'
import PageNav from '@/components/PageNav'
import svgX from '@/components/Icons/SVG-X'
import MoreInformation from '@/components/MoreInformation'
import FiltersNav from '@/components/FiltersNav'

const apiUrl = process.env.VUE_APP_API_URL + '/clovers'

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
    title: { inner: 'Market' },
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
      return this.results.results
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
    ...mapGetters(['newCloversCount'])
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
    pluralize,

    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    hideFilters () {
      this.filtersVisible = false
    },

    setFilters () {
      this.$store.commit('CLEAR_NEW_CLOVERS')
      const { query } = this.$route
      this.filters.filter = query.filter || undefined
      this.filters.sort = query.sort || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading) return
      this.filtersVisible = false
      this.loading = true

      this.$store.dispatch('getPagedClovers', {
        url: apiUrl,
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
  components: { CloverListCards, svgX, PageNav, MoreInformation, FiltersNav }
}
</script>

<style>
.filters-btn {
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: border 0.18s ease-in-out;
}
</style>
