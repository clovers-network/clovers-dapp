<template>
  <div class="md-pb3">
    <!-- <div :class="{'opacity-50': loading}" class="fade-enter-active">
      <clover-list-cards :clovers="clovers"/>
    </div> -->
    <ul :class="{'opacity-50': loading}" class="list-reset md-flex flex-wrap justify-around items-center m0 md-px1 pb4">
      <li v-for="clover in clovers" class="md-col-6 md-px1" :key="clover.board">
        <router-link :to="cloverLink(clover)" class="block border-bottom green">
          <clover-item-row :clover="clover" :hideOwner="true" />
        </router-link>
      </li>
      <li class="p2 center" v-if="!clovers.length">{{ loading ? 'Loading...' : 'No clovers to show'}}</li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { cloverLink } from '@/utils'
import CloverListCards from '@/components/CloverList--Cards'
import CloverItemRow from '@/components/CloverItem--Row'

export default {
  name: 'MyClovers',
  head: {
    title: { inner: 'My Clovers' },
    meta: [{ name: 'description', content: 'A list of the Clovers you own', id: 'meta-desc' }]
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
    results () {
      return this.$store.state.pagedClovers
    },
    clovers () {
      if (!this.results.results) return []
      return this.results.results
    },
    cloversLink () {
      if (!this.account) return

      return process.env.VUE_APP_API_URL + '/users/' + this.account + '/clovers'
    },

    ...mapState(['account'])
  },
  methods: {
    cloverLink,

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
  watch: {
    account (newVal) {
      if (newVal) {
        this.setFilters()
        this.query()
      }
    }
  },
  components: { CloverListCards, CloverItemRow }
}
</script>
