<template>
  <div>
    <div class="fade-enter-active">
      <div @click="toggleFilters" :class="filtersColors" class="transition-delay sticky z1 border-bottom font-mono" style="top:46px">
        <div :class="{pointer: !showFilters}" class="col-12 transition-all">
          <div class="relative px2">
            <div class="h-header col-12 flex items-center justify-between">
              <div class="h6 sm-h5 col-3">
                <span class="xs-hide">Block </span>
                <span> #{{ currentBlock }}</span>
              </div>
              <div class="col-6 center">
                <span class="opacity-50 xs-hide">Page</span> {{ filters.page }}
                <span v-if="maxPage" class=""> of {{ maxPage }}</span>
              </div>
              <div v-if="showFilters" @click.stop="addNew" class="col-3 align-right pointer">
                <span>Clear</span>
              </div>
              <div v-else class="col-3 align-right pointer">
                <img v-if="filtersVisible" src="~../assets/icons/chevron-up.svg" width="14"/>
                <img v-else src="~../assets/icons/chevron-down.svg" width="14"/>
              </div>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div v-if="showFilters || filtersVisible" @click.stop :class="{'absolute border-bottom': !showFilters}" class="col-12 bg-inherit">
            <div class="sm-flex">
              <div class="sm-col-6 p2 flex items-center border-top border-top-dotted">
                <div>Show</div>
                <div class="center select">
                  <select v-model="filters.filter">
                    <option v-for="(val, key) of types" :key="key" :value="key !== 'all' ? key : undefined">{{ val }}</option>
                  </select>
                </div>
              </div>
              <div class="sm-col-6 p2 flex sm-justify-end items-center border-top border-top-dotted">
                <div class="mr2">Sort by</div>
                <button @click="filters.asc = false" :class="{'border': !filters.asc}" class="px2 py1 pointer">
                  <span>Newest</span>
                </button>
                <button @click="filters.asc = true" :class="{'border': filters.asc}" class="ml3 px2 py1 pointer">
                  <span>Oldest</span>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="hasResults" :class="{'opacity-50': loading}" class="fade-enter-active">
        <div class="mx-auto bg-white">

          <div v-if="liveLogs.length" class="list-reset font-mono center" style="top:93px">
            <span @click.self="addNew" class="pl2 pointer h5">Show {{ liveLogs.length }} new log(s)</span>
          </div>

          <!-- <div v-else class="center p2 h5 font-mono">
            <span class="light-green">{{ currentFilter }}</span>
            <span v-if="liveLogs.length" @click="addNew" class="pl2 pointer h5">Show {{ liveLogs.length }} new log(s)</span>
          </div> -->

          <nav v-if="prevPossible || nextPossible" class="list-reset border-green flex h5 green">
            <li v-if="prevPossible" @click="filters.page--" class="col-6 flex-grow pointer px2 py4 center">
              <span>&larr; Previous</span>
            </li>
            <li v-if="nextPossible" @click="filters.page++" class="col-6 flex-grow pointer px2 py4 center">
              <span>Next &rarr;</span>
            </li>
          </nav>

          <ul class="m0 p0 list-reset">
            <!-- log item -->
            <li v-for="log in activity" :key="log.id || log.transactionHash" class="border-top">
              <activity-item :item="log"/>
            </li>
          </ul>

          <nav v-if="prevPossible || nextPossible" class="list-reset border-top border-green flex h5 green">
            <li v-if="prevPossible" @click="filters.page--" class="col-6 flex-grow pointer px2 py4 center">
              <span>&larr; Previous</span>
            </li>
            <li v-if="nextPossible" @click="filters.page++" class="col-6 flex-grow pointer px2 py4 center">
              <span>Next &rarr;</span>
            </li>
          </nav>

          <div v-else class="center h5 font-mono border-top border-green h-bttm-bar px2 py3">
            <span class="light-green">End of results</span>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="center h5 font-mono px2 py4">
          <span class="light-green">{{ loading ? 'Loading...' : 'No results' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapGetters, mapActions } from 'vuex'
import ActivityItem from '@/components/ActivityItem'
import svgX from '@/components/Icons/SVG-X'
import xss from 'xss'
import axios from 'axios'
import { cleanObj } from '@/utils'

const logUrl = process.env.VUE_APP_API_URL + '/logs'

export default {
  name: 'Activity',
  data () {
    return {
      interval: null,
      filtersVisible: false,
      currentBlock: null,
      loading: false,

      filters: {
        filter: undefined,
        page: undefined,
        asc: undefined
      },

      types: {
        all: 'All',
        Comment_Added: 'Comments',
        CloverName_Changed: 'Clover name changes',
        Clovers_Transfer: 'Clover transfers',
        SimpleCloversMarket_updatePrice: 'Clover price changes',
        'ClubTokenController_Buy,ClubTokenController_Sell': 'Coin activity',
        'CurationMarket_Buy,CurationMarket_Sell': 'Curation Market activity'
      },

      logs: {}
    }
  },
  computed: {
    address () {
      return this.$store.state.account
    },
    activity () {
      if (!this.logs.results) return []
      return this.logs.results
    },
    prevPossible () {
      return this.logs.prevPage
    },
    nextPossible () {
      return this.logs.nextPage
    },
    maxPage () {
      if (!this.logs.allResults) return 0
      return Math.ceil(this.logs.allResults / 24)
    },
    hasResults () {
      return this.logs.results && !!this.logs.results.length
    },
    liveLogs () {
      return this.$store.state.logs
    },
    isFiltered () {
      return !!Object.keys(this.$route.query).length
    },
    currentFilter () {
      let s = this.filters.asc ? 'Oldest' : 'Latest'
      let m = this.types[this.filters.filter] || 'activity'
      return `${s} ${m}`
    },
    showFilters () {
      if (!this.hasResults) return false
      return !!this.filters.filter || this.filters.asc
    },
    filtersColors () {
      return this.showFilters ? 'bg-green white' : 'bg-white green'
    },

    ...mapGetters(['userName'])
  },
  methods: {
    setFilters () {
      this.$store.commit('CLEAR_LOG')
      const { query } = this.$route
      this.filters.filter = query.filter || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading) return
      this.filtersVisible = false
      this.loading = true
      axios.get(logUrl, {
        params: { ...this.filters }
      }).then(({ data }) => {
        this.loading = false
        this.logs = data
      }).catch((err) => {
        this.loading = false
        if (err.response && err.response.data) {
          this.logs = err.response.data
        }
      })
    },
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    addNew () {
      if (this.isFiltered) {
        this.$router.push({ name: 'Activity' })
      } else {
        this.logs.results.unshift(...this.liveLogs)
        this.$store.commit('CLEAR_LOG')
      }
    },
    getBlockNumber () {
      this.checkBlock().then((b) => {
        this.currentBlock = b.toLocaleString()
      })
    },

    ...mapActions(['checkBlock'])
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
        this.$router.push({ name: 'Activity', query: { ...q } })
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
    this.getBlockNumber()
    this.interval = setInterval(() => {
      this.getBlockNumber()
    }, 5000)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  components: { ActivityItem, svgX }
}
</script>
