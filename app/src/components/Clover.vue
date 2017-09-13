<template>
  <div>
    <div class="bg-green white p2 md-p3 intro-screen relative">
      <div class='pointer h2 absolute top-0 right-0 mr3 mt3'>
        <i @click="copy('link')" class="material-icons mr1">link</i>
        <i @click="copy('moves')" class="material-icons">content_copy</i>
      </div>
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
            <!-- <p v-if="!currentOwner || flippers" class="h2"> -->
            <p class="h2">
              {{ price }} &clubs;
            </p>
            <!-- Not ready until contract is re-deployed with events for price change -->
            <!-- <p v-else class="h2">
            <form class='inline-block border-bottom' @submit.prevent="changePrice()"><input
            class='input big align-right white' type="number" step="1" placeholder="New Price" v-model="newPrice"></form>
            </p> -->
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
              {{ findersFee && findersFee.toLocaleString() }} &clubs;
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
        <div @click="toggleHistory" class="absolute bg-orange pointer circle h1 toggle-history">
          <span class="material-icons" :class="{'rotate-180': showHistory}">keyboard_arrow_down</span>
        </div>
      </div>
    </div>
    <div :class="{'expanded-500': showHistory}" class=" expandable ">
      <div class="p2 ">
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
                  <router-link :to="userLink(event.args.newOwner)" class=" color-inherit">{{ userName(event.args.newOwner) }}</router-link>
                </td>
                <td>{{ cost(event.args, idx) }}</td>
                <td>{{ calcEarnings(idx) }} &clubs;</td>
              </tr>
              <tr class="h3" :class="{muted: flippers > 2}">
                <td>{{ created }}</td>
                <td>
                  <router-link :to=" (founder && userLink(founder.address)) || ''" class=" color-inherit">{{ (founder && userName(founder.address)) || '' }}</router-link>
                </td>
                <td>0 &clubs;</td>
                <td>{{ calcFinderEarnings && calcFinderEarnings.toLocaleString() }} &clubs;</td>
              </tr>
            </tbody>
          </table>
        </div>
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
  import copier from 'copy-to-clipboard'

  export default {
    name: 'clover',
    data () {
      return {
        nameNotClicked: true,
        name: '',
        reversi: new Reversi(),
        flipping: false,
        showHistory: false,
        newPrice: null
      }
    },
    methods: {
      copy (type) {
        let msg = ''
        if (type === 'moves') {
          if (!this.moveString) return
          copier(this.moveString)
          msg = 'Game moves copied to your clipboard'
        } else if (type === 'link') {
          copier('https://clovers.network/clovers/' + this.boardId)
          msg = 'Clover\'s URL copied to your clipboard'
        } else { return }
        this.selfDestructMsg({
          msg,
          type: 'success'
        })
      },
      setPrice () {
        this.newPrice = this.price
      },
      changePrice () {
        let boardString = JSON.stringify(this.boardId)
        let newPrice = JSON.stringify(this.newPrice).split('"').join('')
        this.addMessage({
          msg: 'Updating Price to ' + newPrice + ' ♧',
          type: 'progress'
        }).then((msgId) => {
          this.clover.changeStartPrice(this.boardId, this.newPrice).then((res) => {
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: 'Clover price changed to ' + newPrice + ' ♧',
              type: 'success',
              link: '/clovers/' + boardString
            })
          }).catch((err) => {
            console.error(err)
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: 'Error changing price (see log)',
              type: 'error',
              link: '/clovers/' + boardString
            })
          })
        })
      },
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
        let paid = -parseInt(this.flipEvents[idx].args.lastPaidAmount)
        let max = Math.min(idx, 2)
        let earned = (Math.abs(paid) * (max * max))

        return paid + earned
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
        return xss(username.length > 8 ? username.substring(0, 8) + '...' : username)
      },
      flip () {
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
        if (this.readOnly) {
          this.selfDestructMsg({
            msg: 'Please connect to the Rinkeby Network using MetaMask or Mist Browser',
            link: 'https://metamask.io/',
            type: 'error'
          })
          return
        }
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
        this.setPrice()
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
        return this.price && this.price.toLocaleString()
      },
      founder () {
        return this.board && this.board.previousOwners && this.board.previousOwners[0]
      },
      founderName () {
        return this.founder && xss(this.founder.name.length > 21 ? this.founder.name.slice(0, 21) + '&hellip;' : this.founder.name)
      },
      founderAddress () {
        return this.founder && this.founder.address
      },
      calcFinderEarnings () {
        let max = Math.min(this.flippers, 2)
        let firstPaid = this.flipEvents.length ? this.flipEvents[this.flippers - 1].args.lastPaidAmount : 0
        return parseInt(this.findersFee) + (firstPaid * max)
      },
      owner () {
        return this.board && this.board.previousOwners && this.board.previousOwners[this.board.previousOwners.length - 1]
      },
      ownerName () {
        return this.owner && xss(this.owner.name.length > 7 ? this.owner.name.slice(0, 7) + '&hellip;' : this.owner.name)
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
        return this.board && parseInt(this.board.findersFee)
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
      this.setPrice()
    },
    components: { Symmetry }
  }
</script>

<style>
  .toggle-history {
    box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, .2);
    left: 50%;
    line-height: 1;
    margin-top: .6rem;
    padding: 7px 5px 0px;
    transform: translateX(-50%);
  }
</style>
