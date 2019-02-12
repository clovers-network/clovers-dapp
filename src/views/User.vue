<template lang="pug">
  article.green.relative(v-if="user")
    header.sticky.top-header-h.left-0.bg-white.z1.border-bottom.md-py1
      h1.block.m-auto.py2.font-mono.h-header.flex
        span.block.m-auto {{ userName(user) }}
        span.block.m-auto {{ prettyBigNumber(user.balance) }} ♣&#xFE0E;
    section
      clover-list-cards(v-if="clovers.length", :clovers="clovers")
</template>

<script>
import store from '@/store'
import axios from 'axios'
import { mapGetters } from 'vuex'
import CloverListCards from '@/components/CloverList--Cards'
import { prettyBigNumber } from '@/utils'

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
    cloversLink () {
      return process.env.VUE_APP_API_URL + '/users/' + this.user.address + '/clovers'
    },

    ...mapGetters(['userName'])
  },
  methods: {
    prettyBigNumber,

    setFilters () {
      const { query } = this.$route
      this.filters.filter = query.filter || undefined
      this.filters.sort = query.sort || undefined
      this.filters.page = query.page || 1
      this.filters.asc = query.asc || false
    },
    query () {
      if (this.loading || !this.cloversLink) return
      this.filtersVisible = false
      this.loading = true

      this.$store.dispatch('getPagedClovers', {
        url: this.cloversLink,
        filters: this.filters
      }).finally(() => {
        this.loading = false
      })
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
  components: { CloverListCards }
}
</script>
