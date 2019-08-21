<template lang="pug">
  .h5.sm-h4.p2(:class='isMyLog')
    .flex.justify-start.items-center(:class="{'opacity-50': isBurned(item)}")
      //- Block No.
      .font-mono.opacity-50.h6.xs-hide(:class='{mr3: noImg}') \#{{ item.blockNumber }}

      //- Clover Transfered
      template(v-if="item.name === 'Clovers_Transfer'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to="isBurned(item) ? '' : cloverLink(item.data._tokenId)")
            img.block(:src='cloverImage(item.data._tokenId, 50)' style='width:50px;height:50px')
        //- <div class="pr3 h6">bought by</div>
        template(v-if='isBurned(item)')
          .activity-itm__icon.mr2.sm-mr3.h2.line-height-1 &times;
          .pr1 Clover burned (invalid)
        template(v-else-if='isFromClovers(item)')
          .activity-itm__icon.mr2.sm-mr3.h2 &xodot;
          .opacity-50 Sent to&ensp;
          router-link.hover-underline(:to='userRt(item.data._to)') {{ getUser('_to') }}
        template(v-else-if='isBorn(item)')
          .activity-itm__icon.mr2.sm-mr3.h2 &xodot;
          span.opacity-50 Found by&ensp;
          router-link.hover-underline(:to='userRt(item.data._to)') {{ getUser('_to') }}&ensp;&#x2618;&#xFE0F;
        template(v-else='')
          .activity-itm__icon.mr2.sm-mr3.h2 &xodot;
          router-link.block.truncate.hover-underline(:to='userRt(item.data._to)') {{ getUser('_to') }}
          .opacity-50.nowrap &ensp;bought Clover from&ensp;
          router-link.block.truncate.hover-underline(:to='userRt(item.data._from)') {{ getUser('_from') }}

      //- Clover price updated
      template(v-else-if="item.name === 'SimpleCloversMarket_updatePrice'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data._tokenId)')
            img.block(:src='cloverImage(item.data._tokenId, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h2.line-height-1 &clubs;&#xFE0E;
        div(v-if="item.data.price === '0'")
          span.opacity-50 Removed from Market
        .flex.items-center(v-else='')
          span.opacity-50 Price is now&ensp;
          | {{ newPrice }}
          coin-icon.ml1

      //- Bought Tokens
      template(v-else-if="item.name === 'ClubTokenController_Buy'")
        .h1.mr2.sm-mx3.center.black.border.circle(v-if='!noImg' style='flex:0 0 50px;height:50px') &clubs;&#xFE0E;
        .activity-itm__icon.mr2.sm-mr3.h3.line-height-1 &nearr;
        router-link.hover-underline(:to="'/users/' + item.data.buyer") {{ getUser('buyer') }}&ensp;
        span.opacity-50 bought&ensp;
        | {{ price(item.data.tokens) }}
        coin-icon.ml1

      //- Sold Tokens
      template(v-else-if="item.name === 'ClubTokenController_Sell'")
        .h1.mr2.sm-mx3.center.black.border.circle(v-if='!noImg' style='width:50px;height:50px') &clubs;&#xFE0E;
        .activity-itm__icon.mr2.sm-mr3.h3.line-height-1 &searr;
        router-link.hover-underline(:to="userRt(getUser('seller'))" ) {{ getUser('seller') }}&ensp;
        //- .pl1.flex.items-center
        span.opacity-50 sold&ensp;
        | {{ price(item.data.tokens) }}
        coin-icon.ml1

      //- New Comment
      template(v-else-if="item.name === 'Comment_Added'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to="{name: 'Clover', params: {board: item.data.board}}")
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3
          chat-icon(:size='15' :blank='true' :invert='false')
        span.opacity-50.nowrap Comment by&ensp;
        router-link.hover-underline(:to="userRt(item.data.userAddress)") {{ userName(item.data.userName) }}

      //- Renamed
      template(v-else-if="item.name === 'CloverName_Changed'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data.board)')
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3 &#x270E;
        span.opacity-50 Renamed&ensp;
        router-link.hover-underline(:to="{name: 'Clover', params:{board:item.data.board} }") {{ item.data.newName }}
      template(v-else-if="item.name === 'Album_Updated'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data.board)')
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3 &#x270E;
        span.opacity-50 Updated Album&ensp;
        router-link.hover-underline(:to="{name: 'Album', params: {id: item.data.id} }") {{ item.data.name }}
      template(v-else-if="item.name === 'Album_Created'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data.board)')
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3 &#x270E;
        div
          span.opacity-50 Created Album&ensp;
          router-link.hover-underline(:to="{name: 'Album', params: {id: item.data.id} }") {{ item.data.name }}

      //- default
      div(v-else)
        pre {{ item }}
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage, cloverLink, makeBn, prettyBigNumber } from '@/utils'
import { fromWei } from 'web3-utils'
import ChatIcon from '@/components/Icons/ChatIcon'
import CoinIcon from '@/components/Icons/CoinIcon'

export default {
  name: 'ActivityItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    noImg: Boolean
  },
  computed: {
    isMyLog () {
      const me = this.$store.state.account
      const u = this.item.data.userAddress || this.item.userAddress
      const isMine = me && u && (me.toLowerCase() === u.toLowerCase())
      return !isMine ? '' : 'bg-lightest-green'
    },
    // userName () {
    //   return this.parseUser(this.item.user || {address: this.item.userAddress})
    // },
    newPrice () {
      if (!this.item.data.price) return null
      const p = parseFloat(fromWei(this.item.data.price))
      return p.toLocaleString()
    },

    ...mapGetters(['userName', 'cloversBankAddress'])
  },
  methods: {
    cloverImage,
    cloverLink,
    getUser (key) {
      if (!this.item.userAddresses) return 'NO USER'
      let i = this.item.userAddresses && this.item.userAddresses.findIndex(i => i.id === key)
      if (i > -1) {
        return this.userName(this.item.userAddresses[i].address)
      } else {
        return 'NO USER'
      }
    },
    isBurned ({ name, data }) {
      return name === 'Clovers_Transfer' && data._to.startsWith('0x000000000')
    },
    isBorn ({ name, data }) {
      console.log({name, data})
      return name === 'Clovers_Transfer' && data._from.startsWith('0x000000000')
    },
    isFromClovers ({ name, data }) {
      return name === 'Clovers_Transfer' && this.cloversBankAddress.toLowerCase() === data._from.toLowerCase()
    },
    price (string, decimals) {
      // let n = fromWei(string || '0')
      let n = makeBn(string)
      // get rid of trailing zeros
      return parseFloat(prettyBigNumber(n, decimals))
    },
    userRt (addr) {
      if (typeof addr === 'object') return addr
      return { name: 'User', params: { addr: addr } }
    }
  },
  components: { ChatIcon, CoinIcon }
}
</script>

<style>
.activity-itm__icon{
  width:2.2rem;
  text-align: center;
}
</style>
