<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-column intro-screen relative">
      <div class="center h2">
        <p class="max-width-3 mx-auto">
          <u>Clovers</u> is the first board-game proof-of-work aesthetic cryptocurrency ponzi scheme...
        </p>
      </div>
      <div class="h1 center my2">
        <clv :board="featured"></clv>
      </div>
    </div>
    <div class="bg-gray white p2 md-p3">
      toolbarz
    </div>
    <div class="p2">
      <div class="mt0">
        <button @click.prevent="listClovers()" class="btn btn-primary bg-green">List Clovers</button>
      </div>
      <div v-if="clover.registeredBoards.length" class="mt3 px2">
        <ul class="list-reset flex flex-wrap mxn2">
          <li v-for="board in clover.registeredBoards" :key="board[0]" class="px2 mb3">
            <clv :board="clover.byteBoardToRowArray(board[0])"></clv>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import Clover from '../assets/clovers'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Wallet',
    data () {
      return {
        heart: 'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',
        newName: null,
        clover: new Clover(true)
      }
    },
    mounted () {
      this.clover.listClovers()
    },
    computed: {
      featured () {
        this.clover.playGameMovesString(this.heart)
        return this.clover.byteBoardToRowArray()
      },

      ...mapGetters({
        balance: 'balance'
      })
    },
    methods: {
      listClovers () {
        this.clover.listClovers()
      }
    }
  }
</script>

<style>
  .intro-screen {
    box-shadow: 0px 4px 7px 1px rgba(0, 0, 0, .2);

    .clover {
      display: inline-block;
    }
  }
</style>
