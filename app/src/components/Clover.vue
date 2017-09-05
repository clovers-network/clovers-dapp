<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-column intro-screen relative overflow-hidden">
      <div class="center my3 relative">
        <div class="h1">
          <clv :board="boardArray"></clv>
        </div>
        <div>
          <!-- <svg-text :movesString="heart"></svg-text> -->
        </div>
      </div>
    </div>
    <div class="p3">
      <p class="h2">
        <code>id: {{ boardId }}</code>
      </p>
      <p class="h2">
        <code>price: {{ price }} &clubs;</code>
      </p>
      <p class="h2">
        <code>flips: {{ flippers }} &orarr;</code>
      </p>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'clover',
    data () {
      return {
        boardId: null,
        boardArray: []
      }
    },
    computed: {
      board () {
        if (!this.boardId) return {}
        return this.allClovers.find(c => c.board === this.boardId)
      },
      flippers () {
        return this.board.previousOwners.length - 1
      },
      price () {
        if (!this.flippers) {
          return this.board.lastPaidAmount.toLocaleString()
        }
        return (this.board.lastPaidAmount * 2).toLocaleString()
      },

      ...mapGetters([
        'clover',
        'allClovers'
      ])
    },
    mounted () {
      const { board } = this.$route.params
      this.boardId = board
      this.boardArray = this.clover.byteBoardToRowArray(board)
    }
  }
</script>
