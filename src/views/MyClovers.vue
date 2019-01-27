<template>
  <div class="md-pb3">
    <ul class="list-reset md-flex flex-wrap justify-around items-center m0 md-px1 pb4">
      <li v-for="clover in userClovers" class="md-col-6 md-px1" :key="clover.board">
        <router-link :to="cloverLink(clover)" class="block border-bottom green">
          <clover-item-row :clover="clover" :hideOwner="true" />
        </router-link>
      </li>
      <li class="p2 center" v-if="!userClovers.length">No Clovers To Show...</li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloverLink, cloverImage, pluralize, prettyBigNumber } from '@/utils'
import CloverItemRow from '@/components/CloverItem--Row'

export default {
  name: 'MyClovers',
  components: { CloverItemRow },
  head: {
    title: { inner: 'My Clovers' },
    meta: [{ name: 'description', content: 'A list of the Clovers you own', id: 'meta-desc' }]
  },
  watch: {
    userClovers () {
      console.log(this.userClovers)
    }
  },
  computed: {
    ...mapGetters(['userClovers', 'curationMarketAddress'])
  },
  methods: {
    cloverLink,
    cloverImage,
    pluralize,

    cloverPrice ({ price }) {
      return prettyBigNumber(price, 0)
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
