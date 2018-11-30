<template>
  <div>
    <keep-clover v-if="viewSingle" :clover="viewSingle" @close="viewSingle = null"></keep-clover>
    <ul class="list-reset md-flex flex-wrap items-center m0 md-px1 pb4">
      <li v-for="(clover, i) in picks" :key="i" class="md-col-6 md-px1">
        <div class="flex py2 border-bottom justify-between items-center green">
          <div class="col-3 center relative">
            <div class="sym-badge absolute h7 p1" v-if="isSym(clover)">SYM</div>
            <img class="pointer" :src="cloverImage(clover, 58)" width="58" height="58" @click="viewSingle = clover"/>
          </div>
          <div class="col-3 pr2 h7 font-mono">
            {{ fromNow(clover) }}
          </div>
          <div class="pr2 h6 font-mono">
            <button @click="removeClover(clover)" class="btn btn-big border border-green regular">Remove</button>
          </div>
          <div class="pr3 h6 font-mono">
            <button @click="viewSingle = clover" class="btn btn-big bg-green white nowrap regular">Keep/Sell</button>
          </div>
        </div>
      </li>
      <li class="p2 center" v-if="!picks.length">No Clovers To Show...</li>
      <li v-else class="md-col-6 md-px1">
        <div class="flex py2 border-bottom justify-between items-center green">
          <div class="col-3 center relative">
            <img  class="pointer" :src="newClover ? cloverImage(newClover, 58) : 'https://api2.clovers.network/clovers/svg/0x0/58'" width="58" height="58" @click="viewSingle = newClover"/>
          </div>
          <div class="col-6 pr2 font-mono">
            <input placeholder="Clover Source" class="col-12 font-mono border-bottom" v-model="newCloverMoves" />
          </div>
          <div class="pr3 h6 font-mono">
            <button @click="addNewClover()" class="btn btn-big bg-green white nowrap regular">Add Clover</button>
          </div>
        </div>
      </li>
    </ul>
    <div is="router-link" tag="div" to="/field" class="fixed-center-max-width bottom-0 bg-green white center p2 pointer h-bttm-bar">
      <span class="m-auto h3 font-exp">Find more</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { cloverImage } from '@/utils'
import KeepClover from '@/views/KeepClover'
import moment from 'moment'
import Reversi from 'clovers-reversi'

export default {
  name: 'Picks',
  data () {
    return {
      viewSingle: null,
      newClover: null,
      newCloverMoves: null
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
    ...mapActions(['formatFoundClover']),
    ...mapMutations({
      removeClover: 'REMOVE_SAVED_CLOVER',
      saveClover: 'SAVE_CLOVER'
    })
  },
  components: { KeepClover }
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
</style>
