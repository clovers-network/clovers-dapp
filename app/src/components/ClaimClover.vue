<template>
  <div class="bg-dark-gray white px2 py4 zig-zag relative">
    <div class="flex items-center justify-between">
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
        <router-link :to="'/clovers/' + cloverData.byteBoard">
          <p class="h1 m0 lh1 white">✨ Claimed {{ claimDate }}</p>
        </router-link>
      </div>
      <div v-else class="col-8 lg-col-7">
<!--         <div>
          <input class="btn btn-outline py3 col-12 regular h3" v-model='movesString'>
        </div> -->
        <form @submit.prevent="trigger">
          <div class="mb2 flex flex-wrap">
            <div class="col-6 px3">
              <label class="block right-align h2">You will receive</label>
              <input class="input big white right-align" disabled :value="rewardTxt">
            </div>
            <div class="col-6 px3">
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
  import SvgText from '@/components/TextPath'
  import Reversi from '../assets/reversi'
  export default {
    name: 'claim-clover',
    data () {
      return {
        submitting: false,
        byteBoard: null,
        movesString: null,
        reward: null,
        reversi: new Reversi()
      }
    },
    props: {
      cloverData: {
        type: Object,
        required: true
      }
    },
    computed: {
      rewardTxt () {
        return (this.reward || 100) + ' ♧'
      },
      claimDate () {
        return moment(this.cloverData.claimed * 1000).fromNow()
      },
      removeDate () {
        return moment(this.cloverData.removed * 1000).fromNow()
      },
      flipPrice: {
        get () {
          return this.cloverData.startPrice || 100
        },
        set (newVal) {
          this.updateCloverPrice({
            newVal,
            byteBoard: this.byteBoard
          })
        }
      },
      ...mapGetters({
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
        this.reversi.playGameMovesString(this.movesString)
        this.reversi.isSymmetrical()
        this.byteBoard = this.reversi.byteBoard
      }
    },
    methods: {
      setBoard () {
        this.byteBoard = this.cloverData.byteBoard
        this.movesString = this.cloverData.movesString
        this.clover.playGameMovesString(this.movesString)
        this.clover.isSymmetrical()
        this.reward = this.clover.calcFindersFees(this.symmetries)
      },
      trigger () {
        this.submitting = true
        this.clover.startPrice = this.flipPrice
        this.clover.playGameMovesString(this.movesString)
        this.addMessage({
          msg: 'Large TXs take time, please be patient',
          type: 'progress'
        }).then((msgId) => {
          this.clover.register().then((res) => {
            console.log('res', res)
            this.claimedClover(this.clover.byteBoard)
            this.submitting = false
            console.log('claim returned')
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: 'Clover 0x' + this.clover.byteBoard + ' Claimed',
              link: '/clovers/0x' + this.clover.byteBoard,
              type: 'success'
            })
          }).catch((err) => {
            console.error(err)
            this.submitting = false
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: 'Error Claiming 0x' + this.clover.byteBoard + ' (check logs)',
              type: 'error'
            })
          })
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
        claimedClover: 'CLAIMED_CLOVER'
      })
    },
    components: { SvgText }
  }
</script>
