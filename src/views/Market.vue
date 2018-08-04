<template>
  <div class="p2 mt4">
    <nav>
      <li v-if="prevPage">
        <router-link :to="prevPage">Previous page</router-link>
      </li>
      <li v-if="nextPage">
        <router-link :to="nextPage">Next page</router-link>
      </li>
    </nav>
    <ul class="list-reset flex flex-wrap justify-around items-center">
      <li v-for="(clover, i) in clovers" :key="i" class="pr4 pb4">
        <img :src="cloverImage(clover)"/>
      </li>
    </ul>
    <div v-if="newCloversCount" class="fixed left-0 right-0 bottom-0 bg-green white p2">
      <span class="mr2">{{ newCloversCount }} new {{ pluralize('Clover', newCloversCount) }}</span>
      <a @click="showNewClovers" class="pointer">Show</a>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState, mapGetters, mapMutations } from 'vuex'
import { cloverImage, pluralize } from '@/utils'

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
    ...mapGetters(['newCloversCount'])
  },
  methods: {
    cloverImage,
    pluralize,

    showNewClovers () {
      this.$router.push('/market')
      this.showNew()
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
