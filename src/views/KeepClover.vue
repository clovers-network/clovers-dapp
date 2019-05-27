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
          span.bold &cent; &nbsp; {{ prettyUserBalance }}
          span.light-green &nbsp; ({{ userBalanceInETH }} <sup>ETH</sup>)
        .col-6.align-right Cost to keep
        .col-6.pl2(v-if="unavailable")
          span.red.opacity-50 &times; Already registered
        .col-6.pl2(v-else)
          span.bold &cent; &nbsp; {{ keepValue }}
          span.light-green &nbsp; ({{ keepValueInETH }} <sup>ETH</sup>)
        template(v-if="_reversi.symmetrical")
          .col-6.align-right Reward
          .col-6.pl2
            span.bold &cent; &nbsp; {{ sellValue }}
            span.light-green &nbsp; ({{ sellValueInETH }} <sup>ETH</sup>)

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
        .m3.rounded.white.trans-bg(:class="cancelled ? 'bg-red' : 'bg-green'")
          button.col-12.pointer.p2(@click="btnClick", :class="{'pointer-events-none': submitting}")
            span.block.m-auto.capitalize(v-show="!submitting") {{ buttonText }}
            template(v-if="submitting")
              .p1
              wavey-menu.m-auto(:isWhite="true")
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
const actions = {
  keep: 'Keep Clover',
  sell: 'Claim Reward',
  view: 'View ↗'
}

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
      unavailable: false,
      action: 'keep',
      value: null,
      reward: null,
      submitting: false,
      submitted: false,
      cancelled: false
    }
  },
  watch: {
    _reversi () {
      this.checkClover()
    },
    cancelled (newVal) {
      if (newVal) {
        setTimeout(() => {
          this.cancelled = false
        }, 1500)
      }
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
    sellValueInETH () {
      if (!this.reward) return '...'
      return abbrvNum(this.reward.div(this.clubTokenPrice).toString(10))
    },
    infoText () {
      return this.action === 'keep'
        ? 'Registering Clover. It will show up in your dashboard soon!'
        : 'The reward is based on rarity in the network. Validity will be checked before payout.'
    },
    isSaved () {
      if (!this.picks.length) return false
      return this.picks.findIndex(c => c.board === this.clover.board) >= 0
    },
    clubTokenPrice () {
      return new BigNumber(this.$store.state.clubTokenPrice)
    },
    buttonText () {
      return this.cancelled ? 'Transaction cancelled' : actions[this.action]
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
      if (this.cancelled || this.submitting) return
      if (this.action === 'keep') this.keep()
      if (this.action === 'sell') this.sellToBank()
      if (this.action === 'view') this.viewClover()
    },
    async keep () {
      this.submitting = true
      try {
        const tx = await this.buy(this.clover)
        this.submitting = false
        this.handleSuccess(
          `Success! You kept ${this.clover.board}`,
          this.clover
        )
      } catch (err) {
        this.submitting = false
        this.cancelled = true
        // notification
        this.handleError(err)
      }
    },
    async sellToBank () {
      this.submitting = true
      try {
        const tx = await this.sell({ clover: this.clover })
        this.submitting = false
        this.handleSuccess(
          `Success! You sold ${this.clover.board} to the bank`,
          this.clover
        )
      } catch (err) {
        this.submitting = false
        this.handleError(err)
      }
    },
    checkClover () {
      if (!this.clover) return null
      this.cloverExists('0x' + this._reversi.byteBoard).then((exists) => {
        if (!exists) {
          this.unavailable = false
          this.action = this._reversi.symmetrical ? 'sell' : 'keep'
          return
        }
        this.unavailable = true
        this.action = this._reversi.symmetrical ? 'sell' : 'keep'
      })
      const syms = this._reversi.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        wei = new BigNumber(wei)
        this.reward = wei
        this.value = wei.plus(this.$store.state.basePrice)
      })
    },
    viewClover () {
      this.$router.push(`/clovers/0x${this._reversi.byteBoard}`)
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
