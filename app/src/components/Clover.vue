<template>
  <div>
    <div class="bg-green white p2 md-p3 intro-screen relative overflow-hidden">
      <div class="flex flex-wrap items-center justify-center">
        <div class="center my3 px4 relative order-1">
          <div class="h1">
            <clv class="no-border" :key="boardId" :byteBoard="boardId" :moveString="moveString"></clv>
          </div>
          <symmetry :board="reversi"></symmetry>
        </div>
        <div class="order-0 md-right-align col-6 sm-col-3">
          <p class="h2">
            <form v-if='currentOwner' class='inline-block border-bottom' @submit.prevent="changeName()">
              <input class='input big align-right white' type="text" placeholder="Name" v-model="name"/></form>
            <span v-else class="h1" v-html="name"></span>
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
          <template v-else-if="board">
            <a @click="flip" class="m0 px2 py1 border inline-block pointer white">
              <span  v-html="'Buy it from ' + ownerName"></span>
              <span class="pl2 sending" v-if="flipping">✨</span>
            </a>
          </template>
        </div>
      </div>
      <div class="center pt2 relative">
        <div>
          <a @click="toggleHistory" class="silver inline-block pointer">{{ historyToggleText }}</a>
        </div>
      </div>
    </div>
    <div v-if="showHistory" class="p2 border-bottom border-silver">
      <div class="max-width-3 mx-auto">
        <table class="col-12 my2">
          <thead class="mb2">
            <tr>
              <th class="regular left-align muted h5">When</th>
              <th class="regular left-align muted h5">User</th>
              <th class="regular left-align muted h5">Cost</th>
              <th class="regular left-align muted h5">Earnings</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, idx) in flipEvents" :class="{muted: idx > 2}" class="h3">
              <td>{{ eventTime(event.args.modified) }}</td>
              <td>
                <router-link :to="userLink(event.args.newOwner)" class="underline color-inherit">{{ userName(event.args.newOwner) }}</router-link>
              </td>
              <td>{{ cost(event.args, idx) }}</td>
              <td>{{ calcEarnings(idx) }} &clubs;</td>
            </tr>
            <tr class="h3" :class="{muted: flippers > 2}">
              <td>{{ created }}</td>
              <td>
                <router-link :to="userLink(founder.address)" class="underline color-inherit">{{ userName(founder.address) }}</router-link>
              </td>
              <td>0 &clubs;</td>
              <td>{{ calcFinderEarnings }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- <p class="h2 center">
        <code>moves: <div v-for="chunk in visibleMoveString">{{chunk}}</div></code>
    </p> -->
    <!-- <button @click.self="test()" class="btn btn-outline py3 col-12 regular h3">TEST</button> -->
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import moment from 'moment'
  import Reversi from '@/assets/reversi'
  import Symmetry from '@/components/Symmetry'
  import xss from 'xss'

  export default {
    name: 'clover',
    data () {
      return {
        nameNotClicked: true,
        name: '',
        reversi: new Reversi(),
        flipping: false,
        showHistory: false
      }
    },
    methods: {
      test () {
        console.log('test')
        console.log(this.boardId)
        this.clover.cloverExists(this.boardId).then((res) => {
          console.log(res)
        }).catch((err) => {
          console.error(err)
        })
      },
      cost (args, idx) {
        return args.lastPaidAmount && parseInt(args.lastPaidAmount).toLocaleString() + ' ♣'
      },
      calcEarnings (idx) {
        let multiply = idx
        let paid = -parseInt(this.flipEvents[idx].args.lastPaidAmount)
        let max = Math.min(multiply, 3)

        return paid + (Math.abs(paid) * max)
      },
      eventTime (int) {
        return moment(int * 1000).fromNow()
      },
      userLink (address) {
        return `/users/${address}`
      },
      userName (address) {
        let username = this.usernames.find((u) => u.address === address)
        username = username ? username.name : address
        return username.length > 8 ? username.substring(0, 8) + '...' : username
      },
      flip () {
        console.log(this.price, this.balance, parseInt(this.price) > this.balance)
        if (!this.balance || parseInt(this.price) > this.balance) {
          this.selfDestructMsg({
            msg: 'Insufficient Funds',
            type: 'error'
          })
        } else {
          this.flipping = true
          let boardName = JSON.parse(JSON.stringify(this.board.name || this.board.board))
          let link = '/clovers/' + JSON.parse(JSON.stringify(this.board.board))
          this.addMessage({
            msg: 'Flipping Clover ' + boardName,
            type: 'progress'
          }).then((msgId) => {
            this.clover.flipClover(this.boardId).then((res) => {
              // console.log(res)
              this.removeMessage(msgId)
              this.flipping = false
              this.selfDestructMsg({
                msg: 'Successfully flipped ' + boardName,
                type: 'success',
                link
              })
            }).catch((err) => {
              console.error(err)
              this.removeMessage(msgId)
              this.flipping = false
              this.selfDestructMsg({
                msg: 'Error flipping Clover (check log)',
                type: 'error'
              })
            })
          })
        }
      },
      changeName () {
        this.addMessage({
          msg: 'Updating Name',
          type: 'progress'
        }).then((msgId) => {
          if (this.name === '' || this.name !== this.board.name) {
            let link = '/clovers/' + JSON.parse(JSON.stringify(this.board.board))
            this.clover.renameClover(this.boardId, this.name).then(() => {
              this.selfDestructMsg({
                msg: 'Updated name to ' + xss(this.name),
                type: 'success',
                link
              })
              this.removeMessage(msgId)
            }).catch((err) => {
              console.error(err)
              this.removeMessage(msgId)
              this.selfDestructMsg({
                msg: 'Error check logs',
                type: 'error'
              })
              console.log(err)
            })
          } else {
            this.selfDestructMsg({
              msg: this.name === '' || !this.name ? 'Clover name can\'t be empty' : 'Clover already named ' + xss(this.name),
              type: 'error'
            })
            this.removeMessage(msgId)
          }
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
      toggleHistory () {
        this.showHistory = !this.showHistory
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
      flipEvents () {
        return this.$store.state.registeredEvents.filter((e) => {
          return e.args.board === this.boardId && !e.args.newBoard
        }).reverse()
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
          return this.board.lastPaidAmount
        }
        return this.board.lastPaidAmount * 2
      },
      priceComma () {
        return this.price.toLocaleString()
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
      calcFinderEarnings () {
        let max = Math.min(this.flippers, 3)
        let firstPaid = this.flipEvents.length ? this.flipEvents[this.flippers - 1].args.lastPaidAmount : 0
        return parseInt(this.findersFee) + (firstPaid * max)
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
        return this.board && moment(this.board.created * 1000).fromNow()
      },
      modified () {
        return this.board && moment(this.board.modified * 1000).format('MMMM Do YYYY, h:mm:ss a')
      },
      currentOwner () {
        return this.account && this.owner && (this.account === this.owner.address)
      },
      findersFee () {
        return this.board && parseInt(this.board.findersFee).toLocaleString()
      },
      historyToggleText () {
        return this.showHistory ? 'hide clover history' : 'show clover history'
      },

      ...mapGetters([
        'balance',
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
