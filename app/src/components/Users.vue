<template>
  <div>
  <ul>
  <li v-for="user in allUsers">
  <router-link :to="'/users/' + user.address">
    {{user.address}} — {{filter(user.name)}} — {{uniqued(user.clovers).length}} ✤ Flipped and Claimed
  </router-link>
  </li>
  </ul>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import xss from 'xss'
  export default {

    name: 'Users',

    data () {
      return {

      }
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
      ...mapGetters([
        'allUsers'
      ])
    }
  }
</script>

<style lang="css" scoped>
</style>
