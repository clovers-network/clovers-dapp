<template>
  <div
    ref='body'
    @mouseenter="activate()"
    @click="playAnimate()"
    class="clover nowrap pointer relative"
    :class="{isRFT:isRFT}"
    >
    <div
      v-if="showFlags"
      :class="{h6: !compact, h7: compact}"
      class='center  absolute top-0  right-0 mxn3 gridItemBadge z1'>
      <div
        :class="{px1: !compact, py1: !compact}"
        v-if="badgeClass.multiple"
        class="px1 mb1 py1 bg-red rounded multipleBagde">{{ badgeClass.count }}x Sym</div>
    </div>

    <div
      v-if="showFlags"
      :class="{h6: !compact, h7: compact}"
      class='center absolute bottom-0  right-0 mxn3 gridItemBadge z1'>
      <div
        v-if="badgeClass[mostRare.name]"
        class="px1 py1 bg-green rounded rareBadge"
        :class="[{px1: !compact, py1: !compact}, mostRare.name + 'Badge']">Rare</div>
    </div>
    <!-- address string -->
    <div v-if="displayString && !noMoves && showAddress">
      <svg-text
        :fill="textColor"
        :animation="false"
        :move-string="displayString"/>
    </div>
    <!-- circle -->
    <div class="clover__circle absolute overlay" :class="circleStyle">
      <div class="row-body">
        <!-- rows -->
        <div
          v-for="(row, i) in board"
          :key="i"
          class="row">
          <!-- dots -->
          <span
            v-for="(tile, j) in row"
            :key="j"
            :class="tileMap[tile]"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Reversi from 'clovers-reversi'
import SvgText from './SvgText'
import { mapGetters } from 'vuex'

export default {
  name: 'Clv',
  data () {
    return {
      isActive: false,
      stop: true,
      reversi: new Reversi(),
      animator: new Reversi(),
      animatedBoard: null,
      tileMap: {
        w: 't-w',
        b: 't-b',
        '-': 't-n',
        '2': 't-w',
        '1': 't-b',
        '3': 't-n'
      },
      displayString: null,
      symTypes: ['RotSym', 'Y0Sym', 'X0Sym', 'XYSym', 'XnYSym']
    }
  },
  mounted () {
    this.displayString = this.moveString
    if (this.autoPlay) {
      this.playAnimate()
    }
  },
  watch: {
    moveString () {
      this.displayString = this.moveString
    }
  },
  computed: {
    mostRare () {
      return this.symTypes
        .map(type => {
          return {
            name: type,
            num: (this.symmetries && this.symmetries[type]) || 0
          }
        })
        .sort((a, b) => b.num - a.num)
        .pop()
    },
    badgeClass () {
      this.reversi.byteBoardPopulateBoard(this.byteBoard)
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
    board () {
      return (
        this.animatedBoard ||
        this.rowArray ||
        (this.byteBoard && this.reversi.byteBoardToRowArray(this.byteBoard)) ||
        (this.moveString &&
          this.reversi
            .playGameMovesString(this.moveString)
            .byteBoardToRowArray())
      )
    },
    circleStyle () {
      if (!this.board || !this.stop) return 'bg-green'
      let w = 0
      let b = 0
      this.board.forEach(r =>
        r.forEach(t => {
          b += t === 'b' && 1
          w += t === 'w' && 1
        })
      )
      return {
        'w-b': b > w,
        'w-w': w > b,
        'w-t': w === b,
        active: this.isActive
      }
    },

    ...mapGetters(['symmetries'])
  },
  methods: {
    activate () {
      if (this.isActive) return
      console.log('activate')
      this.isActive = true
      setTimeout(() => {
        this.isActive = false
      }, 1000)
    },
    playAnimate () {
      if (this.noClick) return
      this.stop = !this.stop
      if (this.stop) {
        this.animatedBoard = null
        return
      }
      let moves = []
      if (this.moveBytes) {
        moves = this.reversi.byteMovesToStringMoves(this.moveBytes)
      } else if (this.moveString) {
        moves = this.moveString
      } else {
        return
      }
      this.animator.clearAttrs()
      this.animator.moves = this.animator.stringMovesToArrayMoves(moves)
      this.animatedBoard = this.animator.rowBoard
      setTimeout(() => {
        this.playMoves(0)
      }, this.speed * 5)
    },
    playMoves (moveKey = 0) {
      if (!this.animator.playMove(moveKey) && !this.stop) {
        this.displayString = this.animator.movesString
        this.animatedBoard = this.animator.rowBoard
        setTimeout(() => {
          this.playMoves(moveKey + 1)
        }, this.speed)
      } else {
        this.stop = true
        this.animatedBoard = null
      }
    }
  },
  props: {
    compact: {
      type: Boolean,
      default: false
    },
    showFlags: {
      type: Boolean,
      default: false
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    speed: {
      type: Number,
      default: 60
    },
    textColor: {
      type: String,
      default: 'white'
    },
    noMoves: {
      type: Boolean,
      default: false
    },
    noClick: {
      type: Boolean,
      default: false
    },
    rowArray: {
      type: Array,
      default: null
    },
    byteBoard: {
      type: String,
      default: null
    },
    moveString: {
      type: String,
      default: null
    },
    moveBytes: {
      type: Array,
      default: null
    },
    defaultBoard: {
      type: Array,
      default: null
    },
    isRFT: {
      type: Boolean,
      default: false
    },
    showAddress: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SvgText
  }
}
</script>

<style>
.clover {
  /*transition: background 500ms ease, border 500ms ease;*/
  /*background-color: var(--green);*/
  border-radius: 50%;
  /*padding: 1.6em;*/
  /*display: inline-block;*/
  display: block;
  z-index: 0;
  /*position: relative;*/

  &.small-clover {
    font-size: var(--small-font-size);
  }
  &.no-border {
    border: 0px !important;
  }
  & .clover__circle {
    transition: background 500ms ease, border 500ms ease;
    width: 100%;
    height: 0;
    position: relative;
    padding-bottom: 100%;
    border-radius: 100%;
  }
  & .row-body {
    position: absolute;
    width: 70%;
    top: 15%;
    left: 15%;
    /*margin:0 auto;*/
  }
  & .row {
    /*line-height: 0;*/
    display: flex;
  }
  & .active-clover & {
    box-shadow: 0 0 0 0.4em;
  }
  &.no-bg:after {
    background-color: transparent !important;
  }
  & .w-b {
    background-color: var(--black);
    border: 1px solid var(--white);
    &:active:not(.no-hover) .t-b {
      border: 1px solid var(--white);
    }
  }
  & .w-w {
    background-color: var(--white);
    border: 1px solid var(--black);
    &:active:not(.no-hover) .t-w {
      border: 1px solid var(--black);
    }
  }
  & .w-t {
    background-color: var(--silver);
  }

  &.isRFT {
    & .clover__circle {
      background-color: var(--red);
      border: 1px solid var(--red);
      &.w-b {
        & .t-b:after {
          background-color: var(--red);
        }
      }
      &.w-w {
        & .t-w:after {
          background-color: var(--red);
        }
      }
      & .t-n {
        background-color: var(--red) !important;
        /*background-color: var(--green);*/
      }
    }
  }
  & .bg-green {
    background-color: var(--green);
    border: 1px solid var(--green);
  }
}
.t-n {
  background-color: var(--green);
}

.t-b,
.t-w,
.t-n {
  display: inline-block;
  width: calc(100% / 8); /* .6em; */
  /*margin: .06em;*/
  border: 1px solid transparent;
  border-radius: 1000em;
  transition: background 500ms ease, border 500ms ease;
  &:after {
    content: '';
    display: block;
    /*margin:4%;*/
    border-radius: 100%;
    padding-bottom: 100%;
    /*border: 1px solid transparent;*/
  }
}

.t-b:after {
  background-color: var(--black);
}

.t-w:after {
  background-color: var(--white);
}

.t-n:after {
  background: inherit;
  /*background-color: var(--green);*/
}
</style>
