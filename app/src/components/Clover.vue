<template>
  <div>
    <div class="bg-green white p2 md-p3 flex flex-column intro-screen relative overflow-hidden">
      <div class="center my3 relative">
        <div class="h1">
          <clv class='no-border' :key="boardId" :byteBoard="boardId" :moveString="moveString"></clv>
        </div>
      </div>
    </div>
    <div class="p3">
      <p class="h2">
        <form v-if='mine' class='inline-block border-bottom' @submit.prevent="changeName()"><input class='input big' type="text" placeholder="Name" v-model="name"/></form>
        <span v-else>{{name}}</span>
      </p>
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
        <code>found by: <router-link :to="'/users/' + founderAddress" v-html="founderName"></router-link></code>
      </p>
      <p class="h2">
        <code>found: {{created}}</code>
      </p>
      <p class="h2">
        <code>currently owned by: <router-link :to="'/users/' + ownerAddress" v-html="ownerName"></router-link></code>
      </p>
      <p class="h2">
        <code>last flipped: {{modified}}</code>
      </p>
      <p class="h2">
        <code>moves: <div v-for="chunk in visibleMoveString">{{chunk}}</div></code>
      </p>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import Reversi from '../assets/reversi'
  import moment from 'moment'
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
      test () {
        this.clover.showGame2(this.board.first32Moves, this.board.lastMoves).then((res) => {
          console.log(res)
        }).catch((error) => {
          console.log('ERROR: ', error)
        })
      },
      flip () {
        this.clover.flipClover(this.boardId)
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

      ...mapActions([
        'addMessage',
        'selfDestructMsg'
      ]),

      ...mapMutations({
        'removeMessage': 'REMOVE_MSG'
      })
    },
    mounted () {
      this.name = this.board && this.board.name || null
    },
    watch: {
      board () {
        this.name = this.board && this.board.name || null
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
        return this.founder && this.founder.name
      },
      founderAddress () {
        return this.founder && this.founder.address
      },
      owner () {
        return this.board && this.board.previousOwners && this.board.previousOwners[this.board.previousOwners.length - 1]
      },
      ownerName () {
        return this.owner && this.owner.name
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

      ...mapGetters([
        'account',
        'clover',
        'usernames',
        'allClovers'
      ])
    }
  }
</script>
