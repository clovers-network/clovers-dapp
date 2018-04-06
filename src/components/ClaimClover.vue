<template>
  <div class="bg-dark-gray white px2 py3 zig-zag relative">
    <div id='claim-outer' class="flex items-center justify-between">
      <div class="relative mx3">
        <template v-if='byteBoard'>
          <div class="h2">
            <clv class='no-border' :moveString="movesString" :byteBoard="byteBoard"></clv>
          </div>
        </template>
      </div>
      <div v-if="cloverData.removed" class="px3 flex-auto">
        <p class="h1 m0 lh1">🗑 Removed {{ removeDate }}</p>
      </div>
      <div v-else-if="cloverData.claimed" class="px3 flex-auto">
        <router-link :to="'/clovers/0x' + cloverData.byteBoard">
          <p class="h1 m0 lh1 white">✨ Claimed {{ claimDate }}</p>
        </router-link>
      </div>
      <div v-else class="col-8 lg-col-7">
        <!-- <div>
          <input class="btn btn-outline py3 col-12 regular h3" v-model='movesString'>
        </div> -->
        <form @submit.prevent="trigger">
          <div id="submit-form" class="mb2 flex flex-wrap">
            <div  class="col-6 px3 ">
              <label class="block right-align h2">You will receive</label>
              <input class="input big white right-align" disabled :value="rewardTxt">
            </div>
            <div class="col-6 px3 ">
              <label class="block right-align h2">List on flip market for</label>
              <div class="flex content-stretch items-center border-bottom">
                <input class="input big white right-align" style="padding-right:0" type="number" v-model="flipPrice">
                <span class="h1">♧</span>
              </div>
            </div>
            <div class="mt3 px3 col-12">
              <button type="submit" class="btn btn-outline py3 col-12 regular h3">
                <span>Claim Clover and register on Flip Market</span>
                <span class="pl2 sending" v-if="submitting">✨</span>
              </button>
              <p class="right-align mt1 mb0">
                <button @click="remove" type="button" class="border-none bg-transparent white h5 pointer">Remove clover</button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapActions, mapGetters, mapMutations } from 'vuex'
  import SvgText from '@/components/SvgText'
  import Symmetry from '@/components/Symmetry'
  import Reversi from 'clovers-reversi'

  export default {
    name: 'claim-clover',
    data () {
      return {
        byteBoard: null,
        movesString: null,
        reward: null,
        flipPrice: 100
      }
    },
    props: {
      cloverData: {
        type: Object,
        required: true
      }
    },
    computed: {
      submitting () {
        return this.cloverData && this.submittingBoards.findIndex((c) => c === this.cloverData.byteBoard) > -1
      },
      rewardTxt () {
        return (this.reward || 100) + ' ♧'
      },
      claimDate () {
        return moment(this.cloverData.claimed * 1000).fromNow()
      },
      removeDate () {
        return moment(this.cloverData.removed * 1000).fromNow()
      },
      ...mapGetters({
        submittingBoards: 'submittingBoards',
        readOnly: 'readOnly',
        notRinkeby: 'notRinkeby',
        symmetries: 'symmetries',
        clover: 'clover'
      })
    },
    mounted () {
      this.setBoard()
    },
    watch: {
      cloverData () {
        this.setBoard()
      },
      movesString () {
        if (!this.movesString) return
        let reversi = new Reversi()
        reversi.playGameMovesString(this.movesString)
        reversi.isSymmetrical()
        this.byteBoard = reversi.byteBoard
      }
    },
    methods: {
      setBoard () {
        this.byteBoard = this.cloverData.byteBoard
        this.movesString = this.cloverData.movesString
        // this.reversi.playGameMovesString(this.movesString)
        // this.reversi.isSymmetrical()
        // this.reward = this.clover.calcFindersFees(this.symmetries)
        // this.flipPrice = this.reward
      },
      trigger () {
        if (this.notRinkeby || this.readOnly) {
          this.selfDestructMsg({
            msg: 'Please connect to the Rinkeby Network using MetaMask or Mist Browser',
            link: 'https://metamask.io/',
            type: 'error'
          })
          return
        }

        let reversi = new Reversi()

        reversi.playGameMovesString(this.movesString)
        this.addMessage({
          msg: 'Validating Clover on the Blockchain',
          type: 'progress'
        }).then((msgId) => {
          console.log(msgId)
          let byteBoard = reversi.byteBoard
          this.addToSubmittingList(byteBoard)
          
          // this.clover.register().then((res) => {
          //   this.removeFromSubmittingList(byteBoard)
          //   this.claimedClover(byteBoard)
          //   this.removeMessage(msgId)
          //   this.selfDestructMsg({
          //     msg: 'Clover 0x' + byteBoard + ' Claimed',
          //     link: '/clovers/0x' + byteBoard,
          //     type: 'success'
          //   })
          // }).catch((err) => {
          //   console.error(err)
          //   this.removeFromSubmittingList(byteBoard)
          //   this.removeMessage(msgId)
          //   this.selfDestructMsg({
          //     msg: 'Error Claiming 0x' + byteBoard + ' (check logs)',
          //     type: 'error'
          //   })
          // })
        })
      },
      remove () {
        this.$emit('remove')
      },

      ...mapActions([
        'selfDestructMsg',
        'addMessage'
      ]),

      ...mapMutations({
        updateCloverPrice: 'UPDATE_CLOVER_PRICE',
        removeMessage: 'REMOVE_MSG',
        claimedClover: 'CLAIMED_CLOVER',
        addToSubmittingList: 'SUBMITTED_CLOVER',
        removeFromSubmittingList: 'SUBMITTED_CLOVER_DONE'

      })
    },
    components: { SvgText, Symmetry }
  }
</script>
<style lang="scss">

@media only screen and (max-width: 768px) {
  #claim-outer {
    flex-wrap: wrap;
    li {
      margin:auto;
    }
    * {
      text-align:center !important;
    }
    > * {
      width:100%;
      #submit-form > * {
        width:100%;
      }
    }
  }
}
</style>
