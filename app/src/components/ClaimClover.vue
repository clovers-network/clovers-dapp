<template>
  <div class="bg-dark-gray white px2 py3">
    <div class="flex items-center justify-between">
      <div class="relative mx3">
        <div class="h2">
          <clv :board="miner.byteBoardToRowArray(clover.byteBoard)"></clv>
        </div>
        <div>
          <svg-text :movesString="clover.movesString"></svg-text>
        </div>
      </div>
      <div v-if="!clover.claimed" class="col-8 lg-col-7">
        <form @submit.prevent="trigger">
          <div class="mb2 flex flex-wrap">
            <div class="col-6 px3">
              <label class="block right-align h2">You will receive</label>
              <input class="input big white right-align" disabled :value="reward">
            </div>
            <div class="col-6 px3">
              <label class="block right-align h2">List on flip market for</label>
              <input class="input big white right-align" type="number" v-model="flipPrice">
            </div>
            <div class="mt3 px3 col-12">
              <button type="submit" class="btn btn-outline py3 col-12">Claim Clover and register on Flip Market</button>
            </div>
          </div>
        </form>
      </div>
      <div v-else class="px3">
        Claimed {{ claimDate }}
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapMutations } from 'vuex'
  import SvgText from '@/components/TextPath'

  export default {
    name: 'claim-clover',
    props: {
      clover: {
        type: Object,
        required: true
      },
      miner: {
        type: Object,
        required: true
      }
    },
    computed: {
      claimDate () {
        return moment(this.clover.claimed).fromNow()
      },
      flipPrice: {
        get () {
          return this.clover.startPrice || 100
        },
        set (newVal) {
          this.updateCloverPrice({
            newVal,
            clover: this.clover
          })
        }
      },
      reward () {
        return this.clover.findersFee || 100 + ' ♧'
      }
    },
    methods: {
      trigger () {
        this.miner.startPrice = this.flipPrice
        this.miner.playGameMovesString(this.clover.movesString)
        this.miner.adminRegisterGame().then(() => {
          this.$emit('claimed', this.clover)
        }).catch((err) => {
          console.log(err)
        })
      },

      ...mapMutations({
        updateCloverPrice: 'UPDATE_CLOVER_PRICE'
      })
    },
    components: { SvgText }
  }
</script>
