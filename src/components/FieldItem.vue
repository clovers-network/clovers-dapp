<template lang="pug">
  li.p2.col-6.sm-col-4.lg-col-3.relative
    .pb-100.pt3.relative.pick-border.rounded
      router-link(:to="{ query: {pick: clover.movesString } }")
        .absolute.overlay.flex.items-end.justify-center
          img.block.pointer.p3(:src="cloverImage(clover)" @click="viewSingle = clover")
      heart-icon.icon.h2.absolute.top-0.left-0.mt2.ml2(:active="isSaved" @click="save" v-if="inField")
      .icon.h6.absolute.top-0.left-0.ml2.mt2.pointer(v-else @click="remove")
        span Remove

      .green.absolute.top-0.right-0.mt2.mr2(v-if="clover.symmetrical")
        symmetry-icons(:board="clover")
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage } from '@/utils'
import HeartIcon from '@/components/Icons/HeartIcon'
import SymmetryIcons from '@/components/Icons/SymmetryIcons'

export default {
  name: 'FieldItem',
  props: {
    clover: {
      type: Object,
      required: true
    },
    inField: Boolean // default falsy
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
    save () {
      this.$store.commit('SAVE_CLOVER', this.clover)
    },
    remove () {
      let yes = window.confirm('Are you sure? This can\'t be undone...')
      if (yes) {
        this.$store.commit('SAVE_CLOVER', this.clover)
      }
    }
  },
  components: { HeartIcon, SymmetryIcons }
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
