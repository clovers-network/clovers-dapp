<template lang="pug">
  .mt1.mx3.md-mt3
    more-information(title="?" content="<u>Your Basket</u> is where Clovers that you've picked are stored. If you'd like to register them publicly you'll need to pay 10 Clover Coins. Afterwards they'll show up on your Profile and in the Feed where you can give them names, add comments or sell them to other players.")
    //- .green.border-bottom.py1.center
    //-   p.my0.md-my1 Your unregistered Clovers
    
    //- has picks:
    section.flex.flex-wrap.mxn2.mb4.md-px2(v-if="picks.length !== 0")
      field-item(v-for='(clover, i) in picks', :key='i' data-expand='-50', :data-appear='i % 3', :clover="clover")
    //- no picks:
    .h1.center.mt4.block(v-else) Go to <a href="/garden"><u>your Garden</u></a> to pick some Clovers...
    //- ul.list-reset.md-flex.flex-wrap.items-center.m0.md-px1.pb-bttm-bar
    //-   //- clover item
    //-   li.md-col-6.md-px1(v-for="(clover, i) in picks" :key="i")
    //-     .flex.py2.border-bottom.justify-between.items-center.green
    //-       .col-3.center.relative
    //-         .sym-badge.absolute.h7.p1(v-if="isSym(clover)") SYM
    //-         router-link(:to="{ query: { pick: clover.movesString } }")
    //-           img.pointer(:src="cloverImage(clover, 64)" width="64" height="64")

    //-       .col-3.pr2.h7.font-mono {{ fromNow(clover) }}

    //-       .pr1.h6.font-mono
    //-         button.btn.btn-big.border.border-green.regular(@click="removeClover(clover)") Remove

    //-       .pr2.h6.font-mono
    //-         router-link.btn.btn-big.bg-green.white.nowrap.regular(:to="{ query: { pick: clover.movesString } }") Keep/Sell

    //-   li.p2.center(v-if="!picks.length") No Clovers To Show...
    //-     .flex.py2.border-bottom.justify-between.items-center.green
    //-       .col-3.center.relative
    //-         img.pointer(:src="newClover ? cloverImage(newClover, 64) : 'https://api2.clovers.network/clovers/svg/0x0/64'" width="64" height="64" @click="viewSingle = newClover")
    //-       .col-6.pr2.font-mono
    //-         input.col-12.font-mono.border-bottom(id="manual-clover" type="text" pattern="[a-fA-F\d]+" placeholder="Add Clover Manually" v-model="newCloverMoves")
    //-       .pr3.h6.font-mono
    //-         button.btn.btn-big.bg-green.white.nowrap.regular(@click="addNewClover()") Add Clover

    //- .fixed-center-max-width.bottom-0.bg-green.white.center.p2.pointer.h-bttm-bar.flex(is="router-link" tag="div" to="/field")
    //-   span.m-auto.h3.font-exp Find more

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
