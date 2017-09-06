<template>
  <div class="bg-dark-gray white px2 py3">
    <div class="flex items-center justify-between">
      <div class="relative mx3">
        <div class="h2">
          <clv :board="miner.byteBoardToRowArray(cloverData.byteBoard)"></clv>
        </div>
        <div>
          <svg-text :movesString="cloverData.movesString"></svg-text>
        </div>
      </div>
      <div v-if="cloverData.removed" class="px3 flex-auto">
        <p class="h1 m0 lh1">🗑 Removed {{ removeDate }}</p>
      </div>
      <div v-else-if="cloverData.claimed" class="px3 flex-auto">
        <p class="h1 m0 lh1">✨ Claimed {{ claimDate }}</p>
      </div>
      <div v-else class="col-8 lg-col-7">
        <form @submit.prevent="trigger">
          <div class="mb2 flex flex-wrap">
            <div class="col-6 px3">
              <label class="block right-align h2">You will receive</label>
              <input class="input big white right-align" disabled :value="reward">
            </div>
            <div class="col-6 px3">
              <label class="block right-align h2">List on flip market for</label>
              <div class="flex content-stretch items-center border-bottom">
                <input class="input big white right-align" style="padding-right:0" type="number" v-model="flipPrice">
                <span class="h1">♧</span>
              </div>
            </div>
            <div class="mt3 px3 col-12">
              <button type="submit" class="btn btn-outline py3 col-12 regular h3">
                <span>Claim Clover and register on Flip Market</span>
                <span class="pl2 sending" v-if="submitting">✨</span>
              </button>
              <p class="right-align mt1 mb0">
                <button @click="remove" type="button" class="border-none bg-transparent white h5 pointer">Remove clover</button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapGetters, mapMutations } from 'vuex'
  import SvgText from '@/components/TextPath'
  import Clover from '../assets/clovers'

  export default {
    name: 'claim-clover',
    data () {
      return {
        submitting: false,
        clover: new Clover()
      }
    },
    props: {
      cloverData: {
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
        return moment(this.cloverData.claimed).fromNow()
      },
      removeDate () {
        return moment(this.cloverData.removed).fromNow()
      },
      flipPrice: {
        get () {
          return this.cloverData.startPrice || 100
        },
        set (newVal) {
          this.updateCloverPrice({
            newVal,
            clover: this.cloverData
          })
        }
      },
      reward () {
        Object.assign(this.clover, this.cloverData)
        return (this.clover.calcFinderFees(this.symmetries) || 100) + ' ♧'
      },
      ...mapGetters({
        symmetries: 'symmetries'
      })
    },
    methods: {
      trigger () {
        console.log('trigger')
        this.submitting = true
        this.miner.startPrice = this.flipPrice
        this.miner.playGameMovesString(this.cloverData.movesString)
        this.miner.register().then((res) => {
          this.submitting = false
          this.$emit('claimed', res)
        }).catch((err) => {
          console.log(err)
          this.submitting = false
        })
      },
      remove () {
        this.$emit('remove')
      },

      ...mapMutations({
        updateCloverPrice: 'UPDATE_CLOVER_PRICE'
      })
    },
    components: { SvgText }
  }
</script>
