<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-wrap intro-screen relative overflow-hidden items-center justify-center">
      <div class="center my3 px4 relative order-1">
        <div class="h1">
          <clv class="no-border" :key="boardId" :byteBoard="reversi.byteBoard" :movesString="moveString"></clv>
        </div>
        <div v-if="moveString">
          <svg-text :moveString="moveString"></svg-text>
        </div>
        <symmetry :board="reversi"></symmetry>
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
      <div class="col-12 order-3 center mt4 mb2">
        <template v-if="currentOwner">
          <p class="m0 px2 py1 border inline-block">It's yours 💯</p>
        </template>
        <template v-else>
          <a @click="flip" class="m0 px2 py1 border inline-block pointer white">
            Buy it from {{ founderName }}
            <span class="pl2 sending" v-if="flipping">✨</span>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import Reversi from '@/assets/reversi'
  import SvgText from '@/components/TextPath'
  import Symmetry from '@/components/Symmetry'
  import { mapGetters } from 'vuex'

  export default {
    name: 'clover',
    data () {
      return {
        nameNotClicked: true,
        name: '',
        reversi: new Reversi(),
        flipping: false
      }
    },
    methods: {
      test () {
        this.clover.showGame2(this.board.first32Moves, this.board.lastMoves).then((res) => {
          console.log(res)
        }).catch((error) => {
          console.log('ERROR: ', error)
        })
      },
      flip () {
        this.flipping = true
        this.clover.buyClover(this.boardId).then((res) => {
          this.flipping = false
          console.log(res)
        }).catch((err) => {
          this.flipping = false
          console.log(err.toString())
        })
      },
      changeName () {
        this.clover.renameClover(this.boardId, this.name).catch((err) => {
          console.log(err)
        })
      },
      init (byteBoard) {
        if (!this.board) return
        this.reversi.byteBoard = byteBoard
        this.reversi.byteFirst32Moves = this.board.first32Moves
        this.reversi.byteLastMoves = this.board.lastMoves
        this.reversi.playGameByteMoves()
        this.reversi.byteBoardPopulateBoard()
        this.reversi.isSymmetrical()
      }
    },
    watch: {
      board () {
        this.name = this.board.name || ''
        this.init(this.$route.params.board)
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
      founderName () {
        return this.founder && this.founder.substring(0, 8)
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
      this.init(board)
    },
    components: { SvgText, Symmetry }
  }
</script>
