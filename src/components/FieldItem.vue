<template lang="pug">
  article.p1.md-p2.col-6.sm-col-4.lg-col-3.relative
    router-link.relative.block.px1.pt2.md-pb1.md-pt3.pick-border.rounded(:to="{ query: {pick: clover.movesString } }")
      figure.pb-100.relative
        .absolute.overlay.flex.items-center.justify-center
          img.block.pointer.p3(:src="cloverImage(clover)" @click="viewSingle = clover")
      heart-icon.icon.h2.absolute.top-0.left-0.mt2.ml2(:active="isSaved" @click="save" v-if="inField")
      button.icon.hidden.md-block.h6.absolute.top-0.left-0.ml2.mt2.pointer(v-else, @click="remove")
        span Remove

      .green.absolute.top-0.right-0.mt2.mr2(v-if="clover.symmetrical")
        symmetry-icons.h6(:board="clover")
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
      this.$store.dispatch('confirmRemoveSavedClover', this.clover)
    }
  },
  components: { HeartIcon, SymmetryIcons }
}
</script>

<style>
.pick-border {
  border: 1px dashed transparent;
  transition: border-color 300ms;

  & .icon{
    opacity:0;
    transition: opacity 300ms;
  }
}

@media (hover:hover) {
  .pick-border:hover {
    border-color: #01B463;
    & .icon:not(.heart-icon--active) {
      opacity:0.4;
      &:hover{
        opacity:1;
      }
    }
  }
}
</style>
