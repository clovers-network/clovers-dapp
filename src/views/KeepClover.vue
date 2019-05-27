<template lang="pug">
  .green.fixed.z3.flex.modal(@click.self="cancel")
    .m-auto.col-11.md-col-8.lg-col-4.bg-white.flex.flex-column.justify-between.border.border-dashed.rounded
      header
        .h-header.flex.justify-between.items-center
          .col-4.pl3.pt1
            button.pointer(@click="cancel") Cancel
          h1.col-4.font-exp.center.nowrap {{invalidClover ? 'Not Found' : ''}}
          .green.mt3.mr3(v-if="clover.symmetrical")
            symmetry-icons(:board="clover")
      div.flex-auto.relative.p2.center
        //- image
        img(:src="cloverImage(clover, 290)" width="290" height="290")
        //- .keep__figure__img.absolute.bg-contain.bg-no-repeat.bg-center(role="img", v-if="clover && !invalidClover", :style="'background-image:url(' + cloverImage(clover) + ')'")
        //- .keep__figure__img.absolute.flex.items-center.justify-center.h1(v-else)
        //-   .h1 :-(
        //- fav btn
        //- .absolute.bottom-0.right-0.p2(@click="saveClover(clover)", v-if="!invalidClover")
        //-   heart-icon.green.h1(:active="isSaved")

      //- stats
      .flex.flex-wrap.pt3.pb2
        .col-6.align-right Your balance
        .col-6.pl2
          span &cent; &nbsp; {{ prettyUserBalance }}
          span.light-green &nbsp; ({{ userBalanceInETH }} <sup>ETH</sup>)
        .col-6.align-right Cost to keep
        .col-6.pl2
          span &cent; &nbsp; {{ keepValue }}
          span.light-green &nbsp; ({{ keepValueInETH }} <sup>ETH</sup>)

      //- invalid clover
      footer(v-if="invalidClover").bg-green.white
        router-link(:to="{name: 'Field'}")
          button.col-12.h-bttm-bar.font-exp.pointer Find More

      //- keep / sell actions
      footer(v-else-if="!submitted")
        //- small.border-top.center.p2.block.h6.bg-white(v-if="sellValue > 0") You found a symmetrical clover! Keep it or claim a reward.
        //- .flex.border-top
        //-   .col-6.flex-grow.p3.relative.pointer(@click="action = 'keep'")
        //-     div(:class="{'opacity-25': action !== 'keep'}")
        //-       small.block.lh1 Keep for
        //-       .font-exp.mt1.truncate {{ keepValue }} Coins
        //-   .col-6.flex-grow.p3.relative.pointer.border-left(v-if="sellValue > 0", @click="action = 'sell'")
        //-     div(:class="{'opacity-25': action !== 'sell'}")
        //-       small.block.lh1 Claim reward
        //-       .font-exp.mt1.truncate {{ sellValue }} Coins

        //- confirm btn
        .m3.bg-green.rounded.white
          button.col-12.pointer.p2(@click="btnClick", :class="{'pointer-events-none': submitting}")
            span.block.m-auto.capitalize(v-show="!submitting") {{action}}
            wavey-menu.m-auto(v-show="submitting", :isWhite="true")
          transition(name="fade")
            .p2.center.font-mono(v-if="submitting")
              p {{ infoText }}
      //- submitting
      footer(v-else)
        .bg-green.white.col-12.h--bar.font-mono.items-center.pointer
          router-link.p3.center(:to="('/clovers/' + clover.board)")
            p.m-auto.pt2 Transaction complete! Click here to view Clover.
</template>

<script>
import Vue from 'vue'
import WaveyMenu from '@/components/Icons/WaveyMenu'
import HeartIcon from '@/components/Icons/HeartIcon'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage, fetchCloudImage, prettyBigNumber, abbrvNum } from '@/utils'
import { fromWei } from 'web3-utils'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

const reversi = new Reversi()
let lastRt = null

export default {
  name: 'KeepClover',
  props: {
    movesString: {type: String, required: true}
  },
  head: {
    meta () {
      if (lastRt || !this.clover.board) return
      const img = fetchCloudImage(cloverImage({board: this.clover.board}, 640))
      return [{ p: 'og:image', c: img, id: 'og-img' }]
    }
  },
  data () {
    return {
      action: 'keep',
      value: null,
      reward: null,
      submitting: false,
      submitted: false
    }
  },
  watch: {
    _reversi () {
      this.checkClover()
    }
  },
  computed: {
    _reversi () {
      return reversi.playGameMovesString(this.movesString)
    },
    clover () {
      const id = `0x${this._reversi.byteBoard}`
      const saved = this.picks.find(b => b.board === id)
      return saved || this._reversi
    },
    invalidClover () {
      return this._reversi && this._reversi.error
    },
    keepValue () {
      // in Coins
      return this.value ? abbrvNum(fromWei(this.value.toString(10))) : '...'
    },
    keepValueInETH () {
      if (!this.value) return '...'
      return abbrvNum(this.value.div(this.clubTokenPrice).toString(10))
    },
    sellValue () {
      // in Coins
      return this.reward ? abbrvNum(fromWei(this.reward.toString(10))) : '...'
    },
    infoText () {
      return this.action === 'keep'
        ? 'Your Clover is being submitted to the Contract. Once the Clover is verified by our Oracle, you will be confirmed as the owner.'
        : 'This reward is based on the rarity of the Clover. The Contract will buy this from you with Coin (♣). Once the Oracle has verified the Clover you will receive the payout.'
    },
    isSaved () {
      if (!this.picks.length) return false
      return this.picks.findIndex(c => c.board === this.clover.board) >= 0
    },
    clubTokenPrice () {
      return new BigNumber(this.$store.state.clubTokenPrice)
    },

    ...mapGetters(['picks', 'prettyUserBalance', 'userBalanceInETH'])
  },
  methods: {
    cloverImage,

    cancel () {
      let current = { name: this.$route.name }
      this.$router.push(current)
    },
    btnClick () {
      if (this.action === 'keep') this.keep()
      if (this.action === 'sell') this.sellToBank()
    },
    async keep () {
      this.submitting = true
      try {
        const tx = await this.buy(this.clover)
        console.log(tx)
        this.submitting = false
        this.handleSuccess(
          `Success! You kept ${this.clover.board}`,
          this.clover
        )
      } catch (error) {
        console.log(error)
        this.submitting = false
        // notification
        this.handleError(error)
      }
    },
    async sellToBank () {
      this.submitting = true
      try {
        const tx = await this.sell({ clover: this.clover })
        console.log(tx)
        this.submitting = false
        this.handleSuccess(
          `Success! You sold ${this.clover.board} to the bank`,
          this.clover
        )
      } catch (error) {
        console.log(error)
        this.submitting = false
        // notification
        this.handleError(error)
      }
    },
    checkClover () {
      if (!this.clover) return null
      this.cloverExists('0x' + this._reversi.byteBoard).then((exists) => {
        if (!exists) return
        this.addMessage({
          type: 'error',
          title: 'This Clover already exists',
          msg: 'Click here to view the original',
          link: '/clovers/0x' + this._reversi.byteBoard
        })
      })
      const syms = this._reversi.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        wei = new BigNumber(wei)
        this.reward = wei
        this.value = wei.plus(this.$store.state.basePrice)
      })
    },
    handleError ({ message }) {
      this.selfDestructMsg({
        msg: message.replace('Error: ', ''),
        type: 'error'
      })
    },
    handleSuccess (msg, clover) {
      this.selfDestructMsg({msg, type: 'success'})
      this.$store.commit('REMOVE_SAVED_CLOVER', this.clover)
      this.submitted = true
    },

    ...mapMutations({
      saveClover: 'SAVE_CLOVER'
    }),
    ...mapActions([
      'buy',
      'sell',
      'addMessage',
      'selfDestructMsg',
      'cloverExists',
      'getClubTokenPrice'
    ])
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from && from.name
    next()
  },
  mounted () {
    this.checkClover()
    this.getClubTokenPrice()
  },
  components: { WaveyMenu, HeartIcon, SymmetryIcons }
}
</script>

<style>
.keep__figure__img {
  width: calc(100% - 2rem);
  height: calc(100% - 4rem);
  top: 2rem;
  left: 1rem;
}
sup {
  font-size: 56%;
}
</style>
