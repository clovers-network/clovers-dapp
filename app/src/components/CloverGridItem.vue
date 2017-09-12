<template>
  <router-link :to="link" tag="div" class="pointer gridItem">
    <div class="center silver mb2 h5" v-text="timeAgo"></div>
    <!-- <div class="center silver mb2">by {{board.previousOwners[0]}}</div> -->
    <div>
      <clv :no-click="true" :byteBoard="board.board"></clv>
      <div class="h1 center mt2 max-fit overflow-hidden" ><code v-html="boardName"></code></div>
      <div class="center mt2 max-fit overflow-hidden" v-html="boardOwner"></div>
      <div class="center mt2">
        <span>{{ price }}</span> &clubs; /
        <span>{{ flippers }}</span> &orarr;
      </div>
    </div>
  </router-link>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Reversi from '../assets/reversi'
  import moment from 'moment'
  export default {
    name: 'clover-grid-item',
    data () {
      return {
        reversi: new Reversi()
      }
    },
    props: {
      board: {
        type: Object,
        required: true
      },
      byFlip: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      boardName () {
        let name = this.board.name || this.board.board
        return name && (name.length > 9 ? name.slice(0, 9) + '&hellip;' : name)
      },
      boardOwner () {
        let owner = this.board.previousOwners && this.board.previousOwners[ this.board.previousOwners.length - 1 ].name
        return owner && 'Owned By: ' + (owner.length > 7 ? owner.slice(0, 7) + '&hellip;' : owner)
      },
      // findersFee () {
      //   this.clover.byteBoard = this.board.board
      //   this.clover.isSymmetrical()
      //   console.log(this.clover)
      //   return this.clover.calcFindersFees(this.symmetries)
      // },
      flippers () {
        return this.board && this.board.previousOwners && this.board.previousOwners.length - 1
      },
      price () {
        if (!this.flippers) {
          return this.board.lastPaidAmount.toLocaleString()
        }
        return (this.board.lastPaidAmount * 2).toLocaleString()
      },
      link () {
        return `/clovers/${this.board.board}`
      },
      timeAgo () {
        return this.byFlip ? this.flipped : this.discovered
      },
      discovered () {
        return 'Found ' + moment(this.board.created * 1000).startOf('hour').fromNow()
      },
      flipped () {
        return 'Flipped ' + moment(this.board.modified * 1000).startOf('hour').fromNow()
      },
      ...mapGetters([
        'clover',
        'symmetries'
      ])
    }
  }
</script>
