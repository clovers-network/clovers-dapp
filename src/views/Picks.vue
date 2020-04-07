<template lang="pug">
  .mx3
    header
      page-title
        h1 Basket
        p(slot="info") <b>Your Basket</b> is where clovers picked from your <router-link to="/garden" class="underlin">Garden</router-link>, or symmetrical clovers found by your Clover Pig are saved. To register a clover and permanently add it your Collection, it costs a base fee of {{ fromWei(basePrice) }} <router-link to="/trade">Clover Coin</router-link>. Once registered, they'll appear on your Profile, and in the Feed.

    //- (picks list)
    section.sm-col-10.lg-col-12.mx-auto.pb4.mb4(v-if="picks.length")
      //- filters
      filters-nav
        //- filter
        select(slot="filter", v-model="filter")
          option(:value="undefined") All Clovers
          option(value="Sym") Symmetrical
          option(value="NonSym") Non-Symmetrical
          option(value="RotSym") Sym. Rotational
          option(value="X0Sym") Sym. Vertical
          option(value="Y0Sym") Sym. Horizontal
          option(value="XYSym") Sym. Diagonal Up
          option(value="XnYSym") Sym. Diagonal Down
          option(value="multi-1") 1x Symmetries
          option(value="multi-3") 3x Symmetries
          option(value="multi-5") 5x Symmetries
      //- list
      .flex.flex-wrap.mxn2.md-px2
        field-item(v-for='(clover, i) in picksFiltered', :key='i' data-expand='-50', :data-appear='i % 3', :clover="clover", :class="foundBulkClass(clover)", @check="selectClover")
      //- actions
      footer.sticky.p3.z2.bottom-0.left-0.right-0.md-flex.justify-center(v-if="picks.length > 4 || alreadyFoundClovers.length || bulkEdit.length")
        button.col-12.mt2.bg-white.green.border.border-dashed.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-green.hover-border-solid(@click="showActions = !showActions", v-show="!bulkEdit.length") {{showActions ? 'Close' : 'Edit'}}
        template(v-if="showActions || bulkEdit.length")
          button.col-12.mt2.bg-white.green.border.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-green(@click="purgeExisting") {{processing ? 'Verifying...' : 'Verify All'}}
          button.col-12.mt2.bg-white.green.border.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-green(@click="removeRegistered" v-if="alreadyFoundClovers.length") Remove Registered
          button.col-12.mt2.bg-white.green.border.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-green(@click="deselectAll" v-if="bulkEdit.length") Deselect All
          button.col-12.mt2.bg-white.green.border.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-green(@click="selectAll" v-if="bulkEdit.length !== picks.length") Select All
          button.col-12.mt2.bg-white.red.border.rounded-2.p2.px3.md-mx2.pointer.hover-bg-l-red(@click="discardSelected" v-if="bulkEdit.length") Discard Selected
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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage, cleanObj } from '@/utils'
import KeepClover from '@/views/KeepClover'
import moment from 'moment'
import Reversi from 'clovers-reversi'
import FieldItem from '@/components/FieldItem'
import PageTitle from '@/components/PageTitle'
import FiltersNav from '@/components/FiltersNav'
import { fromWei } from 'web3-utils'

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
      alreadyFoundClovers: [],
      bulkEdit: [],
      showActions: false,
      processing: false,
      filter: undefined
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
    },
    filter () {
      this.bulkEdit = []
      this.showActions = false
    }
  },
  computed: {
    showPickModal () {
      return this.$route.query.pick
    },
    picksFiltered () {
      let picks = this.picks || []
      const f = this.filter || ''
      // ALL NonSym || Sym
      if (f === 'NonSym' || f === 'Sym') {
        return picks.filter(p => p.symmetrical === (f === 'Sym'))
      // Sym: specific
      } if (f.includes('Sym')) {
        return picks.filter(p => p[f]) // specific sym
      // Sym 1x/3x/5x
      } else if (f.includes('multi-')) {
        const count = parseInt(f.split('-').pop())
        return picks.filter(pick => {
          const symmetries = Object.entries(pick).filter(([key, val]) => key.includes('Sym') && val)
          return symmetries.length === count
        })
      }
      // ALL
      return picks
    },

    ...mapGetters(['picks', 'pickCount', 'baseURL']),
    ...mapState(['basePrice'])
  },
  methods: {
    fromWei,
    cloverImage,
    discardSelected () {
      const confirm = window.confirm('Are you sure you want to discard ALL the selected clovers in your Basket? This action cannot be undone...')
      if (confirm) {
        this.bulkEdit.forEach(board => {
          this.removeClover({board})
        })
      }
      this.deselectAll()
    },
    deselectAll () {
      this.bulkEdit = []
    },
    selectAll () {
      this.bulkEdit = this.picksFiltered.map((p) => p.board)
    },
    bulkIndex (board) {
      return this.bulkEdit.indexOf(board)
    },
    selectClover (clover) {
      let cloverIndex = this.bulkIndex(clover.board)
      if (cloverIndex > -1) {
        this.bulkEdit.splice(cloverIndex, 1)
      } else {
        this.bulkEdit.push(clover.board)
      }
    },
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
    foundBulkClass (clover) {
      let found = this.alreadyFoundClovers.indexOf(clover.board) > -1
      let classes = !found ? [] : ['opacity-25']

      let bulkIndex = this.bulkIndex(clover.board)
      if (bulkIndex > -1) {
        classes.push('bulkIndex')
      }
      return classes
    },
    removeRegistered () {
      this.alreadyFoundClovers.forEach((board) => {
        this.removeClover({board})
      })
      this.alreadyFoundClovers = []
    },
    async purgeExisting (event, key = 0) {
      this.processing = true
      if (key === 0) {
        this.alreadyFoundClovers = []
      }
      if (key >= this.picks.length) return
      let clover = this.picks[key]
      try {
        await axios(this.baseURL(`/clovers/${clover.board}`))
        this.alreadyFoundClovers.push(clover.board)
      } catch (_) {}
      await this.purgeExisting(event, key + 1)
      this.processing = false
    },
    ...mapActions(['formatFoundClover']),
    ...mapMutations({
      removeClover: 'REMOVE_SAVED_CLOVER',
      saveClover: 'SAVE_CLOVER'
    })
  },
  components: { KeepClover, FieldItem, PageTitle, FiltersNav }
}
</script>

<style lang="css" scoped>
  @import '../style/settings.css';

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
  @media (--breakpoint-md) {
    footer button {
      width: auto;
    }
  }
</style>
