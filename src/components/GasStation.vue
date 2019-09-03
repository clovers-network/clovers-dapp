<template lang="pug">
.fixed.bottom-0.left-0.m4.flex.items-end
    a.pointer.white.flex.items-center.rounded.p1.border.opacity-75.hover-opacity-100(
        href="https://ethgasstation.info"
        target="_blank"
        id="gasLink"
        :class="gasClass"
        )
        gas-icon(:width="30" :height="30")
        span.display-none &nbsp; {{gasPrice || 'N/A'}} Gwei &nbsp;
</template>
<script>

import GasIcon from '@/components/Icons/GasIcon'
import MoreInformation from '@/components/MoreInformation'
import {mapState} from 'vuex'
export default {
  name: 'GasStation',
  data () {
    return {
      showPrice: false,
      info: false
    }
  },
  components: { GasIcon, MoreInformation },
  computed: {
    ...mapState(['gasPrice']),
    relatively () {
      return this.gasPrice < 5 ? 'low' : this.gasPrice < 10 ? 'medium' : 'high'
    },
    gasClass () {
      console.log(this.gasPrice)
      return {
        'bg-black': !this.gasPrice,
        'bg-green': this.gasPrice && this.gasPrice < 5,
        'bg-yellow': this.gasPrice && this.gasPrice <= 10,
        'bg-red': this.gasPrice && this.gasPrice > 10
      }
    }
  }
}
</script>
<style lang="css">
    #gasLink:hover span {
        display: inline-block !important;
    }
</style>
