<template>
  <div @click='playAnimate()' class="clover nowrap pointer" :class="winner">
    <div v-if="displayString">
      <svg-path :animation="false" :moveString="displayString"></svg-path>
    </div>
    <div v-for="row in board" class="row">
      <span v-for="tile in row" :class="tileMap[tile]"></span>
    </div>
  </div>
</template>
<script>
import Reversi from '../assets/reversi'
import SvgPath from './TextPath'

export default {
  name: 'clover',
  data () {
    return {
      stop: true,
      reversi: new Reversi(),
      animator: new Reversi(),
      animatedBoard: null,
      tileMap: {
        'w': 't-w',
        'b': 't-b',
        '-': 't-n',
        '2': 't-w',
        '1': 't-b',
        '3': 't-n'
      },
      displayString: null
    }
  },
  mounted () {
    this.displayString = this.moveString
  },
  watch: {
    moveString () {
      this.displayString = this.moveString
    }
  },
  computed: {
    board () {
      return this.animatedBoard || this.rowArray || (this.byteBoard && this.reversi.byteBoardToRowArray(this.byteBoard)) || (this.moveString && this.reversi.playGameMovesString(this.moveString).byteBoardToRowArray())
    },
    winner () {
      if (!this.board) return
      if (!this.stop) return
      let w = 0
      let b = 0
      this.board.forEach((r) => r.forEach((t) => {
        b += t === 'b' && 1
        w += t === 'w' && 1
      }))
      return b > w ? 'w-b' : (w > b ? 'w-w' : 'w-t')
    }
  },
  methods: {
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
      this.playMoves(0)
    },
    playMoves (moveKey = 0) {
      if (!this.animator.playMove(moveKey) && !this.stop) {
        this.displayString = this.animator.movesString
        this.animatedBoard = this.animator.rowBoard
        setTimeout(() => {
          this.playMoves(moveKey + 1)
        }, 60)
      } else {
        this.stop = true
        this.animatedBoard = null
      }
    }
  },
  props: {
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
    }
  },
  components: {
    SvgPath
  }
}
</script>
