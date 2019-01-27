<template>
  <div>
    <div class="sticky z1 border-bottom green font-mono bg-white" style="top:46px">
      <div class="col-12">
        <div class="relative px2">
          <div class="h-header col-12 flex items-center justify-between">
            <div class="h5 col-3">Block #{{ currentBlock }}</div>
            <div class="col-6 center"><span class="light-green">Page</span> {{ paged }}</div>
            <!-- <span class="h5 block">{{filtersVisible ? 'Close' : feedFilterName}}</span> -->
            <div @click.stop="asc = !asc" class="col-3 align-right pointer">
              <img class="pointer" src="~../assets/icons/sort-arrows.svg" width="20"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="mx-auto bg-white">
        <nav v-if="prevPossible" class="list-reset border-bottom border-green bg-white z1" style="top:93px">
          <li @click="paged--" class="pointer py2 px3 center">
            <span class="h5 green">&larr; Previous page</span>
          </li>
        </nav>

        <ul class="m0 p0 list-reset">
          <li v-for="activity in pagedActivity" :key="activity.id" class="mb1 border-bottom">
            <activity-item :item="activity"/>
          </li>
        </ul>

        <nav v-if="nextPossible" class="list-reset bottom-0 bg-white z1">
          <li @click="paged++" class="pointer py2 px3 center">
            <span class="h5 green">Next page &rarr;</span>
          </li>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState, mapGetters, mapActions } from 'vuex'
import ActivityItem from '@/components/ActivityItem'
import svgX from '@/components/Icons/SVG-X'
import xss from 'xss'

// fetch from global.contracts.Clovers.instance._address
const contractAddress = '0x8A0011ccb1850e18A9D2D4b15bd7F9E9E423c11b'

export default {
  name: 'Activity',
  data () {
    return {
      paged: 1,
      limit: 12,
      asc: false,
      interval: null,
      filtersVisible: false,
      currentBlock: null
    }
  },
  computed: {
    address () {
      return this.$store.state.account
    },
    allActivity () {
      return this.logs.filter((l) => {
        if (l.name === 'Clovers_Transfer') {
          if (l.data._to && l.data._to === contractAddress) return false
        }
        return true
      })
      // return this.logs.map(l => l.name)
      // return this.logs.filter((l) => {
      //   switch (l.name) {
      //     case ('Registered'):
      //       return !this.address || l.data.newOwner === this.address
      //     case ('newUserName'):
      //       return !this.address || l.data.player === this.address
      //     case ('newCloverName'):
      //       return !this.address || l.address === this.address
      //     default:
      //       return false
      //   }
      // })
    },
    sortableClass () {
      return {
        gray: true,
        asc: this.asc,
        desc: !this.asc
      }
    },
    pagedTotal () {
      return Math.floor(this.allActivity.length / this.limit) + (this.allActivity.length % this.limit && 1)
    },
    prevPossible () {
      return this.paged > 1
    },
    nextPossible () {
      return this.paged < this.pagedTotal
    },
    sortedActivity () {
      return this.allActivity.slice(0).sort((a, b) => this.asc ? a.blockNumber - b.blockNumber : b.blockNumber - a.blockNumber)
    },
    startSlice () {
      return (this.paged - 1) * this.limit
    },
    endSlice () {
      return this.paged * this.limit
    },
    pagedActivity () {
      return this.sortedActivity.slice(this.startSlice, this.endSlice)
    },
    feedFilter: {
      get () {
        return this.$store.state.feedFilter
      },
      set (newVal) {
        this.$router.push({name: 'Feed'})
        this.updateFilter(newVal)
        this.hideFilters()
      }
    },
    feedFilterName () {
      switch (this.feedFilter) {
        case 'all': return 'All'
        case 'market': return 'For Sale'
        case 'curationMarket': return 'RFT'
        default: return ''
      }
    },

    ...mapState(['logs', 'allUsers']),
    ...mapGetters(['userName'])
  },
  methods: {
    filter (word) {
      return xss(word)
    },
    getBlockNumber () {
      this.checkBlock().then((b) => {
        this.currentBlock = b
      })
    },

    ...mapActions(['checkBlock'])
  },
  beforeRouteEnter (to, from, next) {
    store.dispatch('getLogs').then(next)
  },
  mounted () {
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

<style lang="css" scoped>
  .small-clover {
    line-height:1px;
    size:1px;
    font-size:5px;
  }
</style>
