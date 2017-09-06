<template>
  <div>
    <div class="bg-gray white p2 md-p3" v-text='address'></div>
    <div class="p2">
      <div v-if="myClovers" class="mt3 px2">
        <ul class="list-reset flex flex-wrap mxn2">
          <li v-for="board in myClovers" :key="board.board" class="px2 mb3">
            <clover-grid-item :board="board"></clover-grid-item>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'

  export default {

    name: 'User',

    data () {
      return {

      }
    },
    watch: {
      allUsers () {
        console.log('all Users changed')
      },
      user () {
        console.log('user changed')
      },
      'user.clovers': function () {
        console.log('users.clovers changed')
      }
    },
    computed: {
      address () {
        return this.$route.params.address
      },
      user () {
        return this.allUsers.find((u) => u.address === this.address)
      },
      myClovers () {
        return this.user && this.user.clovers
        .map((c) => this.allClovers.find((ac) => ac.board === c))
      },
      ...mapGetters([
        'allUsers',
        'allClovers'
      ])
    }
  }
</script>

<style lang="css" scoped>
</style>
