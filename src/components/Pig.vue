\
<template lang="pug">
  div
    .py3
      nav
        h6.center.h3 Clover Pig
        toggle-btn.mx-auto.my3(:active="minerOn"  theme="white"  @click="togglePig" @swiperight="togglePig()" @swipeleft="togglePig()")
        .flex.justify-between.items-center
          .col-6.px2.h3
            div Speed
            .font-exp.mt1 {{ hashrate }}/s
          .col-6.px2.h3(:class="mined !== 0 ? 'pointer' : ''" @click="$emit('viewPicks')")
            .nowrap Rare Clovers
            .font-exp.mt1 {{ symms }}
            .h7.pt1 ~ {{ mined.toLocaleString() }} mined
</template>

<script>
import ToggleBtn from '@/components/ToggleBtn'

import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { cloverIsMonochrome } from '@/utils'
import CloverWorker from 'worker-loader!../assets/clover-worker'
import moment from 'moment'

export default {
  name: 'Pig',
  data () {
    return {}
  },
  computed: {
    ...mapState(['hashrate', 'miners', 'mined']),
    minerOn () {
      return this.miners.length > 0
    },
    symms () {
      return this.$store.state.miningStats.symms
    }
  },
  methods: {
    togglePig (l) {
      if (this.minerOn) {
        this.stop()
      } else {
        this.mine()
      }
    },
    ...mapActions(['mine', 'stop'])
  },
  components: { ToggleBtn }
}
</script>

<style lang="css">
#miner {
  max-height: calc(100vh - 56px);
  overflow: auto;
}
</style>
