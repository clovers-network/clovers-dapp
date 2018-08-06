<template lang="pug">
  section
    header.flex.border-bottom
      .col-6.p3.border-right
        small.lh2.block ETH / ♣
        .font-exp.mt1 0.05
      .col-6.p3
        small.lh2.block Value (ETH)
        .font-exp.mt1 17,461.70
    section
      .relative
        span.block.absolute.left-0.top-0.p2.z1 All time, ETH
        chart.border-bottom(market="ClubToken")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      section.py3
        button.h-bttm-bar.bg-green.white.flex.col-12
          span.block.m-auto.font-exp Confirm
</template>

<script>
import { mapGetters } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'

export default {
  name: 'Trade',
  data () {
    return {
      view: 'buy'
    }
  },
  computed: {
    ...mapGetters([])
  },
  components: { ViewNav, Chart }
}
</script>
