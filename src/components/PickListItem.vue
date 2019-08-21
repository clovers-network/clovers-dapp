<template lang="pug">
  li.px2.green
    router-link.block.relative(:to="to")
      img.block.pointer(:src="image" :width="diameter" :height="diameter")

      .green.absolute(v-if="pick.symmetrical", style="top:0;right:0;transform:translate(50%,-50%)")
        symmetry-icons.h7(:board="pick")

      //- .col-3.pr2.h7.font-mono {{ date }}

      //- .pr1.h6.font-mono
      //-   button.btn.btn-big.border.border-green.regular(@click="removeClover") Remove

      //- .pr2.h6.font-mono
      //-   router-link.btn.btn-big.bg-green.white.nowrap.regular(:to="{name: 'Account/Keep', params: {movesString: pick.movesString}}") Keep/Sell
</template>

<script>
import moment from 'moment'
import { cloverImage } from '@/utils'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'PickListItem',
  components: { SymmetryIcons },
  props: {
    pick: {
      type: Object,
      default () {
        return {
          board: '0'
        }
      }
    },
    diameter: { type: Number, default: 160 }
  },
  computed: {
    isSym () {
      return this.pick.symmetrical
    },
    image () {
      return cloverImage(this.pick, 160)
    },
    date () {
      return moment(this.pick.createdAt).fromNow()
    },
    to () {
      if (!this.pick.movesString) {
        return { name: 'Garden' }
      } else {
        return { query: { pick: this.pick.movesString } }
      }
    }
  },
  methods: {
    removeClover () {
      this.$store.commit('REMOVE_SAVED_CLOVER', this.pick)
    }
  }
}
</script>
