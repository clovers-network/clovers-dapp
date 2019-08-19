<template lang="pug">
  article.mt3.lg-mt1(v-if="clover.board")
    //- header
      .mt-header-h.border-bottom
        //- if owner: editable name
        clover-name-editable(v-if="signedIn && isMyClover", :board="board", :clover="clover")
        //- else: name + login
        .h-header.font-mono.flex.px2.relative(v-else)
          .p2.m-auto.truncate {{ cloverName }}
          button.absolute.top-0.right-0.h-100.px2.block.regular(v-if="isMyClover", @click="signIn")
            span Login
      .flex.border-bottom
        //- owner
        .col-6.px3.py2.border-right.flex
          .col-12.m-auto
            small.block.lh1.h6.mb1 Owner
            .font-exp.mt1.truncate.overflow-hidden
              router-link(v-if="clover && clover.owner", :to="{name: 'User', params:{addr: clover.owner}}") {{ currentOwner }}
              span(v-else) {{ currentOwner }}
        //- price / value
        .col-6.px3.py2.flex
          .col-12.m-auto
            small.block.lh1.h6 {{ isRFT ? 'My Shares' : showSalePrice ? 'For Sale' : 'Original Reward'}}
            .font-exp.mt1 {{ isRFT ? sharesOwned: (showSalePrice ? prettyPrice : originalPrice) + ' ♣&#xFE0E;' }}

    //- clover image
    figure.touch.max-width-2.border-dashed.mx3.sm-mx-auto.rounded.shadow(@click="view = false")
      .relative.pb-100
        .absolute.overlay.flex.items-center.justify-center
          .col-6
            clv(:moveString="cloverMovesString", :byteBoard="board", :isRFT="isRFT")

        .absolute.top-0.right-0.flex.items-center.p2(v-if="isSymm")
          symmetry-icons(:board="clover.symmetries", style="font-size:12px")

    .center.mt4.mb2.md-mb3
      h1.h1.font-exp.m0.ws-pl
        span {{ cloverName }}
        span.pr3.font-reg.light-green.pointer.absolute.flip-x(v-if="signedIn && isMyClover", @click="currentAction = 'change'") ✎

      .h3.font-reg.mt2
        span.pr1 Owner:
        router-link.py1.px2.rounded.white.bg-green(v-if="clover && clover.owner", :to="{name: 'User', params:{addr: clover.owner}}") {{ currentOwner }}
        span.py1.px2.rounded.white.bg-green(v-else) {{ currentOwner }}
        span.pl2.light-green.pointer.absolute(v-if="isMyClover && !showSalePrice", @click="currentAction='transfer'") &rlarr; Transfer

    //- Trade
    template(v-if="isRFT")
      trade(:market="board", :sharesOwnedWei="sharesOwnedWei", @trade="checkShares")

    template(v-else)
      .flex.flex-wrap.justify-center.my4
        .mx1.mb2.flex.items-center
          .flex.items-center.py2.px3.border.rounded(v-if="showSalePrice")
            span.pr2 Price:
            coin-icon.mr1
            span.font-exp {{ prettyPrice }}
          .flex.items-center.py2.px3.border.rounded(v-else)
            span.pr2 Original price:
            coin-icon.mr1
            span.font-exp ~{{ originalPrice }}

        .mx1.mb2.rounded.white.bg-green(v-if="isMyClover")
          button.line-height-4.pointer.py2.px3.font-exp(@click="currentAction = 'sell'") {{ sellButton }}
        .mx1.mb2.rounded.white.bg-green(v-else-if="showSalePrice")
          button.line-height-4.pointer.py2.px3.font-exp(@click="currentAction = 'buy'") BUY
        .mx1.mb2.rounded.light-green.border(v-else)
          button.line-height-4.py2.px3.font-exp Unavailable

    //- comments
    section.mt4.md-mb4.pt1.max-width-3.mx-auto
      comments(:board="board", :name="cloverName", :owner="isMyClover")

    //- ACTION MODAL
    transition(name="fade")
      .green.fixed.z3.flex.modal(v-if="currentAction", @click.self="cancelAction")
        .m-auto.bg-white.flex.flex-column.justify-between.border.border-dashed.rounded
          header
            .h-header.flex.justify-between.items-center
              .col-4.pl3.pt1
                button.pointer.h5(@click="cancelAction") Cancel
              .green.mt3.mr3(v-if="clover.symmetrical")
                symmetry-icons(:board="clover")
          .flex-auto.relative.p2.center
            //- image
            img(:src="cloverImage(clover, 196)" width="196" height="196")

          template(v-if="currentAction === 'change'")
            edit-clover-name(@cancel="cancelAction")

          template(v-if="currentAction === 'transfer'")
            transfer-clover(@cancel="cancelAction")

          template(v-if="currentAction === 'sell'")
            sell-clover(@cancel="cancelAction")

          template(v-if="currentAction === 'buy'")
            buy-clover(@cancel="cancelAction", :price="prettyPrice")

  not-found(v-else)

</template>

<script>
import store from '@/store'
import { toWei } from 'web3-utils'
import { mapState, mapActions, mapGetters } from 'vuex'
import {
  cloverImage,
  fetchCloudImage,
  prettyBigNumber,
  bnMinus,
  makeBn,
  abbrvAddr
} from '@/utils'
import Reversi from 'clovers-reversi'

import SymmetryIcons from '@/components/Icons/SymmetryIcons'
import Clv from '@/components/Clv'
import Trade from '@/views/Trade'
import Comments from '@/components/Comments/Comments'
import CoinIcon from '@/components/Icons/CoinIcon'
import EditCloverName from '@/components/EditCloverName'
import TransferClover from '@/components/TransferClover'
import SellClover from '@/components/SellClover'
import BuyClover from '@/components/BuyClover'
import NotFound from '@/views/404'

const reversi = new Reversi()
let lastRt = null

export default {
  name: 'Clover',
  props: {
    board: { type: String, required: true }
  },
  head: {
    title () {
      return { inner: this.metaTitle }
    },
    meta () {
      if (lastRt || !this.board) return
      const img = fetchCloudImage(cloverImage({ board: this.board }, 640))
      return img && [{ p: 'og:image', c: img, id: 'og-img' }]
    }
  },
  data () {
    return {
      currentAction: false,
      view: null,
      invesment: 0,
      loading: false,
      sharesOwnedWei: null,
      metaTitle: abbrvAddr(this.board),
      canGetComments: false
    }
  },
  computed: {
    clover () {
      return this.$store.state.currentClover
    },
    user () {
      return this.$store.state.user
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    showSalePrice () {
      return this.price.gt(0)
    },
    sharesOwned () {
      return (
        (this.sharesOwnedWei && prettyBigNumber(this.sharesOwnedWei, 0)) ||
        '---'
      )
    },
    owner () {
      return this.clover.user
    },
    prettyPrice () {
      return prettyBigNumber(this.price, 0)
    },
    price () {
      return this.clover.price
    },
    investmentInWei () {
      return this.invesment ? toWei(this.invesment) : '0'
    },
    originalPrice () {
      if (!this.clover || !this.clover.reward) return '10'
      let r = makeBn(this.clover.reward).add(toWei('10'))
      return parseFloat(prettyBigNumber(r, 2))
    },
    balanceAfterBn () {
      if (!this.userBalance) return new this.$BN('0')
      if (!this.price) return new this.$BN('0')
      return bnMinus(this.userBalanceWei, this.price, 0)
    },
    balanceAfter () {
      if (!this.userBalance) return '0'
      if (!this.price) return new this.$BN('0')

      return prettyBigNumber(this.balanceAfterBn, 0)
    },
    isMyClover () {
      return (
        this.account &&
        this.clover.owner.toLowerCase() === this.account
      )
    },
    isSymm () {
      return this.clover && Object.values(this.clover.symmetries).reduce((acc, cum) => cum + acc, 0)
    },
    isRFT () {
      return (
        this.clover &&
        this.clover.owner &&
        this.clover.owner.toLowerCase() === this.curationMarketAddress
      )
    },
    currentOwner () {
      const owner = this.owner.address
      return !owner ? '---'
        : this.isMyClover ? 'You'
          : this.isRFT ? 'Public'
          // owned by Bank
            : owner.toLowerCase() === this.cloversBankAddress
              ? this.price > 0
                ? 'Clovers'
                : 'Pending...'
              : this.userName(this.owner)
    },
    cloverMovesString () {
      const mvs = this.clover && this.clover.moves && this.clover.moves[0]
      return mvs && reversi.byteMovesToStringMoves(...mvs)
    },
    canBuy () {
      return this.user && this.price && this.price.gt(0)
    },
    canAfford () {
      return this.canBuy && this.balanceAfterBn.gte(0)
    },
    cloverName () {
      if (!this.clover) return ''
      let { name, board } = this.clover
      const condensed = abbrvAddr(board)
      if (name === board) return condensed
      return name
    },
    sellButton () {
      return this.price > 0 ? 'Change price' : 'Sell Clover'
    },

    ...mapState(['account', 'orders']),
    ...mapGetters([
      'user',
      'userName',
      'userBalance',
      'userBalanceWei',
      'prettyUserBalance',
      'cloversBankAddress',
      'curationMarketAddress'
    ])
  },
  methods: {
    cloverImage,
    prettyBigNumber,

    async makeRFT () {
      if (this.loading) return
      try {
        this.loading = true
        await this.makeCloverRFT({
          board: this.clover.board,
          investmentInWei: this.investmentInWei
        })
      } catch (error) {
        console.error(error)
      }
      this.view = false
      this.loading = false
    },

    cancelAction () {
      this.currentAction = false
    },
    handleError ({ message }) {
      this.selfDestructMsg({
        msg: message.replace('Error: ', '').replace('[tcomb] ', ''),
        type: 'error'
      })
    },
    handleSuccess (msg) {
      this.addMessage({
        msg,
        type: 'success'
      })
    },
    updateMetaTitle (name) {
      if (!name || name === this.board) return
      this.metaTitle = name
      this.$emit('updateHead')
    },
    ...mapActions([
      'makeCloverRFT',
      'signIn',
      'invest',
      'divest',
      'selfDestructMsg',
      'addMessage',
    ])
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from && from.name
    const { board } = to.params
    store.dispatch('getClover', board.toLowerCase()).then(next)
  },
  created () {
    if (this.clover) return this.updateMetaTitle(this.clover.name)
  },
  mounted () {
    setTimeout(() => {
      this.canGetComments = true
    }, 500)
  },
  watch: {
    'orders.length' () {
      this.checkShares()
    },
    isRFT () {
      this.checkShares()
    }
  },
  components: { SymmetryIcons, Clv, Trade, Comments, CoinIcon, EditCloverName, TransferClover, SellClover, BuyClover, NotFound }
}
</script>
