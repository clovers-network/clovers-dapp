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
        <code>finders fee: {{ board && board.findersFee }} &clubs;</code>
      </p>
      <p class="h2">
        <code>price: {{ price }} &clubs;</code> <div @click='flip()' class='btn bg'>Buy</div>
      </p>
      <p class="h2">
        <code>flips: {{ flippers }} &orarr;</code>
      </p>
      <p class="h2">
        <code>found by: <router-link :to="toFounder" v-html="founder"></router-link></code>
      </p>
      <p class="h2">
        <code>found at block: {{board && board.created}}</code>
      </p>
      <p class="h2">
        <code>currently owned by: <router-link :to="toOwner" v-html="owner"></router-link></code>
      </p>
      <p class="h2">
        <code>last flipped at block: {{board && board.modified}}</code>
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
    methods: {
      flip () {
        this.clover.buyClover(this.boardId)
      }
    },
    computed: {
      board () {
        if (!this.boardId) return {}
        return this.allClovers.find(c => c.board === this.boardId)
      },
      flippers () {
        if (!this.boardId || !this.board) return 0
        return this.board.previousOwners.length - 1
      },
      price () {
        if (!this.boardId || !this.board) return 0
        if (!this.flippers) {
          return this.board.lastPaidAmount.toLocaleString()
        }
        return (this.board.lastPaidAmount * 2).toLocaleString()
      },
      founder () {
        return this.board && this.board.previousOwners && this.board.previousOwners[0]
      },
      toFounder () {
        return '/users/' + this.founder
      },
      owner () {
        return this.board && this.board.previousOwners && this.board.previousOwners[this.board.previousOwners.length - 1]
      },
      toOwner () {
        return '/users/' + this.owner
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
