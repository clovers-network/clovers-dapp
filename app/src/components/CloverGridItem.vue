<template>
  <router-link :to="link" tag="div" class="pointer gridItem relative">

          

    <div class="center muted mb2 h5" v-text="timeAgo"></div>
    <!-- <div class="center silver mb2">by {{board.previousOwners[0]}}</div> -->
    <div>
      <div class='relative'>
        <div class=' h6 absolute top-0  right-0 mxn3 gridItemBadge z2'>
          <div v-if="badgeClass.multiple" class="px1 mb1 py1 bg-red rounded multipleBagde">{{badgeClass.count}}x Sym</div>
        </div>

        <div class=' h6 absolute bottom-0  right-0 mxn3 gridItemBadge z2'>
          <div v-if="badgeClass[mostRare.name]" class="px1 py1 bg-green rounded rareBadge" :class="mostRare.name + 'Badge'">Rare</div>
        </div>
        <clv :no-click="true" :byteBoard="board.board"></clv>
      </div>
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
        reversi: new Reversi(),
        symTypes: ['RotSym', 'Y0Sym', 'X0Sym', 'XYSym', 'XnYSym']
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
      mostRare () {
        return this.symTypes.map((type) => {
          return {
            name: type,
            num: this.symmetries[type]
          }
        }).sort((a, b) => b.num - a.num).pop()
      },
      badgeClass () {
        this.reversi.byteBoardPopulateBoard(this.board.board)
        this.reversi.isSymmetrical()
        let symCount = 0
        if (this.reversi.RotSym) symCount++
        if (this.reversi.X0Sym) symCount++
        if (this.reversi.Y0Sym) symCount++
        if (this.reversi.XYSym) symCount++
        if (this.reversi.XnYSym) symCount++

        return {
          multiple: symCount > 1,
          count: symCount,
          RotSym: this.reversi.RotSym,
          X0Sym: this.reversi.X0Sym,
          Y0Sym: this.reversi.Y0Sym,
          XYSym: this.reversi.XYSym,
          XnYSym: this.reversi.XnYSym
        }
      },
      boardName () {
        let name = this.board.name || this.board.board
        return name && (name.length > 9 ? name.slice(0, 9) + '&hellip;' : name)
      },
      boardOwner () {
        let owner = this.board.previousOwners && this.board.previousOwners[ this.board.previousOwners.length - 1 ].name
        return owner && 'Owned By: ' + (owner.length > 7 ? owner.slice(0, 7) + '&hellip;' : owner)
      },
      findersFee () {
        // this.reversi.byteBoard = this.board.board
        // this.reversi.isSymmetrical()
        // return this.clover.calcFindersFees(this.symmetries, ...this.reversi)
      },
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
        return this.byFlip && this.flippers ? this.flipped : this.discovered
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
<style lang="scss" >
.gridItemBadge {
  .multipleBagde, .rareBadge {
    min-width:6em;
    border-radius: 0.5em;
  }
}
</style>
