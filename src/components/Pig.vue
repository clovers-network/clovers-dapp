<template lang="pug">
  nav
    h6.center.h4 Pig
    toggle-btn.mx-auto.my3(:small="true", :active="minerOn"  theme="white"  @click="togglePig" @swiperight="togglePig()" @swipeleft="togglePig()")
    .flex
      .col-4.px2
        .h6 Speed
        .h5.font-exp.mt1 {{ hashrate }}/s
      .col-4.px2
        .h6 Searched
        .h5.font-exp.mt1 {{ mined.toLocaleString() }}
      .col-4.px2(:class="mined !== 0 ? 'pointer' : ''" @click="$emit('viewPicks')")
        .h6.nowrap Found
        .h5.font-exp.mt1 {{ newSyms.length }}
          //- .h7.pt1 ~ {{ mined.toLocaleString() }} mined
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
    ...mapState(['hashrate', 'miners', 'mined', 'newSyms']),
    minerOn () {
      return this.miners.length > 0
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
