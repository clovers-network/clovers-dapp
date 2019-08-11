<template lang="pug">
  .h5.sm-h4.p2(:class='isMyLog')
    .flex.justify-start.items-center(:class="{'opacity-50': isBurned(item)}")
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
          .pr1.opacity-50 Sent to
          router-link.block.font-mono.truncate.hover-underline(:to='userRt(item.data._to)') {{ userName }}
        template(v-else-if='isBorn(item)')
          .activity-itm__icon.mr2.sm-mr3.h2 &xodot;
          .pr1.opacity-50 Was born &#x2618;&#xFE0F;
        template(v-else='')
          .activity-itm__icon.mr2.sm-mr3.h2 &xodot;
          router-link.block.font-mono.truncate.hover-underline(:to='userRt(item.data._to)') {{ userName }}
          .opacity-50.nowrap &ensp;bought Clover from&ensp;
          router-link.block.font-mono.truncate.hover-underline(:to='userRt(item.data._from)') {{ parseUser({ address: item.data._from }) }}
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
          coin-icon.mr1
          | {{ newPrice }}&ensp;
      //- Bought Tokens
      template(v-else-if="item.name === 'ClubTokenController_Buy'")
        .h1.mr2.sm-mx3.center.black.border.circle(v-if='!noImg' style='flex:0 0 50px;height:50px') &clubs;&#xFE0E;
        .activity-itm__icon.mr2.sm-mr3.h3.line-height-1 &nearr;
        .font-mono.truncate
          router-link.hover-underline(:to="'/users/' + item.data.buyer") {{ userName }}
        .pl1.flex.items-center
          span.opacity-50 bought&ensp;
          coin-icon.mr1
          span {{ price(item.data.tokens) }}
      //- Sold Tokens
      template(v-else-if="item.name === 'ClubTokenController_Sell'")
        .h1.mr2.sm-mx3.center.black.border.circle(v-if='!noImg' style='width:50px;height:50px') &clubs;&#xFE0E;
        .activity-itm__icon.mr2.sm-mr3.h3.line-height-1 &searr;
        router-link.font-mono.truncate.hover-underline(:to='userRt(item.userAddress)') {{ userName }}
        .pl1.flex.items-center
          span.opacity-50 sold&ensp;
          coin-icon.mr1
          span {{ price(item.data.tokens) }}
      //- Bought RFT Shares
      template(v-else-if="item.name === 'CurationMarket_Buy'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data._tokenId)')
            img.block(:src='cloverImage(item.data._tokenId, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h6(:class='{ red: !noImg }') RFT
        .font-mono.truncate(:class='{ red: !noImg }')
          router-link.hover-underline(:to='userRt(item.userAddress)') {{ userName }}
        .pl1(:class='{ red: !noImg }')
          span.opacity-50 bought&ensp;
          span {{ price(item.data.tokens) }} shares
      //- Sold RFT Shares
      template(v-else-if="item.name === 'CurationMarket_Sell'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data._tokenId)')
            img.block(:src='cloverImage(item.data._tokenId, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h6(:class='{ red: !noImg }') RFT
        .font-mono.truncate(:class='{ red: !noImg }')
          router-link.hover-underline(:to='userRt(item.userAddress)') {{ userName }}
        .pl1(:class='{ red: !noImg }')
          span.opacity-50 sold&ensp;
          span {{ price(item.data.tokens) }} shares
      //- New Comment
      template(v-else-if="item.name === 'Comment_Added'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to="{name: 'Clover', params: {board: item.data.board}}")
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3
          chat-icon(:size='15' :blank='true' :invert='false')
        .opacity-50.nowrap Comment by&ensp;
        router-link.block.font-mono.truncate.hover-underline(:to='userRt(item.data.userAddress)') {{ item.data.userName }}
      //- Renamed
      template(v-else-if="item.name === 'CloverName_Changed'")
        .mr2.sm-mx3.flex-none(v-if='!noImg')
          router-link(:to='cloverLink(item.data.board)')
            img.block(:src='cloverImage(item.data.board, 50)' style='width:50px;height:50px')
        .activity-itm__icon.mr2.sm-mr3.h3 &#x270E;
        div
          span.opacity-50 Renamed&ensp;
          router-link.hover-underline(:to="{name: 'Clover', params:{board:item.data.board}}") {{ item.data.newName }}
      div(v-else)
        pre.
          \n{{ item }}

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
    userName () {
      return this.parseUser(this.item.user || {})
    },
    newPrice () {
      const p = parseFloat(fromWei(this.item.data.price))
      return p.toLocaleString()
    },

    ...mapGetters({
      parseUser: 'userName',
      cloversBankAddress: 'cloversBankAddress'
    })
  },
  methods: {
    cloverImage,
    cloverLink,

    // formatName (name) {
    //   var re = /[0-9A-Fa-f]{6}/g
    //   return !re.test(name) && name
    // },
    isBurned ({ name, data }) {
      return name === 'Clovers_Transfer' && data._to.startsWith('0x000000000')
    },
    isBorn ({ name, data }) {
      return name === 'Clovers_Transfer' && data._from.startsWith('0x000000000')
    },
    isFromClovers ({ name, data }) {
      return name === 'Clovers_Transfer' && this.cloversBankAddress === data._from.toLowerCase()
    },
    price (string, decimals) {
      // let n = fromWei(string || '0')
      let n = makeBn(string)
      // get rid of trailing zeros
      return parseFloat(prettyBigNumber(n, decimals))
    },
    userRt (addr) {
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
