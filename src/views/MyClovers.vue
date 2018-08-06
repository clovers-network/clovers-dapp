<template>
  <div class="md-pb3">
    <ul class="list-reset md-flex flex-wrap justify-around items-center m0 md-px1">
      <li v-for="(clover, i) in userClovers" :key="i" class="md-col-6 md-px1">
        <div is="router-link" tag="div" :to="cloverLink(clover)" class="flex py2 border-bottom green">
          <div class="col-4 center">
            <img class="pointer" :src="cloverImage(clover, 64)" width="64" height="64"/>
          </div>

          <template v-if="inCurationMarket(clover)">
            <div class="col-5 flex flex-column justify-center pr3">
              <p class="h7 m0">Market Cap &clubs;</p>
              <p class="h4 m0 truncate font-mono">0</p>
            </div>
            <div class="col-3 flex flex-column justify-center pr2">
              <p class="h7 m0">&clubs; / Share</p>
              <p class="h4 m0 truncate font-mono">0</p>
            </div>
          </template>

          <template v-else>
            <div class="col-5 flex flex-column justify-center pr3">
              <p class="h7 m0">Name</p>
              <p class="h4 m0 truncate font-mono">{{ clover.name }}</p>
            </div>
            <div class="col-3 flex flex-column justify-center pr2">
              <p class="h7 m0">Cost &clubs;</p>
              <p v-if="forSale(clover)" class="h4 m0">{{ cloverPrice(clover) }}</p>
              <p class="h4 m0 font-mono">---</p>
            </div>
          </template>

          <div class="col-1 center flex flex-column justify-center">
            <img class="pointer" src="~../assets/icons/arrow-right.svg" width="18" height="18"/>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloverLink, cloverImage, pluralize } from '@/utils'

export default {
  name: 'MyClovers',
  computed: {
    ...mapGetters(['userClovers', 'curationMarketAddress'])
  },
  methods: {
    cloverLink,
    cloverImage,
    pluralize,

    cloverPrice ({ price }) {
      return price.toFormat(0)
    },
    forSale ({ price }) {
      return price.gt(0)
    },
    inCurationMarket ({ owner }) {
      return owner === this.curationMarketAddress
    },
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    },
    showFilters () {
      this.filtersVisible = true
    },
    hideFilters () {
      this.filtersVisible = false
    }
  }
}
</script>
