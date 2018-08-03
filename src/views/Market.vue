<template>
  <div class="p2 mt4">
    <h1>The Market 💹</h1>
    <nav>
      <li v-if="prevPage">
        <router-link :to="prevPage">Previous page</router-link>
      </li>
      <li v-if="nextPage">
        <router-link :to="nextPage">Next page</router-link>
      </li>
    </nav>
<<<<<<< HEAD
    <ul>
      <li v-for="(clover, key) in clovers" :key="key">
        {{ clover.board }}
=======
    <ul class="list-reset flex flex-wrap">
      <li v-for="clover in clovers" class="pr4 pb4">
        <img :src="cloverImage(clover)"/>
>>>>>>> dev
      </li>
    </ul>
  </div>
</template>

<script>
<<<<<<< HEAD
import store from '@/store'
import { mapGetters } from 'vuex'
const pageSize = 12
=======
  import store from '@/store'
  import { mapGetters } from 'vuex'
  import { cloverImage } from '@/utils'
  const pageSize = 12
>>>>>>> dev

export default {
  name: 'Market',
  computed: {
    page () {
      return Number(this.$route.params.page) || 1
    },
<<<<<<< HEAD
    clovers () {
      const start = (this.page - 1) * pageSize
      const end = this.page * pageSize
      return this.$store.state.allClovers.slice(start, end)
=======
    methods: {
      cloverImage
    },
    watch: {
      page (newVal, oldVal) {
        if (Number(newVal) > Number(oldVal)) {
          store.dispatch('getClovers', newVal)
        }
      }
>>>>>>> dev
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

    ...mapGetters(['newCloversCount'])
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
