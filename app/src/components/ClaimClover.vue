<template>
  <div class="bg-dark-gray white px2 py3">
    <div class="flex items-center justify-between">
      <div class="relative">
        <div class="h2">
          <clv :board="miner.byteBoardToRowArray(clover.byteBoard)"></clv>
        </div>
        <div>
          <svg-text :movesString="clover.movesString"></svg-text>
        </div>
      </div>
      <div v-if="!clover.claimed" class="">
        <form @submit.prevent="trigger">
          <div>
            <label class="label">List on flip market for</label>
            <input class="py2 px3 bg-black border-none border-bottom white h3" type="number" v-model="flipPrice">
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
      <div v-else>
        Claimed {{ claimDate }}
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
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
    data () {
      return {
        flipPrice: 100
      }
    },
    computed: {
      claimDate () {
        return moment(this.clover.claimed).fromNow()
      }
    },
    methods: {
      trigger () {
        this.miner.playGameMovesString(this.clover.movesString)
        this.miner.adminRegisterGame().then(() => {
          this.$emit('claimed', this.clover)
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    components: { SvgText }
  }
</script>
