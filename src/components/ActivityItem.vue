<template>
  <div
    :class="isMyLog"
    class="h5 sm-h4 p2">
    <div
      :class="{'opacity-50': isBurned(item)}"
      class="flex justify-start items-center">
      <div
        :class="{mr3: noImg}"
        class="font-mono opacity-50 h6 xs-hide">#{{ item.blockNumber }}</div>

      <!-- Clover Transfered -->
      <template v-if="item.name === 'Clovers_Transfer'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="isBurned(item) ? '' : cloverLink(item.data._tokenId)">
            <img
              :src="cloverImage(item.data._tokenId, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <!-- <div class="pr3 h6">bought by</div> -->
        <template v-if="isBurned(item)">
          <div class="activity-itm__icon mr2 sm-mr3 h2 line-height-1">&times;</div>
          <div class="pr1">Clover burned (invalid)</div>
        </template>
        <template v-else-if="isFromClovers(item)">
          <div class="activity-itm__icon mr2 sm-mr3 h2">&xodot;</div>
          <div class="pr1 opacity-50">Sent to</div>
          <router-link
            :to="userRt(item.data._to)"
            class="block font-mono truncate hover-underline">{{ userName }}</router-link>
        </template>
        <template v-else-if="isBorn(item)">
          <div class="activity-itm__icon mr2 sm-mr3 h2">&xodot;</div>
          <div class="pr1 opacity-50">Was born ☘️</div>
        </template>
        <template v-else>
          <div class="activity-itm__icon mr2 sm-mr3 h2">&xodot;</div>
          <router-link
            :to="userRt(item.data._from)"
            class="block font-mono truncate hover-underline">{{ userName }}</router-link>
          <div class="opacity-50 nowrap">&ensp;sent to&ensp;</div>
          <router-link
            :to="userRt(item.data._to)"
            class="block font-mono truncate hover-underline">{{ userName }}</router-link>
        </template>
      </template>

      <!-- Clover price updated -->
      <template v-else-if="item.name === 'SimpleCloversMarket_updatePrice'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img
              :src="cloverImage(item.data._tokenId, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <div class="activity-itm__icon mr2 sm-mr3 h2 line-height-1">&clubs;&#xfe0e;</div>
        <div v-if="item.data.price === '0'">
          <span class="opacity-50">Removed from Market</span>
        </div>
        <div v-else>
          <span class="opacity-50">Price is now&ensp;</span>
          <span>{{ price(item.data.price) }} <coin-icon/></span>
        </div>
      </template>

      <!-- Bought Tokens -->
      <template v-else-if="item.name === 'ClubTokenController_Buy'">
        <div
          v-if="!noImg"
          class="h1 mr2 sm-mx3 center black border circle"
          style="flex:0 0 50px;height:50px">&clubs;&#xfe0e;</div>
        <div class="activity-itm__icon mr2 sm-mr3 h3 line-height-1">&nearr;</div>
        <div class="font-mono truncate">
          <router-link
            :to="'/users/' + item.data.buyer"
            class="hover-underline">{{ userName }}</router-link>
        </div>
        <div class="nowrap pl1">
          <span class="opacity-50">bought&ensp;</span>
          <span>{{ price(item.data.tokens) }} &clubs;&#xfe0e;</span>
        </div>
      </template>

      <!-- Sold Tokens -->
      <template v-else-if="item.name === 'ClubTokenController_Sell'">
        <div
          v-if="!noImg"
          class="h1 mr2 sm-mx3 center black border circle"
          style="width:50px;height:50px">&clubs;&#xfe0e;</div>
        <div class="activity-itm__icon mr2 sm-mr3 h3 line-height-1">&searr;</div>
        <router-link
          :to="userRt(item.userAddress)"
          class="font-mono truncate hover-underline">{{ userName }}</router-link>
        <div class="nowrap pl1">
          <span class="opacity-50">sold&ensp;</span>
          <span>{{ price(item.data.tokens) }} &clubs;&#xfe0e;</span>
        </div>
      </template>

      <!-- Bought RFT Shares -->
      <template v-else-if="item.name === 'CurationMarket_Buy'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img
              :src="cloverImage(item.data._tokenId, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <div
          :class="{ red: !noImg }"
          class="activity-itm__icon mr2 sm-mr3 h6">RFT</div>
        <div
          :class="{ red: !noImg }"
          class="font-mono truncate">
          <router-link
            :to="userRt(item.userAddress)"
            class="hover-underline">{{ userName }}</router-link>
        </div>
        <div
          :class="{ red: !noImg }"
          class="pl1">
          <span class="opacity-50">bought&ensp;</span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </template>

      <!-- Sold RFT Shares -->
      <template v-else-if="item.name === 'CurationMarket_Sell'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img
              :src="cloverImage(item.data._tokenId, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <div
          :class="{ red: !noImg }"
          class="activity-itm__icon mr2 sm-mr3 h6">RFT</div>
        <div
          :class="{ red: !noImg }"
          class="font-mono truncate">
          <router-link
            :to="userRt(item.userAddress)"
            class="hover-underline">{{ userName }}</router-link>
        </div>
        <div
          :class="{ red: !noImg }"
          class="pl1">
          <span class="opacity-50">sold&ensp;</span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </template>

      <!-- New Comment -->
      <template v-else-if="item.name === 'Comment_Added'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="{name: 'Clover/Comments', params: {board: item.data.board}}">
            <img
              :src="cloverImage(item.data.board, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <div class="activity-itm__icon mr2 sm-mr3 h3">
          <chat-icon
            :size="15"
            :blank="true"
            :invert="false"/>
        </div>
        <div class="opacity-50 nowrap">Comment by&ensp;</div>
        <router-link
          :to="userRt(item.data.userAddress)"
          class="block font-mono truncate hover-underline">{{ item.data.userName }}</router-link>
      </template>

      <!-- Renamed -->
      <template v-else-if="item.name === 'CloverName_Changed'">
        <div
          v-if="!noImg"
          class="mr2 sm-mx3 flex-none">
          <router-link :to="cloverLink(item.data.board)">
            <img
              :src="cloverImage(item.data.board, 50)"
              style="width:50px;height:50px"
              class="block">
          </router-link>
        </div>
        <div class="activity-itm__icon mr2 sm-mr3 h3">✎</div>
        <div>
          <span class="opacity-50">Renamed&ensp;</span>
          <router-link
            :to="{name: 'Clover', params:{board:item.data.board}}"
            class="hover-underline">{{ item.data.newName }}</router-link>
        </div>
      </template>

      <div v-else>
        <pre>{{ item }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage, cloverLink, makeBn, prettyBigNumber } from '@/utils'
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
      return !isMine ? '' : this.noImg ? 'bg-lighten-2' : 'bg-lightest-green'
    },
    userName () {
      return this.parseUser(this.item.user || {})
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
      let n = makeBn(string)
      // get rid of trailing zeros
      return parseFloat(prettyBigNumber(n, decimals))
    },
    userRt (addr) {
      return {name: 'User', params: {addr: addr}}
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
