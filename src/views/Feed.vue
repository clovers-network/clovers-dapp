<template>
  <div>
    <div class="sticky z1 border-bottom green font-mono bg-white top-header-h">
      <div class="center col-12">
        <div class="relative" :class="{'bg-green white': feedFilter !== 'all'}">
          <div @click.stop="toggleFilters" class="h-header col-12 flex items-center justify-center pointer">
            <span class="h5 block">{{filtersVisible ? 'Close' : feedFilterName}}</span>
            <div v-show="!filtersVisible" class="absolute top-0 right-0 h-100 flex items-center justify-center" style="width:40px">
              <img class="block" src="~../assets/icons/sort-arrows.svg" width="20"/>
            </div>
          </div>
          <div v-show="feedFilter !== 'all' && !filtersVisible" class="absolute top-0 right-0 h-100 flex items-center justify-center" style="width:40px" @click.stop="feedFilter = 'all'">
            <svg-x width="14" height="14" />
          </div>
        </div>
        <transition name="fade">
          <div
            v-if="filtersVisible"
            class="absolute top-100 left-0 right-0 border-bottom" :class="feedFilter !== 'all' ? 'bg-green white' : 'bg-white green'">
            <div class="flex left-align">
              <div class="col-6 pt1 pb2 pl2 pr1">
                <div class="flex flex-column">
                  <p class="h5 mb1 font-reg">Type</p>
                  <div class="border center h3 select">
                    <select v-model="feedFilter">
                      <option value="all">All</option>
                      <option value="market">For sale</option>
                      <option value="curationMarket">RFT</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-6 pt1 pb2 pr2 pl1">
                <div class="flex flex-column">
                  <p class="h5 mb1 font-reg">Sort</p>
                  <div class="border center h3 select">
                    <select v-model="sortBy">
                      <option value="modified">Date</option>
                      <option value="price">Price</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <template v-if="prevPage">
      <router-link :to="prevPage" class="h5 green">
        <nav  class="list-reset border-bottom border-green">
          <li class="py4 px3 center">
            &larr; View previous
          </li>
        </nav>
      </router-link>
    </template>

    <!-- Clover List -->
    <clover-list-cards :clovers="clovers" />
    <!-- Pagination -->
    <template v-if="nextPage">
      <router-link :to="nextPage" class="h5 green">
        <nav  class="list-reset bottom-0">
          <li class="py4 px3 center">
            View next &rarr;
          </li>
        </nav>
      </router-link>
    </template>
    <div v-if="newCloversCount" @click="showNewClovers" class="sticky bottom-0 bg-green white p2 center h-bttm-bar flex pointer">
      <span class="block m-auto font-exp">Show {{ newCloversCount }} new {{ pluralize('Clover', newCloversCount) }}</span>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState, mapGetters, mapMutations } from 'vuex'
import { cloverLink, pluralize } from '@/utils'
import CloverListCards from '@/components/CloverList--Cards'
import svgX from '@/components/Icons/SVG-X'
const pageSize = 12

export default {
  name: 'Feed',
  data () {
    return {
      filtersVisible: false
    }
  },
  head: {
    title: { inner: 'Market' },
    meta: [
      { name: 'description', content: 'The main feed of Clovers activity.', id: 'meta-desc' }
    ]
  },
  computed: {
    feedFilterName () {
      switch (this.feedFilter) {
        case 'all': return 'All'
        case 'market': return 'For Sale'
        case 'curationMarket': return 'RFT'
        default: return ''
      }
    },
    page () {
      return Number(this.$route.params.page) || 1
    },
    clovers () {
      const start = (this.page - 1) * pageSize
      const end = this.page * pageSize
      return this.$store.getters.sortedClovers.slice(start, end)
    },
    allLoadedCloverCount () {
      return this.$store.state.allClovers.length
    },
    nextPage () {
      if (this.clovers.length < 12) return false
      return `/market/page/${this.page + 1}`
    },
    prevPage () {
      if (this.page === 1) {
        return false
      } else if (this.page === 2) {
        return '/market'
      } else {
        return `/market/page/${this.page - 1}`
      }
    },
    newCloversCount () {
      return this.newClovers.length
    },
    filterBorderStyles () {
      if (!this.filtersVisible) return
      return {
        borderTopColor: 'rgb(0, 180, 100)'
      }
    },
    sortBy: {
      get () {
        return this.$store.state.sortBy
      },
      set (newVal) {
        this.updateOrder(newVal)
        this.toggleFilters()
      }
    },
    feedFilter: {
      get () {
        return this.$store.state.feedFilter
      },
      set (newVal) {
        this.$router.push({name: 'Market'})
        this.updateFilter(newVal)
        this.hideFilters()
      }
    },
    dropArrowRotate () {
      if (!this.filtersVisible) return
      return {
        transform: 'rotate(180deg)'
      }
    },

    ...mapState(['newClovers']),
    ...mapGetters(['newCloversCount', 'curationMarketAddress'])
  },
  methods: {
    cloverLink,
    pluralize,

    showNewClovers () {
      this.$router.push({name: 'Market'})
      this.showNew()
    },
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    showFilters () {
      this.filtersVisible = true
    },
    hideFilters () {
      this.filtersVisible = false
    },

    ...mapMutations({
      showNew: 'SHOW_NEW_CLOVERS',
      updateOrder: 'UPDATE_FEED_ORDER',
      updateFilter: 'UPDATE_FEED_FILTER'
    })
  },
  watch: {
    /* -------- paginated version ---------------- */
    // page (newVal, oldVal) {
    //   if (Number(newVal) > Number(oldVal)) {
    //     store.dispatch('getClovers', newVal)
    //   }
    // }
  },
  mounted () {
    if (!this.clovers.length) {
      let lastPage = Math.ceil(this.allLoadedCloverCount / 12)
      this.$router.replace(`/market/page/${lastPage}`)
    }
    this.$store.dispatch('getClubTokenPrice')
  },
  components: { CloverListCards, svgX }
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
