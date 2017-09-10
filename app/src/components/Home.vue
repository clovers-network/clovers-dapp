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
          <clv class='no-border' :moveString="this.heart"></clv>
        </div>
      </div>
    </div>
    <div class="bg-gray white p2 md-p3">
      toolbarz
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Home',
    data () {
      return {
        heart: 'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',
        newName: null
      }
    },
    computed: {
      featured () {
        this.clover.playGameMovesString(this.heart)
        return this.clover.byteBoardToRowArray()
      },

      ...mapGetters([
        'balance',
        'clover'
      ])
    }
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
