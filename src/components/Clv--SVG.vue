<template lang="pug">
  .clv-svg(v-if="svg", v-html="svg", role="img", aria-label="Clover Image")
</template>

<style>
.clv-svg svg{
  display: block;
  max-width: 100%;
  width:100%;
}
</style>

<script>
import Reversi from 'clovers-reversi'
export default {
  name: 'Clv--SVG',
  props: ['byteBoard', 'size'],
  data () {
    return {
      svg: null
    }
  },
  created () {
    this.toSVG(this.byteBoard, this.size).then(svg => { this.svg = svg })
  },
  methods: {
    async toSVG (id, size = 400) {
      size = parseInt(size)
      return new Promise((resolve, reject) => {
        let green = '#01B463'
        let black = '#000000'
        let white = '#FFFFFF'
        let grey = '#808080'

        let r = new Reversi()
        // let svgPath = path.resolve(
        //   __dirname + '/../../public/svg/' + size + '/' + id + '.svg'
        // )

        r.byteBoardPopulateBoard(id)
        r.calcWinners()
        r.isSymmetrical()

        let fill, stroke, sequence
        let strokeWidth = 1
        let radius = size / 2

        let svg =
          '<?xml version="1.0" encoding="UTF-8"?><svg class="block" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="-1 -1 ' +
          (size + 2) +
          ' ' +
          (size + 2) +
          '" enable-background="new 0 0 ' +
          size +
          ' ' +
          size +
          '" xml:space="preserve">'

        if (r.whiteScore < r.blackScore) {
          fill = black
          stroke = black
        } else if (r.whiteScore > r.blackScore) {
          fill = white
          stroke = black
        } else {
          fill = grey
          stroke = grey
        }
        // if (r.symmetrical) {
        //   strokeWidth = 2
        //   stroke = green
        // }

        svg +=
          '<circle shape-rendering="optimizeQuality" fill="' +
          fill +
          '" stroke="' +
          stroke +
          '" stroke-width="' +
          strokeWidth +
          '" stroke-miterlimit="10" cx="' +
          size / 2 +
          '" cy="' +
          size / 2 +
          '" r="' +
          radius +
          '"/>'
        for (let i = 0; i < 64; i++) {
          let row = Math.floor(i / 8)
          let col = i % 8
          switch (r.board[row][col]) {
            case r.BLACK:
              if (r.whiteScore < r.blackScore) continue
              fill = black
              stroke = 'none'
              break
            case r.WHITE:
              if (r.whiteScore > r.blackScore) continue
              fill = white
              stroke = 'none'
              break
            case r.EMPTY:
              fill = green
              stroke = 'none'
              break
            default:
              continue
          }
          let x = (row + 1) * (size / 12) + size / 8
          let y = (col + 1) * (size / 12) + size / 8
          svg +=
            '<circle shape-rendering="optimizeQuality" fill="' +
            fill +
            '" stroke="' +
            stroke +
            '" stroke-miterlimit="1" cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            size / 24 +
            '"/>'
        }
        svg += '</svg>'
        resolve(svg)

        // fs.outputFile(svgPath, svg, (err) => {
        //   if (err) {
        //     reject(err)
        //   } else {
        //     resolve()
        //   }
        // })
      })
    }
  }
}
</script>
