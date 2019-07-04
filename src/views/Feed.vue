<template lang="pug">
  .green
    .mt4
      //- .relative
        .h-header.col-12
          div
            span.h5 Showing {{ feedFilterName }}
            //- span.h5.opacity-50.pl1 / {{ filters.page }} of {{ maxPage }}

      .mb2
        .flex.left-align.justify-end
          .pt1.pb2.pl2.pr1
            div
              //- p.h5.mb1.font-reg Type
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
                  //- option(value="rft") RFT
          .pt1.pb2.pr2.pl1
            div
              //- p.h5.mb1.font-reg Sort
              .center.h4.select
                select(v-model='filters.sort')
                  option(:value='undefined') Sort by Date
                  option(value='price') Sort by Price
          .pt1.pb2.center(style="min-width:140px")
            .center.h4.border.rounded.h-100.px2.flex.items-center.justify-between.hover-bg-l-green
              span.pr2.pointer.bold.trans-opacity-long(:class="{ 'o-0': !prevPossible }", @click="back")
                img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
              span {{ filters.page }} of {{ maxPage }}
              span.pl2.pointer.bold.trans-opacity-long(:class="{ 'o-0': !nextPossible }", @click="forward")
                img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")
          //- .pb2.pr1
            span(v-if='!filters.asc')
              button.pointer.p2.h3(@click='filters.asc = true')
                | &darr;
            span(v-else='')
              button.pointer.p2.h3(@click='filters.asc = false')
                | &uarr;
    //- nav.list-reset.border-bottom.flex.h5.green(v-if='prevPossible || nextPossible')
      li.col-6.flex-grow.pointer.px2.py3.center(v-if='prevPossible' @click='back')
        span &larr; Previous
      li.col-6.flex-grow.pointer.px2.py3.center(v-if='nextPossible' @click='forward')
        span Next &rarr;

    //- Clover List
    .fade-enter-active(v-if="hasResults", :class="{'opacity-50': loading}")
      clover-list-cards(:clovers='clovers')

    nav.list-reset.flex.h5.green.items-center.justify-center.my3.pb4(v-if='(prevPossible || nextPossible) && hasResults')
      li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'o-0': !prevPossible }", @click="back")
        img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
        span.pl1 Previous
      li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'o-0': !nextPossible }", @click="forward")
        span.pr1 Next
        img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

    .sticky.bottom-0.bg-green.white.p2.center.h-bttm-bar.flex.pointer(v-if='newCloversCount' @click='addNew')
      span.block.m-auto.font-exp Show {{ newCloversCount }} new {{ pluralize(&apos;Clover&apos;, newCloversCount) }}

</template>

<script>
import store from '@/store'
import { mapState, mapGetters } from 'vuex'
import { pluralize, cleanObj } from '@/utils'
import CloverListCards from '@/components/CloverList--Cards'
import PageNav from '@/components/PageNav'
import svgX from '@/components/Icons/SVG-X'

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
      }
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
        this.$router.push({ name: 'Market', query: { ...q } })
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
        console.log(error)
        this.loading = false
      })
    },
    addNew () {
      if (this.isFiltered) {
        this.$router.push({ name: 'Market' })
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
  components: { CloverListCards, svgX, PageNav }
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
