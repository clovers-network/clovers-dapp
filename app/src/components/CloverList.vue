<template>
  <div class="p2">
    <div v-if="allClovers.length" class="mt2 px2">
      <div class="hide">
        <form
          class="border-bottom inline-block my1"
          @submit.prevent="search">
          <input class="input" v-model="search" placeholder="search">
        </form>
      </div>
      <div class="center mb3">
        <span
        @click="clickSort(i)"
        :class="sortableClass(i)"
        class="inline-block mx2 pointer no-select"
        v-html="sort"
        v-for="sort, i in sortable"></span>
      </div>
      
      <ul class="list-reset flex flex-wrap mxn2 center justify-center">
        <li v-for="board in cloversSliced" :key="board.board" class="px2 mb3">
          <clover-grid-item :by-flip="sortableIndex == 1 || sortableIndex == 3" :key="board.board" :board="board"></clover-grid-item>
        </li>
      </ul>
      <div class="hide">
        <span
        class="btn btn-outline mb1 orange"
        @click="limit = amount"
        v-for="amount in limits"
        :class="{'bg-red': limit === amount}"
        v-html="amount"></span>
      </div>
      <div class="center" :class="{hide: pagedTotal === 1}">
        <button
        class="btn btn-outline mb1 blue"
        :disabled="!prevPossible"
        @click="paged--">←</button>
        <button
        class="btn btn-outline mb1 blue"
        :disabled="!nextPossible"
        @click="paged++">→</button>
      </div>
      <div class="center"  :class="{hide: pagedTotal === 1}">
        <span>{{paged}} / {{pagedTotal}}</span>
      </div>
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
        limit: 50,
        limits: [5, 10, 20, 50, 100],
        asc: true,
        sortableIndex: 0,
        sortable: ['Date Found', 'Date Flipped', 'Current Price', 'Times Flipped'],
        search: null
      }
    },
    watch: {
      limit () {
        this.paged = 1
      }
    },
    computed: {
      pagedTotal () {
        return Math.floor(this.cloversSorted.length / this.limit) + (this.cloversSorted.length % this.limit && 1)
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
      cloversSliced () {
        return this.cloversSorted.slice(this.startSlice, this.endSlice)
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
        }).filter((c) => {
          if (!this.search) return c
          return c.previousOwners.slice(-1).filter((p) => {
            return (p.name && p.name.search(this.search) > -1) || p.address.search(this.search) > -1
          }).length || // owner
          c.previousOwners.slice(0, 1).filter((p) => {
            return (p.name && p.name.search(this.search) > -1) || p.address.search(this.search) > -1
          }).length || // founder
          c.name && c.name.search(this.search) > -1 || // board name
          c.first32Moves.search(this.search) > -1 || // moves
          c.first32Moves.search(this.search) > -1 || // moves
          c.lastMoves.search(this.search) > -1 || // moves
          c.board.search(this.search) > -1 // board
        })
      },
      ...mapGetters([
        'allClovers',
        'usernames',
        'clovernames'
      ])
    },
    methods: {
      currPrice (c) {
        return c.previousOwners.length === 1 ? c.lastPaidAmount : (c.lastPaidAmount * 2)
      },
      sortableClass (i) {
        if (i !== this.sortableIndex) return 'silver'
        return {
          gray: true,
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

<style>
  @import '../style/settings';

  .asc:after {
    color: var(--green);
    content: '\002193';
    padding-left: .3em;
  }

  .desc:after {
    color: var(--green);
    content: '\002191';
    padding-left: .3em;
  }
</style>
