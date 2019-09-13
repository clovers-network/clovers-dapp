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
            //- meta imgs
            img.hidden(:src="metaImgs.og", alt="Clover Image")
            img.hidden(:src="metaImgs.twt", alt="Clover Image")

        .absolute.top-0.right-0.flex.items-center.p2(v-if="isSymm")
          symmetry-icons(:board="clover.symmetries", style="font-size:12px")

        .absolute.bottom-0.right-0.flex.items-center.p2(@click="copyMoves")
          copy-icon.pointer

    header.center.mt4.mb2.md-mb3
      h1.flex.justify-center
        .ws-pl.relative(@click="openNameEditor", :class="{'pointer': isMyClover}")
          span.h1.font-exp.lh1 {{ cloverName }}
          button.h2.absolute.font-reg.light-green.pointer.top-0.right-0.py1.md-px1(v-if="isMyClover", @click="openNameEditor", style="transform:translate(100%,-50%) scale(-1,1)", aria-label="Edit Name") ✎

      h2.h3.font-reg.mt2.pt1.flex.items-center.justify-center.flex-wrap.col-12.px3
        span.pr1.pl2.my1 Owner{{currentOwner.length > 16 ? ':' : ' &rarr;'}}
        router-link.my1.py1.px2.rounded.border.hover-bg-l-green(v-if="clover && clover.owner", :to="{name: 'User', params:{addr: clover.owner}}") {{ currentOwner }}
        span.my1.py1.px2.rounded.border(v-else) {{ currentOwner }}
        span.my1.pl1.pointer.nowrap.opacity-50.hover-opacity-100.trans-fast(v-if="isMyClover && !showSalePrice", @click="currentAction='transfer'") &rarr; Transfer

    .flex.flex-wrap.justify-center.my4.px3
      .mx1.mb2.flex.items-center.py2.px3.border.rounded-2
        template(v-if="showSalePrice")
          span.pr2 Price:
          span.font-exp {{ prettyPrice }}
          coin-icon.ml1
        template(v-else)
          span.pr2 Original value:
          span.font-exp ~{{ originalPrice }}
          coin-icon.ml1

      .mx1.mb2.rounded-2.white.bg-green(v-if="isMyClover")
        button.line-height-4.pointer.py2.px3.font-exp(@click="currentAction = 'sell'") {{ sellButton }}
      .mx1.mb2.rounded-2.white.bg-green(v-else-if="showSalePrice")
        button.line-height-4.pointer.py2.px3.font-exp(@click="currentAction = 'buy'") Buy
      .mx1.mb2.rounded-2.light-green.border(v-else)
        span.inline-block.line-height-4.py2.px3.font-exp Unavailable

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
            img(:src="cloverImage(clover, 540)" width="196" height="196")

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

import CopyIcon from '@/components/Icons/CopyIcon'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'
import Clv from '@/components/Clv'
import Comments from '@/components/Comments/Comments'
import CoinIcon from '@/components/Icons/CoinIcon'
import EditCloverName from '@/components/EditCloverName'
import TransferClover from '@/components/TransferClover'
import SellClover from '@/components/SellClover'
import BuyClover from '@/components/BuyClover'
import NotFound from '@/views/404'
import copy from 'copy-to-clipboard'

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
      return [
        { p: 'og:url', c: 'https://clovers.network/clovers/' + this.board, id: 'og-url' },
        { p: 'og:title', c: `Clovers | ${this.metaTitle}`, id: 'og-title' },
        { p: 'og:description', c: `Owned by ${this.currentOwner}`, id: 'og-desc' },
        { p: 'og:image', c: this.metaImgs.og, id: 'og-img' },
        { n: 'twitter:image', c: this.metaImgs.twt, id: 'twt-img' }
      ]
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
      if (!this.clover || !this.clover.reward) return '1'
      let r = makeBn(this.clover.reward).add(this.basePrice)
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
      if (this.clover && this.clover.moves && this.clover.moves.length === 1) {
        this.clover.moves = this.clover.moves[0]
      }
      const mvs = this.clover && this.clover.moves
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
      return this.price > 0 ? 'Change Price' : 'Sell'
    },
    metaImgs () {
      return {
        og: fetchCloudImage(cloverImage({ board: this.board }, 540), 'w_640,h_640,c_lpad,f_png'),
        twt: fetchCloudImage(cloverImage({ board: this.board }, 560), 'w_1200,h_628,c_lpad,f_png')
      }
    },

    ...mapState(['account', 'orders', 'basePrice']),
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
    copyMoves () {
      copy(this.cloverMovesString)
      this.selfDestructMsg({msg: 'Clover moves copies', type: 'success'})
    },
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
    openNameEditor () {
      if (this.signedIn && this.isMyClover) {
        this.currentAction = 'change'
      }
    },

    ...mapActions([
      'makeCloverRFT',
      'signIn',
      'invest',
      'divest',
      'selfDestructMsg',
      'addMessage'
    ])
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from && from.name
    const { board } = to.params
    store.dispatch('getClover', board.toLowerCase()).then(next)
  },
  beforeRouteUpdate (to, from, next) {
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
  components: { CopyIcon, SymmetryIcons, Clv, Comments, CoinIcon, EditCloverName, TransferClover, SellClover, BuyClover, NotFound }
}
</script>
