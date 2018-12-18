<template>
  <div>
    <div class="sticky z1 border-bottom green flex font-mono bg-white" style="top:46px">
      <div class="center col-6">
        <div @click="toggleFilters" class="p1 pointer">
          <div :style="filterBorderStyles" class="filters-btn"></div>
          <span class="h3">{{feedFilterName}}</span>
          <div class="absolute top-0 right-0 mr2 mt2 line-height-1">
            <img :style="dropArrowRotate" src="~../assets/icons/chevron-down.svg" width="14" height="14"/>
          </div>
        </div>
        <transition name="fade">
          <div
            v-if="filtersVisible"
            class="absolute top-100 left-0 right-0 border-bottom bg-white">
            <div class="flex left-align">
              <div class="col-6 py2 pl2 pr1 border-top border-white">
                <div class="flex flex-column">
                  <p class="h6 mb1 font-reg">Type</p>
                  <div class="border center h3 select">
                    <select v-model="feedFilter">
                      <option value="all">All</option>
                      <option value="market">For sale</option>
                      <option value="curationMarket">RFT</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-6 py2 pr2 pl1 border-top">
                <div class="flex flex-column">
                  <p class="h6 mb1 font-reg">Sort</p>
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
      <div class="border-left p1 center col-6 not-allowed">
        <span class="h3">Search</span>
      </div>
    </div>

    <nav v-if="prevPage" class="list-reset border-bottom border-green">
      <li class="py2 px3 center">
        <router-link :to="prevPage" class="h5 green">&larr; View previous</router-link>
      </li>
    </nav>

    <!-- Clover List -->
    <ul class="list-reset flex flex-wrap items-center m0 overflow-hidden">
      <li v-for="(clover, i) in clovers" :key="i" class="col-6 sm-col-4 md-col-3">
        <router-link :to="cloverLink(clover)" class="block green border-bottom border-bottom-dotted border-left border-left-dotted" :class="{'xs-border-left-transp': i % 2 === 0, 'sm-border-left-transp': i % 3 === 0, 'md-border-left-transp': i % 4 === 0}">
          <!--<clover-row-item :clover="clover" />-->
          <clover-card-item :clover="clover" />
        </router-link>
      </li>
      <li class="p2 center" v-if="!clovers.length">No Clovers To Show...</li>
    </ul>

    <nav v-if="nextPage" class="list-reset bottom-0">
      <li class="py2 px3 center">
        <router-link :to="nextPage" class="h5 green">View next &rarr;</router-link>
      </li>
    </nav>

    <div v-if="newCloversCount" @click="showNewClovers" class="sticky bottom-0 bg-green white p2 center h-bttm-bar flex pointer">
      <span class="block m-auto font-exp">Show {{ newCloversCount }} new {{ pluralize('Clover', newCloversCount) }}</span>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState, mapGetters, mapMutations } from 'vuex'
import { cloverLink, pluralize } from '@/utils'
// import CloverRowItem from '@/components/CloverItem--Row'
import CloverCardItem from '@/components/CloverItem--Card'
const pageSize = 12

export default {
  name: 'Feed',
  data () {
    return {
      filtersVisible: false
    }
  },
  head: {
    title: { inner: 'Home' },
    meta: [
      { name: 'description', content: 'The main feed of Clovers activity.', id: 'meta-desc' }
    ]
  },
  computed: {
    feedFilterName () {
      switch (this.feedFilter) {
        case 'all':
          return 'Filter'
        case 'market':
          return 'For Sale'
        case 'curationMarket':
          return 'RFT'
        default:
          return ''
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
      return `/home/page/${this.page + 1}`
    },
    prevPage () {
      if (this.page === 1) {
        return false
      } else if (this.page === 2) {
        return '/home'
      } else {
        return `/home/page/${this.page - 1}`
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
        this.$router.push({name: 'Feed'})
        this.updateFilter(newVal)
        this.toggleFilters()
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
      this.$router.push({name: 'Feed'})
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
      this.$router.replace(`/home/page/${lastPage}`)
    }
  },
  components: { CloverCardItem }
}
</script>

<style>
.filters-btn {
  border-top-color: white;
  border-top-style: solid;
  border-top-width: 3;
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: border 0.18s ease-in-out;
}
</style>
