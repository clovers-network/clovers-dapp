<template>
  <div class="h4 p2" :class="{'bg-lightest-green': isMyLog}">
    <div :class="{'opacity-50': isBurned(item)}" class="flex justify-start items-center">
      <div class="font-mono light-green h6 xs-hide">#{{ item.blockNumber }}</div>

      <!-- Clover Transfered -->
      <template v-if="item.name === 'Clovers_Transfer'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="isBurned(item) ? '' : cloverLink(item.data._tokenId)">
            <img :src="cloverImage(item.data._tokenId, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <!-- <div class="pr3 h6">bought by</div> -->
        <template v-if="isBurned(item)">
          <div class="pr3 h2 line-height-1">&times;</div>
          <div class="pr1">Clover burned (invalid)</div>
        </template>
        <template v-else-if="isFromClover(item)">
          <div class="pr3 h2">&xodot;</div>
          <div class="pr1 light-green">Sent to</div>
          <router-link class="block font-mono truncate hover-underline" :to="userRt(item.data._to)">{{ userName(item.data._to) }}</router-link>
        </template>
        <template v-else-if="isBorn(item)">
          <div class="pr3 h2">&xodot;</div>
          <div class="pr1 light-green">Was born ☘️</div>
        </template>
        <template v-else>
          <div class="pr3 h2">&xodot;</div>
          <router-link class="block font-mono truncate hover-underline" :to="userRt(item.data._from)">{{ userName(item.data._from) }}</router-link>
          <div class="pr1 light-green">&nbsp;sent to&nbsp;</div>
          <router-link class="block font-mono truncate hover-underline" :to="userRt(item.data._to)">{{ userName(item.data._to) }}</router-link>
        </template>
      </template>

      <!-- Clover price updated -->
      <template v-else-if="item.name === 'SimpleCloversMarket_updatePrice'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img :src="cloverImage(item.data._tokenId, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <div class="pr3 h2 line-height-1">♣︎</div>
        <div v-if="item.data.price === '0'">
          <span class="light-green">Removed from Market</span>
        </div>
        <div v-else>
          <span class="light-green">Price is now </span>
          <span class="">{{ price(item.data.price) }} ♣︎</span>
        </div>
      </template>

      <!-- Bought Tokens -->
      <template v-else-if="item.name === 'ClubTokenController_Buy'">
        <div class="h1 mr3 sm-mx3 center black border circle" style="width:50px;height:50px">&clubs;</div>
        <div class="pr3 h3 line-height-1">&nearr;</div>
        <div class="font-mono truncate">
          <router-link class="hover-underline" :to="'/users/' + item.data.buyer">{{ userName(item.data.buyer) }}</router-link>
          </div>
        <div class="nowrap pl1">
          <span class="light-green">bought </span>
          <span>{{ price(item.data.tokens) }} &clubs;</span>
        </div>
      </template>

      <!-- Sold Tokens -->
      <template v-else-if="item.name === 'ClubTokenController_Sell'">
        <div class="h1 mr3 sm-mx3 center black border circle" style="width:50px;height:50px">&clubs;</div>
        <div class="pr3 h3 line-height-1">&searr;</div>
        <router-link class="font-mono truncate hover-underline" :to="userRt(item.data.seller)">{{ userName(item.data.seller) }}</router-link>
        <div class="nowrap pl1">
          <span class="light-green">sold </span>
          <span class="font-mono">{{ price(item.data.tokens) }} &clubs;</span>
        </div>
      </template>

      <!-- Bought RFT Shares -->
      <template v-else-if="item.name === 'CurationMarket_Buy'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img :src="cloverImage(item.data._tokenId, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <div class="pr3 h6 red">RFT</div>
        <div class="font-mono truncate red">{{ userName(item.data.buyer) }}</div>
        <div class="red pl1">
          <span class="opacity-50">bought </span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </template>

      <!-- Sold RFT Shares -->
      <template v-else-if="item.name === 'CurationMarket_Sell'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="cloverLink(item.data._tokenId)">
            <img :src="cloverImage(item.data._tokenId, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <div class="pr3 h6 red">RFT</div>
        <div class="font-mono truncate red">{{ userName(item.data.seller) }}</div>
        <div class="red pl1">
          <span class="opacity-50">sold </span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </template>

      <!-- New Comment -->
      <template v-else-if="item.name === 'Comment_Added'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="{name: 'Clover/Comments', params: {board: item.data.board}}">
            <img :src="cloverImage(item.data.board, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <div class="pr3 h3">
          <chat-icon :size="15" :blank="true" :invert="false"/>
        </div>
        <div class="light-green">New comment by&emsp;</div>
        <router-link class="block font-mono truncate hover-underline" :to="userRt(item.data.userAddress)">{{ item.data.userName }}</router-link>
      </template>

      <!-- Renamed -->
      <template v-else-if="item.name === 'CloverName_Changed'">
        <div class="pr3 sm-px3 flex-none">
          <router-link :to="cloverLink(item.data.board)">
            <img :src="cloverImage(item.data.board, 50)" style="width:50px;height:50px" class="block"/>
          </router-link>
        </div>
        <div class="pr3 h3">✎</div>
        <div>
          <span class="light-green ">is now named&emsp;</span>
          <span>{{ item.data.newName }}</span>
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

export default {
  name: 'ActivityItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['userName']),
    isMyLog () {
      const me = this.$store.state.account
      return me && Object.values(this.item.data).includes(me)
    }
  },
  methods: {
    cloverImage,
    cloverLink,
    formatName (name) {
      var re = /[0-9A-Fa-f]{6}/g
      return !re.test(name) && name
    },
    isBurned ({ name, data }) {
      return name === 'Clovers_Transfer' && data._to.startsWith('0x000000000')
    },
    isBorn ({ name, data }) {
      return name === 'Clovers_Transfer' && data._from.startsWith('0x000000000')
    },
    isFromClover ({ name, data }) {
      return name === 'Clovers_Transfer' && window.contracts && window.contracts.Clovers.instance && window.contracts.Clovers.instance._address.toLowerCase() === data._from.toLowerCase()
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
  components: { ChatIcon }
}
</script>
