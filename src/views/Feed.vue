<template>
  <div>
    <div class="sticky z1 border-bottom green font-mono bg-white top-header-h">
      <div :class="filtersColors" class="transition-delay center col-12">
        <div class="relative">
          <div @click.stop="toggleFilters" class="h-header col-12 flex items-center justify-center pointer">
            <div>
              <span class="h5">{{ filtersVisible ? 'Close' : feedFilterName }}</span>
              <span v-if="!filtersVisible" class="h5 opacity-50 pl1">{{ filters.page }} of {{ maxPage }}</span>
            </div>
            <div v-show="!filtersVisible" class="absolute top-0 right-0 h-100 flex items-center justify-center" style="width:40px">
              <img class="block" src="~../assets/icons/sort-arrows.svg" width="20"/>
            </div>
          </div>
          <div v-show="showFilters" class="absolute top-0 right-0 h-100 flex items-center justify-center pointer" style="width:40px" @click.stop="addNew">
            <svg-x width="14" height="14" />
          </div>
        </div>
        <transition name="fade">
          <div
            v-if="filtersVisible" @click.stop
            class="absolute top-100 left-0 right-0 border-bottom bg-inherit">
            <div class="flex left-align items-end">
              <div class="col-6 pt1 pb2 pl2 pr1">
                <div class="flex flex-column">
                  <p class="h5 mb1 font-reg">Type</p>
                  <div class="border center h3 select">
                    <select v-model="filters.filter">
                      <option :value="undefined">All</option>
                      <option value="forsale">For sale</option>
                      <option value="rft">RFT</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-5 pt1 pb2 pr2 pl1">
                <div class="flex flex-column">
                  <p class="h5 mb1 font-reg">Sort</p>
                  <div class="border center h3 select">
                    <select v-model="filters.sort">
                      <option :value="undefined">Date</option>
                      <option value="price">Price</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-1 pb2 pr1">
                <span v-if="!filters.asc">
                  <button @click="filters.asc = true" class="pointer p2 h3">
                    &darr;
                  </button>
                </span>
                <span v-else>
                  <button @click="filters.asc = false" class="pointer p2 h3">
                    &uarr;
                  </button>
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <nav v-if="prevPossible || nextPossible" class="list-reset border-bottom flex h5 green">
      <li v-if="prevPossible" @click="back" class="col-6 flex-grow pointer px2 py3 center">
        <span>&larr; Previous</span>
      </li>
      <li v-if="nextPossible" @click="forward" class="col-6 flex-grow pointer px2 py3 center">
        <span>Next &rarr;</span>
      </li>
    </nav>

    <!-- Clover List -->
    <div v-if="hasResults" :class="{'opacity-50': loading}" class="fade-enter-active">
      <clover-list-cards :clovers="clovers" />
    </div>

    <nav v-if="(prevPossible || nextPossible) && hasResults" class="list-reset flex h5 green">
      <li v-if="prevPossible" @click="back" class="col-6 flex-grow pointer px2 py4 center">
        <span>&larr; Previous</span>
      </li>
      <li v-if="nextPossible" @click="forward" class="col-6 flex-grow pointer px2 py4 center">
        <span>Next &rarr;</span>
      </li>
    </nav>

    <div v-if="newCloversCount" @click="addNew" class="sticky bottom-0 bg-green white p2 center h-bttm-bar flex pointer">
      <span class="block m-auto font-exp">Show {{ newCloversCount }} new {{ pluralize('Clover', newCloversCount) }}</span>
    </div>
  </div>
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
        default:
          type = 'All'
      }
      return type + by + order
    },
    filtersColors () {
      return this.showFilters ? 'bg-green white' : 'bg-white green'
    },

    ...mapState(['newClovers']),
    ...mapGetters(['newCloversCount'])
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
