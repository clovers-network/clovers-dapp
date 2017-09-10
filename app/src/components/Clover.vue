<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-wrap intro-screen relative overflow-hidden items-center justify-center">
      <div class="center my3 px4 relative order-1">
        <div class="h1">
          <clv class="no-border" :key="boardId" :byteBoard="reversi.byteBoard" :moveString="moveString"></clv>
        </div>
        <symmetry :board="reversi"></symmetry>
      </div>
      <div class="order-0 md-right-align col-6 sm-col-3">

        <p class="h2">
          <form v-if='mine' class='inline-block border-bottom' @submit.prevent="changeName()"><input class='input big' type="text" placeholder="Name" v-model="name"/></form>
          <span v-else>{{name}}</span>
        </p>
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
            <router-link :to="'/users/' + founderAddress" v-html="founderName" class="white"></router-link></code>
          </p>
        </div>
        <div>
          Original mining reward
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
            <span v-html="'Buy it from ' + ownerName"></span>
            <span class="pl2 sending" v-if="flipping">✨</span>
          </a>
        </template>
      </div>
    </div>
<!--       <p class="h2 center">
        <code>moves: <div v-for="chunk in visibleMoveString">{{chunk}}</div></code>
      </p> -->
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import moment from 'moment'
  import Reversi from '@/assets/reversi'
  import Symmetry from '@/components/Symmetry'

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
        this.addMessage({
          msg: 'Updating Name',
          type: 'progress'
        }).then((msgId) => {
          this.clover.renameClover(this.boardId, this.name).then(() => {
            this.selfDestructMsg({
              msg: 'Updated name to ' + this.name,
              type: 'success',
              link: '/clovers/' + this.boardId
            })
            this.removeMessage(msgId)
          }).catch((err) => {
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: err,
              type: 'error'
            })
            console.log(err)
          })
        })
      },
      init (byteBoard) {
        if (!this.board) return
        this.name = this.board.name
        this.reversi.byteBoard = byteBoard
        this.reversi.byteFirst32Moves = this.board.first32Moves
        this.reversi.byteLastMoves = this.board.lastMoves
        this.reversi.playGameByteMoves()
        this.reversi.byteBoardPopulateBoard()
        this.reversi.isSymmetrical()
      },

      ...mapActions([
        'addMessage',
        'selfDestructMsg'
      ]),

      ...mapMutations({
        'removeMessage': 'REMOVE_MSG'
      })
    },
    watch: {
      board () {
        this.init(this.$route.params.board)
      }
    },
    computed: {
      mine () {
        return this.board && this.ownerAddress === this.account
      },
      board () {
        return this.boardId && this.allClovers.find(c => c.board === this.boardId)
      },
      visibleMoveString () {
        if (!this.moveString) return
        let arr = this.moveString.match(/.{1,2}/g)
        arr.splice(27, 0, '  ')
        arr.splice(27, 0, '  ')
        arr.splice(35, 0, '  ')
        arr.splice(35, 0, '  ')
        return arr.join('').match(/.{1,16}/g)
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
      founderName () {
        return this.founder && (this.founder.name.length > 21 ? this.founder.name.slice(0, 21) + '&hellip;' : this.founder.name)
      },
      founderAddress () {
        return this.founder && this.founder.address
      },
      owner () {
        return this.board && this.board.previousOwners && this.board.previousOwners[this.board.previousOwners.length - 1]
      },
      ownerName () {
        return this.owner && (this.owner.name.length > 7 ? this.owner.name.slice(0, 7) + '&hellip;' : this.owner.name)
      },
      ownerAddress () {
        return this.owner && this.owner.address
      },
      boardId () {
        return this.$route.params.board
      },
      boardArray () {
        return this.reversi.byteBoardToRowArray(this.boardId)
      },
      created () {
        return this.board && moment(this.board.created * 1000).format('MMMM Do YYYY, h:mm:ss a')
      },
      modified () {
        return this.board && moment(this.board.modified * 1000).format('MMMM Do YYYY, h:mm:ss a')
      },
      currentOwner () {
        return this.account === this.owner.address
      },
      findersFee () {
        return this.board && parseInt(this.board.findersFee).toLocaleString()
      },

      ...mapGetters([
        'account',
        'clover',
        'usernames',
        'allClovers',
        'account'
      ])
    },
    mounted () {
      const { board } = this.$route.params
      this.init(board)
    },
    components: { Symmetry }
  }
</script>
