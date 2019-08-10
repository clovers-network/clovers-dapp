<template lang="pug">
  .mx3
    more-information(title="?" content="<u>The Activity Log</u> is where you can get an overview of everything that's happening on the site in real time. You'll see activity for when a new Clover is registered, when one is bought or listed for sale, when users buy or sell Clover Coin and when they comment on someones Clover.")

    filters-nav
      //- Filter
      .col-6.sm-col-auto.my1.px1
        .center.h4.select
          select(v-model='filters.filter')
            option(v-for='(val, key) of types' :key='key' :value="key !== 'all' ? key : undefined") {{ val }}
      //- Sort
      .col-6.sm-col-auto.my1.px1
        .center.h4.select
          select(v-model='filters.asc')
            option(:value='false') Newest first
            option(:value='true') Oldest first
      //- Pages
      .col-12.sm-col-auto.my1.px1
        .center.h4.border.rounded.h-select.px2.flex.items-center.justify-between.hover-bg-l-green
          span.pr2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !prevPossible }", @click="back")
            img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
          span {{ filters.page }} of {{ maxPage }}
          span.pl2.pointer.bold.trans-opacity-long(:class="{ 'opacity-30': !nextPossible }", @click="forward")
            img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")

    //- .col-12.my1.rounded.bg-lightest-green.p2.font-mono
      | Block
      span(v-text="` #${currentBlock || ''}`")

    .fade-enter-active(v-if='hasResults', :class="{'opacity-50': loading}")
      .mx-auto.bg-white
        .mxn2
          //- show
          .list-reset.font-mono.center.mb2(v-if='liveLogs.length' style='top:93px')
            span.pl2.pointer.h5(@click.self='addNew') ✨ Show {{ liveLogs.length }} new log(s)
          //- logs
          ul.m0.p0.list-reset
            li.border.border-dashed.rounded.mb2(v-for='log in activity', :key='log.id || log.transactionHash')
              activity-item(:item='log')
          //- btns: next / prev
          nav.list-reset.flex.h5.green.items-center.justify-center.my3.pb4(v-if='(prevPossible || nextPossible) && hasResults')
            li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !prevPossible }", @click="back")
              img(src="../assets/icons/chevron-down.svg", style="transform:rotate(90deg)")
              span.pl1 Previous
            li.pointer.px3.py2.mx2.border.rounded.hover.hover-bg-l-green(:class="{ 'opacity-30': !nextPossible }", @click="forward")
              span.pr1 Next
              img(src="../assets/icons/chevron-down.svg", style="transform:rotate(-90deg)")
          .center.h5.font-mono.h-bttm-bar.px2.py3(v-else)
            span.light-green End of results

    div(v-else)
      .center.h5.font-mono.px2.py4
        span.light-green {{ loading ? &apos;Loading...&apos; : &apos;No results&apos; }}

</template>

<script>
import store from '@/store'
import { mapGetters, mapActions } from 'vuex'
import ActivityItem from '@/components/ActivityItem'
import MoreInformation from '@/components/MoreInformation'
import FiltersNav from '@/components/FiltersNav'
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
        'ClubTokenController_Buy,ClubTokenController_Sell': 'Coin activity'
        // 'CurationMarket_Buy,CurationMarket_Sell': 'Curation Market activity'
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
    back () {
      if (!this.prevPossible) return
      this.filters.page = this.logs.prevPage
    },
    forward () {
      if (!this.nextPossible) return
      this.filters.page = this.logs.nextPage
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
  components: { ActivityItem, svgX, MoreInformation, FiltersNav }
}
</script>
