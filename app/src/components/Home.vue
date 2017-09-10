<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-column intro-screen relative overflow-hidden">
      <div class="center h2">
        <p class="max-width-3 mx-auto">
          <u>Clovers</u> is the first board-game proof-of-work aesthetic cryptocurrency mountain-range pyramid scheme<sup>&trade;</sup>
        </p>
      </div>
      <div class="center my2 relative">
        <div class="h1">
          <clv :board="featured"></clv>
        </div>
        <div>
          <svg-text :movesString="heart"></svg-text>
        </div>
      </div>
    </div>
    <div class="bg-gray white p2 md-p3">
      toolbarz
    </div>

    <div class="p2">
      <div v-if="allClovers.length" class="mt3 px2">
        <span class='btn' v-if="prevPossible" @click="paged--">Previous</span>
        Page {{paged}} of {{pagedTotal}}
        <span class='btn' v-if="nextPossible" @click="paged++">Next</span>
        <ul class="list-reset flex flex-wrap mxn2">
          <li v-for="board in cloversSorted" :key="board.board" class="px2 mb3">
            <clover-grid-item :board="board"></clover-grid-item>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import SvgText from '@/components/TextPath'

  export default {
    name: 'Home',
    data () {
      return {
        heart: 'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',
        newName: null,
        sortBy: null,
        paged: 1,
        limit: 20
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
      featured () {
        this.clover.playGameMovesString(this.heart)
        return this.clover.byteBoardToRowArray()
      },
<<<<<<< HEAD

=======
      cloversSorted () {
        return this.allClovers.sort((a, b) => b.modified - a.modified).slice(this.startSlice, this.endSlice)
      },
>>>>>>> master
      ...mapGetters([
        'balance',
        'clover'
      ])
    },
    components: { SvgText }
  }
</script>

<style>
  .intro-screen {
    box-shadow: 0px 4px 7px 1px rgba(0, 0, 0, .2);

    .clover {
      display: inline-block;
    }

    .text-path {
      bottom: -2.6em;
      left: -2.6em;
      right: -2.6em;
      top: -2.6em;
    }
  }
</style>
