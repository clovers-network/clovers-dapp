<template lang="pug">
  .mx3
    header
      page-title
        h1 Basket
        p(slot="info") <b>Your Basket</b> is where clovers picked from your <router-link to="/garden" class="underlin">Garden</router-link>, or symmetrical clovers found by your Clover Pig are saved. To register a clover and permanently add it your Collection, it costs a base fee of {{ baseCloverFee }} <router-link to="/trade">Clover Coin</router-link>. Once registered, they'll appear on your Profile, and in the Feed.

    //- (picks list)
    section.sm-col-10.lg-col-12.mx-auto.pb4.mb4(v-if="picks.length")
      .flex.flex-wrap.mxn2.md-px2
        field-item(v-for='(clover, i) in picks', :key='i' data-expand='-50', :data-appear='i % 3', :clover="clover", :class="foundClass(clover)")
      footer.mt3.flex.justify-center(v-if="picks.length > 12 || alreadyFoundClovers.length")
        button.red.border.rounded-2.p2.px3.mx3.pointer.hover-bg-l-red(@click="discardAll" v-if="picks.length > 12") Discard All
        button.red.border.rounded-2.p2.px3.mx3.pointer.hover-bg-l-red(@click="removeRegistered" v-if="alreadyFoundClovers.length") Remove Registered
    //- (no picks)
    section.center(v-else)
      p.p2.bg-lightest-green.rounded.my3 Your Basket is empty.
      router-link.h5.inline-block.px3.py2.bg-white.border.rounded-2.border.mx-auto.hover-bg-l-green(to="/garden") Pick Clovers

    //- modal: keep
    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal", @next="nextPick(1)", @prev="nextPick(-1)")

</template>

<script>
import axios from 'axios'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import KeepClover from '@/views/KeepClover'
import moment from 'moment'
import Reversi from 'clovers-reversi'
import FieldItem from '@/components/FieldItem'
import PageTitle from '@/components/PageTitle'

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
      entryRt: this.$route.name,
      alreadyFoundClovers: []
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
    baseCloverFee () {
      return this.$store.state.baseCloverFee
    },

    ...mapGetters(['picks', 'pickCount', 'baseURL'])
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
    discardAll () {
      const confirm = window.confirm('Are you sure you want to discard ALL the clovers in your Basket? This action cannot be undone...')
      if (confirm) this.$store.commit('REMOVE_ALL_SAVED_CLOVERS')
    },
    nextPick (dir = 1) {
      let i = this.picks.findIndex(pick => pick.movesString === this.showPickModal)
      i = i + dir === this.picks.length ? 0 : i + dir < 0 ? this.picks.length - 1 : i + dir
      const nextMvs = this.picks[i] && this.picks[i].movesString
      return nextMvs && this.$router.push({query: {pick: nextMvs}})
    },
    foundClass (clover) {
      let found = this.alreadyFoundClovers.indexOf(clover.board) > -1
      return !found ? {} : ['opacity-25']
    },
    removeRegistered () {
      this.alreadyFoundClovers.forEach((board) => {
        this.removeClover({board})
      })
      this.alreadyFoundClovers = []
    },
    async purgeExisting (key = 0) {
      if (key === 0) {
        this.alreadyFoundClovers = []
      }
      if (key >= this.picks.length) return
      let clover = this.picks[key]
      try {
        await axios(this.baseURL(`/clovers/${clover.board}`))
        this.alreadyFoundClovers.push(clover.board)
      } catch (_) {}
      await this.purgeExisting(key + 1)
    },
    ...mapActions(['formatFoundClover']),
    ...mapMutations({
      removeClover: 'REMOVE_SAVED_CLOVER',
      saveClover: 'SAVE_CLOVER'
    })
  },
  mounted () {
    this.purgeExisting()
  },
  components: { KeepClover, FieldItem, PageTitle }
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
