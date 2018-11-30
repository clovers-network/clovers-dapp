<template>
  <div>
    <div class="sticky border-bottom green flex font-mono bg-white relative" style="top:46px">
      <div class="center col-6">
        <div @click="toggleFilters" class="relative p1 pointer">
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
    <ul class="list-reset md-flex flex-wrap justify-around items-center m0 md-px1">
      <li v-for="(clover, i) in clovers" :key="i" class="md-col-6 md-px1">
        <div is="router-link" tag="div" :to="cloverLink(clover)" class="flex py2 border-bottom green">
          <!-- image -->
          <div class="col-3 center">
            <img :src="cloverImage(clover, 64)" width="64" height="64"/>
          </div>

          <!-- RFT clover info -->
          <template v-if="inCurationMarket(clover)">
            <div class="col-5 flex flex-column justify-center pr3">
              <p class="h7 m0">Market Cap &clubs;</p>
              <p class="h4 m0 truncate font-mono">0</p>
            </div>
            <div class="col-3 flex flex-column justify-center pr2">
              <p class="h7 m0">&clubs; / Share</p>
              <p class="h4 m0 truncate font-mono">0</p>
            </div>
          </template>

          <!-- default clover info -->
          <template v-else>
            <div class="col-3 flex flex-column justify-center pl1">
              <h3 class="h4 truncate font-mono">
                <span v-if="clover.name !== clover.board">{{ clover.name }}</span>
              </h3>
            </div>
            <div class="col-3 flex flex-column justify-center px2">
              <h6 class="h7 m0">Owner</h6>
              <h5 class="h4 m0 truncate font-mono" style="max-width:4.5em">{{clover.owner}}</h5>
            </div>
            <div class="col-2 flex flex-column justify-center pl1">
              <p class="h7 m0 nowrap">Price &clubs;</p>
              <p v-if="forSale(clover)" class="h4 m0 truncate">{{ cloverPrice(clover) }}</p>
              <p v-else class="h4 m0 font-mono">---</p>
            </div>
          </template>

          <div class="col-1 center flex justify-center pr2">
            <img src="~../assets/icons/arrow-right.svg" width="18" height="18"/>
          </div>
        </div>
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
import { cloverLink, cloverImage, pluralize, prettyBigNumber } from '@/utils'
import BigNumber from 'bignumber.js'
const pageSize = 12

export default {
  name: 'Feed',
  data () {
    return {
      filtersVisible: false
    }
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
    cloverImage,
    pluralize,

    showNewClovers () {
      this.$router.push({name: 'Feed'})
      this.showNew()
    },
    cloverPrice ({ price }) {
      return prettyBigNumber(price, 0)
    },
    forSale ({ price }) {
      if (typeof price !== 'object') price = new BigNumber(price)
      return price.gt(0)
    },
    inCurationMarket ({ owner }) {
      return owner === this.curationMarketAddress
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
      this.$router.replace(`/feed/page/${lastPage}`)
    }
  }
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
