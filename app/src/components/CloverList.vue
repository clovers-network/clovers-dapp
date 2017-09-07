<template>
  <div class="p2">
    <div v-if="allClovers.length" class="mt3 px2">
      <div>
        <span 
        @click="limit = amount" 
        v-for="amount in limits" 
        class='btn btn-outline mb1 orange' 
        :class="{'bg-red': limit === amount}"
        v-html="amount"></span>
      </div>
      <div>
        <button class='btn btn-outline mb1 blue' :disabled='!prevPossible' @click="paged--">Previous</button>
        <button class='btn btn-outline mb1 blue' :disabled='!nextPossible' @click="paged++">Next</button>
      </div>
      <div>
        <span>Page {{paged}} of {{pagedTotal}}</span>
      </div>
      <ul class="list-reset flex flex-wrap mxn2">
        <li v-for="board in cloversSorted" :key="board.board" class="px2 mb3">
          <clover-grid-item :board="board"></clover-grid-item>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {

    name: 'CloverList',

    data () {
      return {
        sortBy: null,
        paged: 1,
        limit: 10,
        limits: [5, 10, 20, 50, 100]
      }
    },
    watch: {
      limit () {
        this.paged = 1
      }
    },
    computed: {
      pagedTotal () {
        return Math.floor(this.allClovers.length / this.limit) + (this.allClovers.length % this.limit && 1)
      },
      prevPossible () {
        return this.paged > 1
      },
      nextPossible () {
        return this.paged < this.pagedTotal
      },
      startSlice () {
        return this.limit * (this.paged - 1)
      },
      endSlice () {
        return this.limit * this.paged
      },
      cloversSorted () {
        return this.allClovers.sort((a, b) => b.modified - a.modified).slice(this.startSlice, this.endSlice)
      },
      ...mapGetters([
        'allClovers'
      ])
    }
  }
</script>

<style lang="css" scoped>
</style>
