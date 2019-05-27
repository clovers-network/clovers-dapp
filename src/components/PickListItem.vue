<template lang="pug">
  li.px2
    .py3.justify-between.items-center.green
      .center.relative
        .sym-badge.absolute.h7.p1(v-if="isSym") SYM
        router-link(:to="to")
          img.pointer(:src="image" width="160" height="160")

      //- .col-3.pr2.h7.font-mono {{ date }}

      //- .pr1.h6.font-mono
      //-   button.btn.btn-big.border.border-green.regular(@click="removeClover") Remove

      //- .pr2.h6.font-mono
      //-   router-link.btn.btn-big.bg-green.white.nowrap.regular(:to="{name: 'Account/Keep', params: {movesString: pick.movesString}}") Keep/Sell
</template>

<script>
import moment from 'moment'
import { cloverImage } from '@/utils'

export default {
  name: 'PickListItem',
  props: {
    pick: {
      type: Object,
      default () {
        return {
          board: '0'
        }
      }
    }
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
        return { name: 'Field' }
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
