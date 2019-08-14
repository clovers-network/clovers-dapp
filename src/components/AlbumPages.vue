<template lang="pug">
  section
    //- pagination
    //- filters-nav(:page="filters.page", :maxPages="maxPage", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
      //- filters / sort ?
    section
      //- (list)
      .fade-enter-active(v-if="'demo' === 'demo' || hasResults", :class="{'opacity-50':loading}")
        album-list-cards(v-if="albums.length", :albums="albums")
      //- (empty)
      div(v-else)
        p.center.p2.m0 Nothing to show

      //- page-nav(:hasResults="hasResults", :canPrev="prevPossible", :canNext="nextPossible", @prev="back", @next="forward")
</template>

<script>
import AlbumListCards from '@/components/AlbumList--Cards'
// import FiltersNav from '@/components/FiltersNav'
// import PageNav from '@/components/PageNav'
// import { cleanObj } from '@/utils'
export default {
  name: 'AlbumPages',
  props: {
    apiPath: { type: String, default: '/albums' }
  },
  data () {
    return {
      loading: false
      // filters: {
      //   sort: undefined,
      //   filter: undefined,
      //   page: undefined,
      //   asc: undefined
      // }
    }
  },
  computed: {
    albums () {
      // demo
      return this.$store.state.albums

      // if (!this.results.results) return []
      // return this.results.results
    },
    // results () {
    //   return this.$store.state.pagedAlbums
    // },
    // hasResults () {
    //   return this.results.results && !!this.results.results.length
    // },
    // prevPossible () {
    //   return this.results.prevPage
    // },
    // nextPossible () {
    //   return this.results.nextPage
    // },
    // maxPage () {
    //   if (!this.results.allResults) return 0
    //   return Math.ceil(this.results.allResults / 12)
    // },
    apiUrl () {
      return `${process.env.VUE_APP_API_URL}/${this.apiPath}` // users/${this.user.address}/clovers`
    }
  },
  methods: {
    // query () {
    //   if (this.loading || !this.apiUrl) return
    //   this.loading = true

    //   this.$store.dispatch('getPagedAlbums', {
    //     url: this.apiUrl,
    //     // filters: this.filters
    //   }).then(() => {
    //     this.loading = false
    //   }).catch((error) => {
    //     console.error(error)
    //     this.loading = false
    //   })
    // },
    // back () {
    //   if (!this.prevPossible) return
    //   this.filters.page = this.results.prevPage
    // },
    // forward () {
    //   if (!this.nextPossible) return
    //   this.filters.page = this.results.nextPage
    // }
  },
  mounted () {
    // this.query()
  },
  watch: {
    // $route () {
    //   this.query()
    // }
  },
  components: { AlbumListCards }
}
</script>
