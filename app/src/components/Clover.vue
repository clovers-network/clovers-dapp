<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-column intro-screen relative overflow-hidden">
      <div class="center my3 relative">
        <div class="h1">
          <clv class='no-border' :key="boardId" :moveString="moveString"></clv>
        </div>
      </div>
    </div>
    <div class="p3">
      <p class="h2">
        <code>id: {{ boardId }}</code>
      </p>
      <p class="h2">
        <code >name: <form @submit.prevent="changeName()"><input type="text" placeholder="Unnamed" v-model="name"/></form></code>
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
  import Reversi from '../assets/reversi'
  export default {
    name: 'clover',
    data () {
      return {
        nameNotClicked: true,
        name: '',
        reversi: new Reversi()
      }
    },
    methods: {
      flip () {
        this.clover.flipClover(this.boardId)
      },
      changeName () {
        this.clover.renameClover(this.boardId, this.name).catch((err) => {
          console.log(err)
        })
      }
    },
    watch: {
      board () {
        this.name = this.board.name || ''
      }
    },
    computed: {
      board () {
        return this.boardId && this.allClovers.find(c => c.board === this.boardId)
      },
      moveString () {
        return this.board && this.reversi.byteMovesToStringMoves(this.board.first32Moves, this.board.lastMoves)
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
      boardId () {
        return this.$route.params.board
      },
      boardArray () {
        return this.reversi.byteBoardToRowArray(this.boardId)
      },

      ...mapGetters([
        'clover',
        'allClovers'
      ])
    }
  }
</script>
