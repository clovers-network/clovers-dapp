<template lang="pug">
  .green.relative(v-if="user")
    section.border.rounded.px2.md-px3.max-width-2.my4.relative(name="My profile")
      .flex.items-center
        .mr3
          img(:src="userImage(user, 87)" width="87" height="87")
        div
          h2.h3.md-h2.mt3.mb0.font-exp
            span {{ name }}
          small.h6(v-if="user.created") Member since block # {{ user.created.toLocaleString() }}
          small.h5(v-else-if="user.modified") Last active, block # {{ user.modified.toLocaleString() }}
          .mt2.mb3
            span.flex.items-center
              coin-icon
              span.pl1.bold {{ prettyUserBalance }}

    .mt4
      .mb2
        .flex.left-align.justify-end
          .pt1.pb2.pl2.pr1
            .center.h4.select
              select(v-model="filters.filter")
                option(:value="undefined") All Clovers
                option(value="forsale") Clovers for Sale
                option(value="Sym") Symmetrical Clovers

          .pt1.pb2.pr2.pl1
            .center.h4.select
              select(v-model='filters.sort')
                option(:value='undefined') Sort by Date
                option(value='price') Sort by Price
          .pt1.pb2.center(style="min-width:140px")
            .center.h4.border.rounded.h-100.px2.flex.items-center.justify-between.hover-bg-l-green
              span.pr2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !prevPossible }", @click="back")
                img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
              span {{ filters.page }} of {{ maxPage }}
              span.pl2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !nextPossible }", @click="forward")
                img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

    section
      .fade-enter-active(v-if="hasResults", :class="{'opacity-50':loading}")
        clover-list-cards(v-if="clovers.length", :clovers="clovers")
      div(v-else)
        p.center.p2.m0 Nothing to show

      nav.list-reset.flex.h5.green.items-center.justify-center.my3.pb4(v-if='(prevPossible || nextPossible) && hasResults')
        li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !prevPossible }", @click="back")
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
          span.pl1 Previous
        li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !nextPossible }", @click="forward")
          span.pr1 Next
          img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

</template>

<script>
import store from '@/store'
import { mapGetters } from 'vuex'
import CloverListCards from '@/components/CloverList--Cards'
import { prettyBigNumber, cleanObj } from '@/utils'
import svgX from '@/components/Icons/SVG-X'
import CoinIcon from '@/components/Icons/CoinIcon'

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
    },
    prettyUserBalance () {
      return prettyBigNumber(this.user.balance || '0')
    },

    ...mapGetters(['userName', 'userImage'])
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
    prettyBigNumber,

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
  components: { CloverListCards, svgX, CoinIcon }
}
</script>
