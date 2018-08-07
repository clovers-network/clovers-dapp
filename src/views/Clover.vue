<template lang="pug">
  article.min-h-100vh.mt-deduct-header.flex.flex-column.justify-between(v-if="clover")
    .mt-header-h.px3.py2.border-bottom
      //- username, editable
      .h-header.relative.flex.items-center.justify-center(v-if="signedIn && isMyClover")
        div.absolute.top-0.left-0.right-0.bg-white.flex(v-show="!formFocussed")
          label.input.truncate.flex-auto.center.px4.font-mono(v-text="form.name")
          label.absolute.top-0.right-0.h-100.px2.block.regular.nowrap.flex(for="clvname")
            span.block.flip-x.m-auto ✎
        form.col-12(@submit.prevent="updateName")
          input#clvname.input.font-mono.center.col-12(@focus="focusCloverName", @blur="blurCloverName", ref="nameInput", placeholder="name", v-model="form.name", autocomplete="off")
          transition(name="fade")
            button.absolute.right-0.top-0.p2(v-if="formFocussed", type="submit")
              img(src="~../assets/icons/arrow-right.svg", width="18", height="18")
      //- else, Login
      .h-header.font-mono.flex.px2.relative(v-else)
        .p2.m-auto.truncate {{ clover.name }}
        button.absolute.top-0.right-0.h-100.px2.block.regular(v-if="isMyClover", @click="signIn")
          span Login
    header.flex.border-bottom
      //- owner
      .col-6.p3.border-right
        small.block.lh1.h6 Current Owner
        .font-exp.mt2.truncate.overflow-hidden {{ isMyClover ? 'You' : owner }}
      //- price / value
      .col-6.p3
        small.block.lh1.h6 {{showSalePrice ? 'For Sale' : 'Original Price'}}
        .font-exp.mt2 {{ showSalePrice ? prettyPrice : originalPrice }} ♣
    //- section
      button.h-header.center.border-bottom.flex.pointer.col-12
        span.block.m-auto See Full History
    figure.flex-auto.relative(@click="sellView = false")
      .absolute.p2.z1
        symmetry-icons.p1(:board="clover.symmetries")
      .absolute.bg-contain.bg-center.bg-no-repeat(role="img", :style="'background-image:url(' + cloverImage(clover) + ')'")
    footer
      div(v-if="isMyClover")
        small.border-top.center.p2.block.h6(v-show="!sellView") You currently own this Clover
        .bg-green.flex.white.font-exp.h-bttm-bar.justify-center(v-show="!sellView")
          button.col-6.flex(:class="{'border-right': !sellView}", @click="sellView = !sellView")
            span.block.m-auto Sell
          button.col-6.flex(v-show="!sellView")
            span.block.m-auto RFT
        //- sellView
        .bg-green.white(v-show="sellView")
          .p3.border-top.border-bottom
            label.h6.lh1.block List for
            .relative
              input.block.col-12.mt1.border-bottom.font-exp.py1.pr3(type="number", v-model="sellPrice", min="0")
              span.absolute.top-0.right-0.h-100.opacity-50.flex
                span.block.m-auto ♣
          button(@click="makeSell").h-bttm-bar.flex.col-12.border-top.pointer
            span(v-if="!loading").block.m-auto.font-exp Confirm
            wavey-menu.m-auto(v-else :isWhite="true")
      .bg-green(v-else-if="canBuy")
        button.h-bttm-bar.white.flex.col-12.pointer(@click="confirmVisible = !confirmVisible")
          span.block.m-auto.font-exp Buy for {{prettyPrice}} ♣
        transition(name="confirm")
          section.white(v-show="confirmVisible")
            .border-top.flex.border-bottom
              .col-6.p3.border-right
                small.block.lh1.h6 ♣ Current Balance
                .font-exp.mt2 {{ prettyUserBalance }}
              .col-6.p3
                small.block.lh1.h6 ♣ Balance After
                .font-exp.mt2 {{ balanceAfter }}
            button(@click="makeBuy", v-if="canAfford").h-bttm-bar.white.border-top.flex.col-12.pointer
              span(v-if="!loading").block.m-auto.font-exp Confirm
              wavey-menu.m-auto(v-else :isWhite="true")
            div(v-else).h-bttm-bar.white.border-top.flex.col-12.pointer
              span.block.m-auto.font-exp Insufficient Funds
      .bg-green(v-else)
        .h-bttm-bar.white.border-top.flex.col-12
          span.block.m-auto.font-exp Unavailable
</template>

<script>
import utils from 'web3-utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'
import { mapState, mapActions, mapGetters } from 'vuex'
import {
  cloverImage,
  prettyBigNumber,
  bnMinus,
  makeBn,
  addrToUser
} from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'Clover',
  props: {
    board: { type: String, required: true }
  },
  data () {
    return {
      formFocussed: false,
      form: { name: null },
      localClover: null,
      confirmVisible: false,
      sellView: false,
      sellPrice: 0,
      loading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    showSalePrice () {
      return this.clover && this.clover.price && this.clover.price.gt(0)
    },
    sellPriceWei () {
      return this.sellPrice ? utils.toWei(this.sellPrice) : '0'
    },
    owner () {
      return addrToUser(this.allUsers, this.clover.owner)
    },
    prettyPrice () {
      return prettyBigNumber(this.clover.price, 3)
    },
    price () {
      return this.clover && this.clover.price
    },
    originalPrice () {
      return (
        this.clover &&
        this.clover.originalPrice &&
        prettyBigNumber(this.clover.price, 0)
      )
    },
    balanceAfter () {
      if (!this.userBalance) return false
      return bnMinus(this.userBalance, this.price, 0)
    },
    isMyClover () {
      return (
        this.clover &&
        this.clover.owner &&
        this.account &&
        this.clover.owner.toLowerCase() === this.account.toLowerCase()
      )
    },
    clover () {
      let cloverIndex = this.allClovers.findIndex(c => c.board === this.board)
      return cloverIndex >= 0 ? this.allClovers[cloverIndex] : this.localClover
    },
    canBuy () {
      if (!this.user) return false
      if (!makeBn(this.price).gt(0)) return false
      return true
    },
    canAfford () {
      return this.canBuy && makeBn(this.balanceAfter).gte(0)
    },
    ...mapState(['account', 'allUsers', 'allClovers']),
    ...mapGetters(['prettyUserBalance', 'user', 'userBalance'])
  },
  methods: {
    cloverImage,
    prettyBigNumber,

    async makeBuy () {
      if (this.loading) return
      try {
        this.loading = true
        await this.buy(this.clover)
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    async makeSell () {
      if (this.loading) return
      try {
        this.loading = true
        await this.sell({ clover: this.clover, price: this.sellPriceWei })
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    focusCloverName () {
      this.formFocussed = true
    },
    blurCloverName () {
      this.formFocussed = false
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

    ...mapActions([
      'buy',
      'sell',
      'updateCloverName',
      'signIn'
    ])
  },
  created () {
    if (this.clover) return
    this.$store.dispatch('getClover', this.board).then(clvr => {
      this.localClover = clvr
    })
  },
  mounted () {
    this.form.name = this.clover.name || this.clover.board
  },
  components: { SymmetryIcons, WaveyMenu }
}
</script>

<style scoped>
figure > .bg-contain {
  width: calc(100% - 4.8rem);
  height: calc(100% - 4.8rem);
  top: 2.4rem;
  left: 2.4rem;
}
.confirm-enter-active,
.confirm-leave-active {
  transition: max-height var(--anim-timing-long);
}
.confirm-enter,
.confirm-leave-to {
  max-height: 0;
}
.confirm-leave,
.confirm-enter-to {
  max-height: 24rem;
}
</style>
