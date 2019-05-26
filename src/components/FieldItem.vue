<template lang="pug">
  li.p2.col-6.sm-col-4.lg-col-3.relative
    .pb-100.pt3.relative.pick-border.rounded
      router-link(:to="{ query: {pick: clover.movesString } }")
        .absolute.overlay.flex.items-end.justify-center
          // image
          img.block.pointer.p3(:src='cloverImage(clover)' @click='viewSingle = clover')
      // fav btn
      heart-icon.icon.green.h2.absolute.top-0.left-0.mt2.ml2(:active='isSaved' @click='saveClover(clover)')
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import HeartIcon from '@/components/Icons/HeartIcon'

export default {
  name: 'FieldItem',
  props: {
    clover: {
      type: Object,
      required: true
    }
  },
  computed: {
    isSaved () {
      if (!this.picks.length) return false
      return this.picks.findIndex(c => c.board === this.clover.board) >= 0
    },

    ...mapGetters(['picks'])
  },
  methods: {
    cloverImage,

    ...mapMutations({
      saveClover: 'SAVE_CLOVER'
    }),
    ...mapActions(['formatFoundClover'])
  },
  components: { HeartIcon }
}
</script>

<style>
.pick-border {
  color: white;
  border: 1px dashed;
  transition: color 300ms;

  & .icon {
    opacity: 0;
    transition: opacity 300ms;

    &.opacity-100 {
      opacity: 1 !important;
    }
  }

  &:hover {
    color: #01B463;

    & .icon {
      opacity: .3;
    }
  }
}
</style>
