<template lang="pug">
  article.mt-deduct-header(v-if="board")
    header
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
              span(v-else) {{currentOwner}}
        //- price / value
        .col-6.px3.py2.flex
          .col-12.m-auto
            small.block.lh1.h6 {{ isRFT ? 'My Shares' : showSalePrice ? 'For Sale' : 'Original Reward'}}
            .font-exp.mt1 {{ isRFT ? sharesOwned: (showSalePrice ? prettyPrice : originalPrice) + ' ♣&#xFE0E;' }}
    //- clover image
    figure.relative.p3.md-p4.h-100vw.flex.items-center.justify-center.overflow-hidden.touch(@click="view = false", :class="{'border-bottom': isRFT}", style="max-height:48vh")
      //- image
      .absolute.overlay.flex.items-center.justify-center.p3
        clv.col-10.sm-col-6.mx-auto(:moveString="cloverMovesString", :byteBoard="board", :isRFT="isRFT", style="max-width:36vh")
      //- symm icons
      .absolute.px2.z1.top-0.left-0.flex.items-center(style="height:58px")
        symmetry-icons(v-if="clover", :board="clover.symmetries", style="font-size:16px")
      //- comments / icon
      .absolute.top-0.right-0.flex.items-center.px2(style="height:58px")
        transition(name="fade")
          comments(v-if="canGetComments", :board="board", :name="cloverName", :owner="isMyClover")
    //- Trade
    template(v-if="isRFT")
      Trade(:market="board", :sharesOwnedWei="sharesOwnedWei", @trade="checkShares")
    //- Actions
    template(v-else)
      .h-bttm-bar
      footer.fixed-center-max-width.bottom-0
        //- Owner Options
        div(v-if="isMyClover", )
          //- Sell / RFT Options
          //- small.border-top.center.p2.block.h6.bg-white(v-show="!view") You own this Clover
          small.border-top.center.p2.block.h6.bg-white.pointer(v-show="!view && showSalePrice" @click="makeSell(true)")
            span(v-if="!loading") Remove From Market
            wavey-menu.m-auto(v-else :isWhite="false")
          small.border-top.center.p2.block.h6.bg-white.pointer(v-show="!view" @click="view='transfer'") Transfer
          .bg-green.flex.white.font-exp.h-bttm-bar.justify-center(v-show="!view")
            button.col-6.flex.border-right.pointer(@click="view = 'sell'")
              span.block.m-auto {{showSalePrice ? 'Change Price' : 'Sell'}}
            button.col-6.flex.pointer(@click="view = 'RFT'")
              span.block.m-auto RFT
          //- transferView
          .bg-green.white(v-show="view === 'transfer'")
            .pt2.pb3.px3
              .mt1.mb2.font-exp.center Transfer
              label.h6.lh1.block To
              .relative
                input.block.col-12.mt1.border-bottom.font-exp.py1.pr3.white.font-mono(@keyup.enter="transferTo" v-model="transferToAddress" placeholder="Address")
            button(@click="transferTo").h-bttm-bar.flex.col-12.border-top.pointer
              span(v-if="!loading").block.m-auto.font-exp Confirm
              wavey-menu.m-auto(v-else :isWhite="true")
          //- sellView
          .bg-green.white(v-show="view === 'sell'")
            .pt2.pb3.px3
              .mt1.mb2.font-exp.center Sell
              label.h6.lh1.block List for
              .relative
                input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="sellPrice", min="0")
                span.absolute.top-0.right-0.h-100.opacity-50.flex
                  span.block.m-auto ♣&#xFE0E;
            button(@click="makeSell()").h-bttm-bar.flex.col-12.border-top.pointer
              span(v-if="!loading").block.m-auto.font-exp Confirm
              wavey-menu.m-auto(v-else :isWhite="true")
          //- make RFT view
          .bg-green.white(v-show="view === 'RFT'")
            .p3
              .pb3.font-exp.center Make Public
              p.mb3.h5(:class="{center: showSalePrice}") Relinquish ownership and convert this clover into a publicly tradable asset.
              template(v-if="!showSalePrice")
                label.block.h6 Your initial invesment&nbsp; <span class="opacity-50">(optional)</span>
                .relative.pb1
                  input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="invesment", min="0")
                  span.absolute.top-0.right-0.h-100.opacity-50.flex
                    span.block.m-auto ♣&#xFE0E;
            .p3.md-p2.bg-orange.p2.center.h5
              span(v-if="!showSalePrice") This action cannot be undone!
              span.pointer(v-else @click="makeSell(true)") First, remove from market
            button.h-bttm-bar.flex.col-12.pointer(v-if="!showSalePrice" @click="makeRFT")
              span(v-if="!loading").block.m-auto.font-exp Confirm
              wavey-menu.m-auto(v-else :isWhite="true")

        //- Buy
        .bg-green(v-else-if="canBuy")
          button.h-bttm-bar.white.flex.col-12.pointer(@click="view = 'buy'")
            span.block.m-auto.font-exp Buy for {{prettyPrice}} ♣&#xFE0E;
          transition(name="confirm")
            section.white(v-show="view === 'buy'")
              .border-top.flex
                .col-6.p3.border-right
                  small.block.lh1.h6 Your Balance
                  .font-exp.mt2 {{ prettyUserBalance }} ♣&#xFE0E;
                .col-6.relative.p3
                  template(v-if="canAfford")
                    small.block.lh1.h6 Balance After
                    .font-exp.mt2 {{ balanceAfter }} ♣&#xFE0E;
                  template(v-else)
                    router-link.absolute.overlay.col-12.flex.items-center.justify-center.pointer(:to="{name: 'Account/Trade'}")
                      span.block.font-exp Add
              //- confirm, if can buy
              button(@click="makeBuy", v-if="canAfford").h-bttm-bar.white.border-top.flex.col-12.pointer
                span(v-if="!loading").block.m-auto.font-exp Confirm
                wavey-menu.m-auto(v-else :isWhite="true")
              //- can't buy
              div(v-else).h-bttm-bar.white.border-top.flex.col-12.pointer
                span.block.m-auto.font-exp.opacity-50 Insufficient Funds
        //- Unavailable
        .bg-green(v-else)
          .h-bttm-bar.white.flex.col-12
            span.block.m-auto.font-exp Unavailable
</template>

<script>
import store from '@/store'
import utils from 'web3-utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'
import { mapState, mapActions, mapGetters } from 'vuex'
import {
  cloverImage,
  fetchCloudImage,
  prettyBigNumber,
  bnMinus,
  makeBn,
  abbrvAddr
} from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'
import Clv from '@/components/Clv'
import CloverNameEditable from '@/components/CloverNameEditable'
import Trade from '@/views/Trade'
import Reversi from 'clovers-reversi'
import Comments from '@/components/Comments'

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
      const img = fetchCloudImage(cloverImage({board: this.board}, 640))
      return img && [{ p: 'og:image', c: img, id: 'og-img' }]
    }
  },
  data () {
    return {
      transferToAddress: null,
      formFocussed: false,
      form: { name: null },
      view: null,
      sellPrice: 0,
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
    sellPriceWei () {
      return this.sellPrice ? utils.toWei(this.sellPrice) : '0'
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
      return this.invesment ? utils.toWei(this.invesment) : '0'
    },
    originalPrice () {
      return (
        (this.clover &&
          this.clover.reward &&
          prettyBigNumber(this.clover.reward, 2)) ||
        '---'
      )
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
    isRFT () {
      return (
        this.clover &&
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
      return this.clover && this.clover.name || this.board
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

    async transferTo () {
      if (this.loading) return
      try {
        this.loading = true
        await this.transferClover({
          clover: this.clover,
          address: this.transferToAddress
        })
      } catch (err) {
        this.handleError(err)
      }
      this.loading = false
    },
    async makeBuy () {
      if (this.loading) return
      try {
        this.loading = true
        await this.buy(this.clover)
      } catch (error) {
        console.log(error)
      }
      this.view = false
      this.loading = false
    },
    async makeSell (remove = false) {
      if (this.loading) return
      try {
        this.loading = true
        await this.sell({ clover: this.clover, price: remove ? '0' : this.sellPriceWei })
      } catch (error) {
        console.log(error)
      }
      this.view = false
      this.loading = false
      this.sellPrice = 0
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
    focusCloverName () {
      setTimeout(() => {
        this.formFocussed = true
      }, 100)
    },
    blurCloverName () {
      setTimeout(() => {
        this.formFocussed = false
      }, 50)
    },
    updateName () {
      if (!this.form.name.length) return
      this.$refs.nameInput.blur()
      let clv = {
        board: this.clover.board,
        name: this.form.name
      }
      this.updateCloverName(clv)
    },
    // buyStake () {
    //   this.loading = true
    //   this.invest({
    //     market: 'CurationMarket',
    //     clover: this.clover.board,
    //     amount: '1'
    //   })
    //     .then(res => {
    //       this.loading = false
    //       this.handleSuccess(`Success! You bought a stake!`)
    //       console.log(res)
    //     })
    //     .catch(err => {
    //       this.loading = false
    //       this.handleError(err)
    //     })
    // },
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
    setFormName (clover) {
      if (clover) this.form.name = clover.name || clover.board
    },
    updateMetaTitle (name) {
      if (!name || name === this.board) return
      this.metaTitle = name
      this.$emit('updateHead')
    },
    async checkShares () {
      if (this.isRFT) {
        this.sharesOwnedWei = await this.getShares(this.board)
      }
    },

    ...mapActions([
      'buy',
      'sell',
      'transferClover',
      'makeCloverRFT',
      'signIn',
      'invest',
      'divest',
      'selfDestructMsg',
      'addMessage',
      'getShares'
    ])
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from && from.name
    const { board } = to.params
    store.dispatch('getClover', board.toLowerCase()).then(next)
  },
  watch: {
    'orders.length' () {
      this.checkShares()
    },
    clover (clvr) {
      this.setFormName(clvr)
    },
    isRFT () {
      this.checkShares()
    }
  },
  created () {
    if (this.clover) return this.updateMetaTitle(this.clover.name)
  },
  mounted () {
    this.setFormName(this.clover)
    setTimeout(() => {
      this.canGetComments = true
    }, 500)
  },
  components: { SymmetryIcons, WaveyMenu, Clv, Trade, CloverNameEditable, Comments }
}
</script>
