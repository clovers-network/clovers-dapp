<template>
  <div>
    <div class="sticky border-bottom green flex font-mono bg-white" style="top:46px">
      <div class="border-right p1 center col-6">
        <span class="h3">Filter</span>
      </div>
      <div class="p1 center col-6">
        <span class="h3">Search</span>
      </div>
    </div>

    <nav v-if="prevPage" class="list-reset border-bottom border-green">
      <li class="py2 px3 center">
        <router-link :to="prevPage" class="h5 green">&larr; View previous</router-link>
      </li>
    </nav>

    <ul class="list-reset md-flex flex-wrap justify-around items-center m0">
      <li v-for="(clover, i) in clovers" :key="i" class="md-col6">
        <div is="router-link" tag="div" :to="cloverLink(clover)" class="flex py2 border-bottom green">
          <div class="col-3 center">
            <img :src="cloverImage(clover, 64)" width="64" height="64"/>
          </div>

          <template v-if="inCurationMarket(clover)">
            <div class="col-4 flex flex-column justify-center pr2">
              <p class="h7 m0">Market Cap &clubs;</p>
              <p class="h4 m0 truncate">0</p>
            </div>
            <div class="col-3 flex flex-column justify-center pr2">
              <p class="h7 m0">&clubs; / Share</p>
              <p class="h4 m0 truncate">0</p>
            </div>
          </template>

          <template v-else>
            <div class="col-4 flex flex-column justify-center pr2">
              <p class="h7 m0">Name</p>
              <p class="h4 m0 truncate">{{ clover.name }}</p>
            </div>
            <div class="col-3 flex flex-column justify-center pr2">
              <p class="h7 m0">Cost &clubs;</p>
              <p v-if="forSale(clover)" class="h4 m0">{{ cloverPrice(clover) }}</p>
              <p class="h4 m0 red">🛇</p>
            </div>
          </template>

          <div class="col-2 center flex flex-column justify-center">
            <span class="h1 m0">&rarr;</span>
          </div>
        </div>
      </li>
    </ul>

    <nav v-if="nextPage" class="list-reset">
      <li class="py2 px3 center">
        <router-link :to="nextPage" class="h5 green">View next &rarr;</router-link>
      </li>
    </nav>

    <div v-if="newCloversCount" class="sticky bottom-0 bg-green white p2 center">
      <a @click="showNewClovers" class="pointer">Show {{ newCloversCount }} new {{ pluralize('Clover', newCloversCount) }} ✨</a>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState, mapGetters, mapMutations } from 'vuex'
import { cloverLink, cloverImage, pluralize } from '@/utils'

const pageSize = 12

export default {
  name: 'Market',
  computed: {
    page () {
      return Number(this.$route.params.page) || 1
    },
    clovers () {
      const start = (this.page - 1) * pageSize
      const end = this.page * pageSize
      return this.$store.state.allClovers.slice(start, end)
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

    ...mapState(['newClovers']),
    ...mapGetters(['newCloversCount', 'curationMarketAddress'])
  },
  methods: {
    cloverLink,
    cloverImage,
    pluralize,

    showNewClovers () {
      this.$router.push('/market')
      this.showNew()
    },
    cloverPrice ({ price }) {
      return price.toFormat(0)
    },
    forSale ({ price }) {
      return price.gt(0)
    },
    inCurationMarket ({ owner }) {
      return owner === this.curationMarketAddress
    },

    ...mapMutations({
      showNew: 'SHOW_NEW_CLOVERS'
    })
  },
  watch: {
    page (newVal, oldVal) {
      if (Number(newVal) > Number(oldVal)) {
        store.dispatch('getClovers', newVal)
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    let { page } = to.params
    return store.dispatch('getClovers', page).then(() => {
      next()
    })
  },
  mounted () {
    if (!this.clovers.length) {
      let lastPage = Math.ceil(this.allLoadedCloverCount / 12)
      this.$router.replace(`/market/page/${lastPage}`)
    }
  }
}
</script>
