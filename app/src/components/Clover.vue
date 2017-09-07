<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-wrap intro-screen relative overflow-hidden items-center justify-center">
      <div class="center my3 px4 relative order-1">
        <div class="h1">
          <clv :board="boardArray"></clv>
        </div>
        <!-- <div>
          <svg-text :movesString="heart"></svg-text>
        </div> -->
      </div>
      <div class="order-0 md-right-align col-6 sm-col-3">
        <div>
          Flips
          <p class="h2">
            {{ flippers }} &orarr;
          </p>
        </div>
        <div>
          Current price
          <p class="h2">
            {{ price }} &clubs;
          </p>
        </div>
      </div>
      <div class="order-2 col-6 sm-col-3">
        <div>
          Discovered by
          <p class="h2">
            <router-link :to="toFounder" v-text="founderName" class="white"></router-link></code>
          </p>
        </div>
        <div>
          Original finders fee
          <p class="h2">
            {{ findersFee }} &clubs;
          </p>
        </div>
      </div>
      <div class="col-12 order-3 center">
        <template v-if="currentOwner">
          <p class="m0 px2 py1 border inline-block">you own it</p>
        </template>
        <template v-else>
          <a @click="flip" class="m0 px2 py1 border inline-block pointer white">buy it from {{ founderName }}</a>
        </template>
      </div>
    </div>
    <!-- <div class="p3">
      <p class="h2">
        <code>id: {{ boardId }}</code>
      </p>
      <p class="h2">
        <code>finders fee: {{ board && board.findersFee }} &clubs;</code>
      </p>
      <p class="h2">
        <code>price: </code> <div @click="flip()" class='btn bg'>Buy</div>
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
    </div> -->
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
      founderName () {
        return this.founder && this.founder.substring(0, 8)
      },
      owner () {
        return this.board && this.board.previousOwners && this.board.previousOwners[this.board.previousOwners.length - 1]
      },
      toOwner () {
        return '/users/' + this.owner
      },
      currentOwner () {
        return this.account === this.owner
      },
      findersFee () {
        return this.board && parseInt(this.board.findersFee).toLocaleString()
      },

      ...mapGetters([
        'clover',
        'allClovers',
        'account'
      ])
    },
    mounted () {
      const { board } = this.$route.params
      this.boardId = board
      this.boardArray = this.clover.byteBoardToRowArray(board)
    },
    beforeRouteUpdate (to, from, next) {
      const { board } = to.params
      this.boardId = board
      this.boardArray = this.clover.byteBoardToRowArray(board)
      next()
    }
  }
</script>
