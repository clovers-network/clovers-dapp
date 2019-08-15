<template lang="pug">
  .mt1.mx3.sm-mt3
    more-information(title="?") Your <b>Basket</b> is where clovers picked from your <router-link to="/garden" class="underlin">Garden</router-link>, or symmetrical clovers found by your Clover Pig are saved. To register a clover and permanently add it your Collection, it costs a base fee of 10 <router-link to="/trade">Clover Coins</router-link>. Once registered, they'll appear on your Profile, and in the Feed.

    //- (picks list)
    section.sm-col-10.lg-col-12.mx-auto(v-if="picks.length")
      .flex.flex-wrap.mxn2.mb4.md-px2
        field-item(v-for='(clover, i) in picks', :key='i' data-expand='-50', :data-appear='i % 3', :clover="clover")
    //- (no picks)
    section.center(v-else)
      p.p2.bg-lightest-green.rounded.my3 Your Basket is empty.
      router-link.h5.inline-block.px3.py2.bg-white.border.rounded-2.border.mx-auto.hover-bg-l-green(to="/garden") Pick Clovers

    //- modal: keep
    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import KeepClover from '@/views/KeepClover'
import moment from 'moment'
import Reversi from 'clovers-reversi'
import FieldItem from '@/components/FieldItem'
import MoreInformation from '@/components/MoreInformation'

export default {
  name: 'Picks',
  head: {
    title: { inner: 'Picks' },
    meta: [{ name: 'description', content: "A list of Clovers you've saved from the Field", id: 'meta-desc' }]
  },
  data () {
    return {
      viewSingle: null,
      newClover: null,
      newCloverMoves: null,
      entryRt: this.$route.name
    }
  },
  watch: {
    async newCloverMoves () {
      if (!this.newCloverMoves) {
        this.newClover = null
        return false
      }
      let clover = new Reversi()
      clover.playGameMovesString(this.newCloverMoves)
      if (clover.error) {
        this.newClover = null
        return false
      }
      this.newClover = await this.formatFoundClover(clover)
    }
  },
  computed: {
    showPickModal () {
      return this.$route.query.pick
    },

    ...mapGetters(['picks', 'pickCount'])
  },
  methods: {
    cloverImage,

    addNewClover () {
      if (!this.newClover) return
      this.saveClover(this.newClover)
      this.newCloverMoves = null
    },
    fromNow ({ createdAt }) {
      return moment(createdAt).fromNow()
    },

    isSym (clover) {
      return clover.symmetrical
    },
    closeKeep () {
      /* go BACK if didn't enter Picks via Keep */
      if (this.entryRt !== 'Account/Keep') return this.$router.go(-1)
      this.entryRt = null // clear, so always use BACK now
      this.$router.push({ name: 'Picks' })
    },

    ...mapActions(['formatFoundClover']),
    ...mapMutations({
      removeClover: 'REMOVE_SAVED_CLOVER',
      saveClover: 'SAVE_CLOVER'
    })
  },
  components: { KeepClover, FieldItem, MoreInformation }
}
</script>

<style lang="css" scoped>
  div.sym-badge {
    background: var(--green);
    color: white;
    left: 0.8em;
    top: -0.6em;
    border-radius: 32px;
  }
  #manual-clover:invalid {
    border-color: var(--red);
  }
</style>
