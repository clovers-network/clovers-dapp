<template lang="pug">
  modal.green(@close="close")
    //- btn: pick | remove
    div(slot="top-right-btn")
      button.px1.h5(v-if="$route.name === 'Picks'", @click="remove") Discard
      button.px1.pt1(v-else, @click="$store.commit('SAVE_CLOVER', clover)")
        heart-icon(:active="isSaved", :invisible="false")

    .pt1
      //- image
      figure.flex-auto.px2.mt1
        img.block.mx-auto(:src="cloverImage(clover, 196)" width="196" height="196")
        //- symm icons ?
        .green.mt3.h6(v-if="clover.symmetrical")
          symmetry-icons(:board="clover")

      //- errors ?
      template(v-if="unavailable || invalidClover")
        h3.my3.font-exp.center.nowrap.red.opacity-50
          span(v-if="invalidClover") Invalid Clover :(
          span(v-else-if="unavailable") Already registered :(

      //- actions
      template(v-else)
        .options.px3.pt3.mx2.md-mx3
          div
            label.radio.block.pointer.border.rounded.py1.px2.mb1.flex.items-center(:active="mode === 'keep'")
              input(v-model="mode" type="radio" value="keep")
              .dot.mr2
              span.flex-auto.mr3 Keep Clover
              .bold.flex.items-center
                | <span v-if="_reversi.symmetrical">-&#32;</span>{{ keepValue }} <coin-icon class="ml1"/>
            label.radio.block.pointer.border.rounded.py1.px2.mb1.flex.items-center(v-if="_reversi.symmetrical", :active="mode === 'sell'")
              input(v-model="mode" type="radio" value="sell")
              .dot.mr2
              span.flex-auto.mr3 Claim Reward
              .bold.flex.items-center + {{ sellValue }} <coin-icon class="ml1"/>
          p.center.h6.underline.mb0.mt3.help(@click="showMore = true" v-if="!showMore") More Information
          p.center.h6.mb0.mt3.pointer.mx-auto.col-10(v-if="showMore" @click="showMore = false")
            span(v-if="mode === 'keep'") To register this clover on the network,<br>a base fee of <span class="nowrap">{{ baseCloverFee }}&nbsp;<coin-icon :width="10" class="inline-block"/></span> is charged
            span(v-else) Claim a reward for this rare clover.<br>This requires a verification before payout and can take a few minutes

        //- confirm
        footer.flex.justify-center(v-if="!submitted")
          .m3.rounded.white.trans-bg(:class="cancelled ? 'bg-red' : 'bg-green'")
            button.pointer.py2.px3(@click="btnClick", :class="{'pointer-events-none': submitting}")
              span.block.m-auto(v-show="!submitting") {{ buttonText }}
              span.block.m-auto(v-if="submitting") Submitting . . .

        //- submitted
        footer(v-else)
          .m3.rounded.white.bg-green.center
            router-link.col-12.pointer.p2.inline-block(:to="cloverLink")
              p.m0.m-auto View Clover
</template>

<script>
import { mapGetters, mapMutations, mapActions, mapState } from 'vuex'
import {
  cloverImage,
  fetchCloudImage,
  prettyBigNumber,
  abbrvNum,
  abbrvAddr,
  pad0x,
  formatFoundClover
} from '@/utils'
import { fromWei } from 'web3-utils'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import Modal from '@/components/Modals/Modal'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'
import CoinIcon from '@/components/Icons/CoinIcon'
import MoreInformation from '@/components/MoreInformation'
import HeartIcon from '@/components/Icons/HeartIcon'
import svgX from '@/components/Icons/SVG-X'

const reversi = new Reversi()
let lastRt = null
const actions = {
  keep: 'Keep Clover',
  sell: 'Claim Reward',
  view: 'View Clover'
}

export default {
  name: 'KeepClover',
  props: {
    movesString: { type: String, required: true }
  },
  head: {
    meta () {
      if (lastRt || !this.clover.board) return
      const img = fetchCloudImage(cloverImage({ board: this.clover.board }, 640))
      return [{ p: 'og:image', c: img, id: 'og-img' }]
    }
  },
  data () {
    return {
      id: null,
      unavailable: false,
      action: 'keep',
      mode: 'keep', // || 'sell'
      value: null,
      reward: null,
      submitting: false,
      submitted: false,
      cancelled: false,
      showMore: false
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
      const saved = this.picks.find(b => b.board === this.id)
      return saved || formatFoundClover(this._reversi)
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
      if (this.cancelled) {
        return 'Transaction cancelled'
      } else if (this.unavailable) {
        return 'View Clover'
      }
      if (!this.account) {
        return 'Sign in first...'
      } else {
        return 'Confirm'
      }
    },
    cloverLink () {
      return this.clover && `/clovers/${this.id}`
    },
    ...mapState(['account', 'baseCloverFee']),
    ...mapGetters(['picks', 'prettyUserBalance', 'userBalanceInETH'])
  },
  methods: {
    cloverImage,

    close () {
      let current = { name: this.$route.name }
      this.$router.push(current)
    },
    remove () {
      this.$store.dispatch('confirmRemoveSavedClover', this.clover).then(rmvd => rmvd && this.close())
    },
    btnClick () {
      if (this.cancelled || this.submitting) return
      if (this.action === 'view') {
        this.viewClover()
        return
      }

      if (this.mode === 'keep') {
        this.keep()
      } else {
        this.sellToBank()
      }
    },
    async keep () {
      this.submitting = true
      try {
        let foo = await this.buy(this.clover)
        this.submitting = false
        this.handleSuccess(
          `Success! You kept ${abbrvAddr(this.id)}`,
          this.clover
        )
      } catch (err) {
        // probably cancelled...
        // this.handleError(err)
        this.submitting = false
        this.cancelled = true
      }
    },
    async sellToBank () {
      this.submitting = true
      try {
        await this.sell({ clover: this.clover })
        this.submitting = false
        this.handleSuccess(
          `Success! You sold ${abbrvAddr(this.id)} to the bank`,
          this.clover
        )
      } catch (err) {
        // probably cancelled...
        // this.handleError(err)
        this.submitting = false
        this.cancelled = true
      }
    },
    checkClover () {
      if (!this.clover) return null
      this.cloverExists(this.id).then((exists) => {
        if (!exists) {
          this.unavailable = false
          this.action = this._reversi.symmetrical ? 'sell' : 'keep'
          return
        }
        this.unavailable = true
        this.action = 'view'
      })
      const syms = this._reversi.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        wei = new BigNumber(wei)
        this.reward = wei
        this.value = wei.plus(this.$store.state.basePrice)
      })
    },
    viewClover () {
      this.$router.push(this.cloverLink)
    },

    handleError ({ message }) {
      this.addMessage({
        msg: message.replace('Error: ', ''),
        type: 'error'
      })
    },
    handleSuccess (msg, clover) {
      this.addMessage({ msg, type: 'success', link: '/clovers/' + clover.byteBoard })
      this.$store.commit('REMOVE_SAVED_CLOVER', this.clover)
      this.submitted = true
    },

    ...mapActions([
      'buy',
      'sell',
      'addMessage',
      'addMessage',
      'cloverExists',
      'getClubTokenPrice'
    ])
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from && from.name
    next()
  },
  mounted () {
    this.id = pad0x(this._reversi.byteBoard)
    this.checkClover()
    this.getClubTokenPrice()
  },
  components: { Modal, SymmetryIcons, CoinIcon, MoreInformation, HeartIcon, svgX }
}
</script>
