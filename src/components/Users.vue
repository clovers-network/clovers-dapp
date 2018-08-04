<template>
  <div class="my4">
    <ul class="max-width-3 mx-auto">
      <li
        v-for="(user, i) in users"
        :key="i">
        <router-link :to="'/users/' + user.address">
          {{ user.address }} — {{ filter(user.name) }} — {{ uniqued(user.clovers).length }} ✤ Flipped and Claimed
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import xss from 'xss'
export default {
  name: 'Users',

  data () {
    return {}
  },
  methods: {
    filter (text) {
      return xss(text)
    },
    uniqued (arr) {
      return arr.filter((value, index, self) => {
        return self.indexOf(value) === index
      })
    }
  },
  computed: {
    ...mapState(['users'])
  }
}
</script>

<style lang="css" scoped>
</style>
