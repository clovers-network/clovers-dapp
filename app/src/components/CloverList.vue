<template>
  <div class="p2">
    <div v-if="allClovers.length" class="mt3 px2">
      <div>
      <span 
      @click='clickSort(i)'
      :class="sortableClass(i)"
      class='btn btn-outline mb1 green' 
      v-for='sort, i in sortable'>{{sort}}</span>
      </div>
      <div>
        <span 
        class='btn btn-outline mb1 orange' 
        @click="limit = amount" 
        v-for="amount in limits" 
        :class="{'bg-red': limit === amount}"
        v-html="amount"></span>
      </div>
      <div>
        <button 
        class='btn btn-outline mb1 blue' 
        :disabled='!prevPossible' 
        @click="paged--">Previous</button><button 
        class='btn btn-outline mb1 blue' 
        :disabled='!nextPossible' 
        @click="paged++">Next</button>
      </div>
      <div>
        <span>Page {{paged}} of {{pagedTotal}}</span>
      </div>
      <ul class="list-reset flex flex-wrap mxn2">
        <li v-for="board in cloversSorted" :key="board.board" class="px2 mb3">
          <clover-grid-item :key="board.board" :board="board"></clover-grid-item>
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
        paged: 1,
        limit: 10,
        limits: [5, 10, 20, 50, 100],
        asc: true,
        sortableIndex: 0,
        sortable: ['Date Found', 'Date Flipped', 'Current Price', 'Times Flipped']
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
        return this.allClovers.sort((a, b) => {
          switch (this.sortableIndex) {
            case (0):
              return this.asc ? b.created - a.created : a.created - b.created
            case (1):
              return this.asc ? b.modified - a.modified : a.modified - b.modified
            case (2):
              return this.asc ? this.currPrice(b) - this.currPrice(a) : this.currPrice(a) - this.currPrice(b)
            case (3):
              return this.asc ? b.previousOwners.length - a.previousOwners.length : a.previousOwners.length - b.previousOwners.length
          }
        }).slice(this.startSlice, this.endSlice)
      },
      ...mapGetters([
        'allClovers'
      ])
    },
    methods: {
      currPrice (c) {
        return c.previousOwners.length === 1 ? c.lastPaidAmount : (c.lastPaidAmount * 2)
      },
      sortableClass (i) {
        if (i !== this.sortableIndex) return
        return {
          'bg-blue': this.asc,
          'bg-red': !this.asc,
          asc: this.asc,
          desc: !this.asc
        }
      },
      clickSort (i) {
        if (i !== this.sortableIndex) {
          this.sortableIndex = i
        } else {
          this.asc = !this.asc
        }
      }
    }
  }
</script>

<style lang="css" scoped>
</style>
