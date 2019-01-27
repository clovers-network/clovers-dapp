<template>
  <div>
    <div v-if="item.name === 'Clovers_Transfer'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="px3 flex-none">
          <router-link :to="cloverLink({ board: item.data._tokenId })">
            <img class="block" :src="cloverImage({ board: item.data._tokenId }, 50)">
          </router-link>
        </div>
        <!-- <div class="pr3 h6">bought by</div> -->
        <div class="pr3 h2">&rrarr;</div>
        <div class="pr1 light-green">minted by</div>
        <div class="font-mono truncate">{{ userName(item.data._to) }}</div>
      </div>
    </div>

    <div v-else-if="item.name === 'SimpleCloversMarket_updatePrice'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="px3 flex-none">
          <router-link :to="cloverLink({ board: item.data._tokenId })">
            <img class="block" :src="cloverImage({ board: item.data._tokenId }, 50)">
          </router-link>
        </div>
        <div class="pr3 h2">&udarr;</div>
        <div>
          <span class="light-green">Price is now </span>
          <span class="">{{ price(item.data.price) }} ♣︎</span>
        </div>
      </div>
    </div>

    <div v-else-if="item.name === 'ClubTokenController_Buy'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="h1 mx3 center black border circle" style="width:50px">&clubs;</div>
        <div class="pr3 h3">&nearr;</div>
        <div class="font-mono truncate">{{ userName(item.data.buyer) }}</div>
        <div class="nowrap pl1">
          <span class="light-green">bought </span>
          <span class="font-mono">{{ price(item.data.tokens) }} &clubs;</span>
        </div>
      </div>
    </div>

    <div v-else-if="item.name === 'ClubTokenController_Sell'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="h1 mx3 center black border circle" style="width:50px">&clubs;</div>
        <div class="pr3 h3">&searr;</div>
        <div class="font-mono truncate">{{ userName(item.data.seller) }}</div>
        <div class="nowrap pl1">
          <span class="light-green">sold </span>
          <span class="font-mono">{{ price(item.data.tokens) }} &clubs;</span>
        </div>
      </div>
    </div>

    <div v-else-if="item.name === 'CurationMarket_Buy'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="px3 flex-none">
          <router-link :to="cloverLink({ board: item.data._tokenId })">
            <img class="block" :src="cloverImage({ board: item.data._tokenId }, 50)">
          </router-link>
        </div>
        <div class="pr3 h6 red">NFT</div>
        <div class="font-mono truncate red">{{ userName(item.data.buyer) }}</div>
        <div class="red pl1">
          <span class="opacity-50">bought </span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </div>
    </div>

    <div v-else-if="item.name === 'CurationMarket_Sell'" class="h4 p2">
      <div class="flex justify-start items-center">
        <div class="font-mono light-green h6">#{{ item.blockNumber }}</div>
        <div class="px3 flex-none">
          <router-link :to="cloverLink({ board: item.data._tokenId })">
            <img class="block" :src="cloverImage({ board: item.data._tokenId }, 50)">
          </router-link>
        </div>
        <div class="pr3 h6 red">NFT</div>
        <div class="font-mono truncate red">{{ userName(item.data.seller) }}</div>
        <div class="red pl1">
          <span class="opacity-50">bought </span>
          <span>{{ price(item.data.tokens) }} shares</span>
        </div>
      </div>
    </div>

    <div v-else>
      <pre>{{ item }}</pre>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage, cloverLink, makeBn, prettyBigNumber } from '@/utils'

const logNames = {
  Clovers_Transfer: 'Clover Transferred',

  ClubTokenController_Buy: 'Bought Club Tokens',
  ClubTokenController_Sell: 'Sold Club Tokens',
  // ClubToken_Transfer: '',

  SimpleCloversMarket_updatePrice: 'Clover Price Changed',

  CurationMarket_Buy: 'NFT',
  CurationMarket_Sell: ''
  // CurationMarket_Transfer: ''
}

export default {
  name: 'ActivityItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['userName'])
  },
  methods: {
    cloverImage,
    cloverLink,

    price (string, decimals) {
      let n = makeBn(string)
      // get rid of trailing zeros
      return parseFloat(prettyBigNumber(n, decimals))
    }
  }
}
</script>
