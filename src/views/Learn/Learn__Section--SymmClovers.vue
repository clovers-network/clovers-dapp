<template lang="pug">
  learn-frame
    .absolute.top-0.left-0.w-100.h-100.flex.items-center.justify-center
      .relative
        figure(style="width:162px")
          clv(:moveString="exampleClvr", :autoPlay="true", @endPlayMoves="step")
        transition(name="fade")
          .absolute.left-0.col-6.border-right.green(style="border-right-style:dashed; height:130%; top:-15%", v-show="no === 1")
            .absolute.top-0.right-0.pb3(style="transform:translate(50%, -100%) scale(0.75, 0.75)")
              symmetry-icons(:board="clover")
            .absolute.top-100.right-0.pt3.transl-x-50
              button.border.rounded.green.px3.py1.h5.pointer.nowrap(@click="step", v-if="no === 1") Show Reward
        transition(name="fade")
          .absolute.top-100.left-0.col-12.font-mono.pt3.flex.justify-center(v-show="no === 2")
            .nowrap {{cleanReward}} coins = XXXX USD
    .absolute.left-0.w-100.pt2.px3.pb3.center(:class="no > 1 ? 'top-0' : 'bottom-0'")
      .font-ext.h2.mx-auto(v-html="text", style="max-width:26em")
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'
import Reversi from 'clovers-reversi'
import BigNumber from 'bignumber.js'
import { abbrvNum } from '@/utils'
import { fromWei } from 'web3-utils'
const reversi = new Reversi()
export default {
  name: 'Learn__Section--SymmClovers',
  data () {
    return {
      no: 0,
      text: "Now, let's say you found a <b>symmetrical</b> clover.",
      exampleClvr: 'C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3',
      reward: null
    }
  },
  computed: {
    clover () {
      return reversi.playGameMovesString(this.exampleClvr)
    },
    cleanReward () {
      return this.reward ? abbrvNum(fromWei(this.reward.toString(10))) : '...'
    }
  },
  methods: {
    step () {
      this.no++
      switch (this.no) {
        case 1:
          this.text = 'Clovers with symmetry are rare.<br>If you find one, you can claim a reward!'
          break
        case 2:
          this.text = 'This clover is worth <b>' + this.cleanReward + ' clover coins</b>.<br>You can use these coins to buy and sell clovers, or exchange them for Ether (ETH).'
          break
      }
    },
    setReward () {
      const syms = this.clover.returnSymmetriesAsBN()
      this.$store.dispatch('getReward', syms).then(wei => {
        wei = new BigNumber(wei)
        this.reward = wei
      })
    }
  },
  created () {
    this.setReward()
  },
  components: { LearnFrame, SymmetryIcons }
}
</script>

<style>
</style>
