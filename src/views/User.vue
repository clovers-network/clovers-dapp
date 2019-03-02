<template lang="pug">
  article.green.relative(v-if="user")
    header.sticky.top-header-h.left-0.bg-white.z1.border-bottom.md-py1
      h1.block.m-auto.py2.font-mono.h-header.flex
        span.block.m-auto {{ userName(user) }}
        // span.block.m-auto {{ prettyBigNumber(user.balance) }} ♣&#xFE0E;
      .border-top.green.font-mono.bg-white
        .transition-delay.center.col-12(:class="filtersColors")
          .relative
            .h-header.col-12.flex.items-center.justify-center.pointer(@click.stop="toggleFilters")
              div
                span.h5 {{ filtersVisible ? 'Close' : feedFilterName }}
                span.h5.opacity-50.pl1(v-if="!filtersVisible") {{ filters.page }} of {{ maxPage }}
              .absolute.top-0.right-0.h-100.flex.items-center.justify-center(v-show="!filtersVisible", style="width:40px")
                img.block(src="~../assets/icons/sort-arrows.svg", width="20")
            .absolute.top-0.right-0.h-100.flex.items-center.justify-center.pointer(v-show="showFilters", style="width:40px" @click.stop="addNew")
              svg-x(width="14", height="14")

          transition(name="fade")
            .absolute.top-100.left-0.right-0.border-bottom.bg-inherit(v-if="filtersVisible" @click.stop)
              .flex.left-align.items-end
                .col-6.pt1.pb2.pl2.pr1
                  .flex.flex-column
                    p.h5.mb1.font-reg Type
                    .border.center.h3.select
                      select(v-model="filters.filter")
                        option(:value="undefined") All
                        option(value="forsale") For sale

                .col-5.pt1.pb2.pr2.pl1
                  .flex.flex-column
                    p.h5.mb1.font-reg Sort
                    .border.center.h3.select
                      select(v-model="filters.sort")
                        option(:value="undefined") Date
                        option(value="price") Price

                .col-1.pb2.pr1
                  span(v-if="!filters.asc")
                    button.pointer.p2.h3(@click="filters.asc = true") &darr;
                  span(v-else)
                    button.pointer.p2.h3(@click="filters.asc = false") &uarr;
    section
      nav.list-reset.border-bottom.flex.h5.green(v-if="prevPossible || nextPossible")
        li.col-6.flex-grow.pointer.px2.py3.center(v-if="prevPossible" @click="back")
          span &larr; Previous
        li.col-6.flex-grow.pointer.px2.py3.center(v-if="nextPossible" @click="forward")
          span Next &rarr;

      .fade-enter-active(v-if="hasResults", :class="{'opacity-50':loading}")
        clover-list-cards(v-if="clovers.length", :clovers="clovers")
      div(v-else)
        p.center.p2.m0 Nothing to show

      nav.list-reset.flex.h5.green(v-if="(prevPossible || nextPossible) && hasResults")
        li.col-6.flex-grow.pointer.px2.py4.center(v-if="prevPossible" @click="back")
          span &larr; Previous
        li.col-6.flex-grow.pointer.px2.py4.center(v-if="nextPossible" @click="forward")
          span Next &rarr;

</template>

<script>
import store from '@/store'
import { mapGetters } from 'vuex'
import CloverListCards from '@/components/CloverList--Cards'
import { prettyBigNumber, cleanObj } from '@/utils'
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
    user () {
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

    ...mapGetters(['userName'])
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
      }).finally(() => {
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
  beforeRouteEnter (to, from, next) {
    const { addr } = to.params
    store.dispatch('getUser', addr).then(next)
  },
  beforeRouteUpdate (to, from, next) {
    const { addr } = to.params
    store.dispatch('getUser', addr).then(next)
  },
  components: { CloverListCards, svgX }
}
</script>
