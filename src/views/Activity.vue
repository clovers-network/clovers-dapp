<template>
  <div>
    <div :class="{'opacity-50': loading}" class="fade-enter-active">

      <div @click="toggleFilters" class="sticky z1 border-bottom green font-mono bg-white" style="top:46px">
        <div :class="{'bg-green white': filtersVisible}" class="col-12 transition-all pointer">
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
              <div class="col-3 align-right pointer">
                <img v-if="filtersVisible" src="~../assets/icons/chevron-up-white.svg" width="14"/>
                <img v-else src="~../assets/icons/chevron-down.svg" width="14"/>
              </div>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div v-if="filtersVisible" @click.stop class="col-12 bg-green white absolute">
            <div class="sm-flex">
              <div class="sm-col-6 p2 flex items-center border-top border-top-dotted">
                <div>Show</div>
                <div class="center h3 select">
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

      <div>
        <div class="mx-auto bg-white">
          <nav v-if="prevPossible" class="list-reset font-mono" style="top:93px">
            <li @click="filters.page--" class="pointer py2 px3 center">
              <span class="h5">&larr; Previous page</span>
              <span v-if="liveLogs.length" @click.self="addNew" class="pl2 pointer h5">Show {{ liveLogs.length }} new log(s)</span>
            </li>
          </nav>

          <div v-else class="center p2 h5 font-mono">
            <span class="light-green">{{ currentFilter }}</span>
            <span v-if="liveLogs.length" @click="addNew" class="pl2 pointer h5">Show {{ liveLogs.length }} new log(s)</span>
          </div>

          <ul class="m0 p0 list-reset">
            <li v-for="log in activity" :key="log.id || log.transactionHash" class="border-top">
              <activity-item :item="log"/>
            </li>
          </ul>

          <nav v-if="nextPossible" class="list-reset border-top border-green">
            <li @click="filters.page++" class="pointer h-bttm-bar px2 py3 center">
              <span class="h5">Next page &rarr;</span>
            </li>
          </nav>

          <div v-else class="center h5 font-mono border-top border-green h-bttm-bar px2 py3">
            <span class="light-green">End of results</span>
          </div>
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

// fetch from global.contracts.Clovers.instance._address
const contractAddress = '0x8A0011ccb1850e18A9D2D4b15bd7F9E9E423c11b'
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
        'ClubTokenController_Buy,ClubTokenController_Sell': 'Club Token activity',
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
        clean(q)
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

function clean (o) {
  for (let n in o) {
    if ((o[n] === null || o[n] === undefined) ||
        typeof o[n] === 'number' && o[n] === 1 ||
        typeof o[n] === 'boolean' && !o[n]) {
      delete o[n]
    }
  }
}
</script>
