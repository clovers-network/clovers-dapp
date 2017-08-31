import BN from 'bignumber.js'

class Clover {

  constructor () {
    this.BOARDDIM = 8
    this.EMPTY = 0
    this.BLACK = 1
    this.WHITE = 2
    this.error = false
    this.complete = false
    this.symmetrical = false
    this.currentPlayer = 1
    this.board = []
    this.moves = []
    this.byteBoard = '0x0'
    this.byteFirst32Moves = '0x0'
    this.byteLastMoves = '0x0'
    this.moveKey = 0
    this.msg = ''
  }

  playGame (moves = []) {
    if (moves.length === 0) return
  }

  byteBoardToArrayBoard (byteBoard = 0) {
    byteBoard = new BN(byteBoard, 16)
    return byteBoard && byteBoard.toString(2).match(/.{1,2}/g).map((tile) => {
      return tile === '01' ? 'b' : (tile === '10' ? 'w' : '-')
    })
  }

  stringBoardToArrayBoard (stringBoard = false) {
    return stringBoard && (stringBoard.match(/.{1,1}/g).map((spot) => {
      return spot === 'b' ? '01' : (spot === 'w' ? '10' : '00')
    }).join(''))
  }

  stringMovesToBinaryMoves (stringMoves = false) {
    return stringMoves && stringMoves.match(/.{1,2}/g).map((move) => {
      var moveArray = move.match(/.{1,1}/g)
      var m = this.moveToArray(moveArray)
      var foo = new BN(m[0] + (m[1] * 8) + 64)
      return foo.toString(2)
    }).join('')
  }

  binaryMovesToStringMoves (binaryMoves = 0) {
    binaryMoves = binaryMoves && new BN(binaryMoves, 2)
    binaryMoves = binaryMoves.toString(2)
    if (binaryMoves.length < (64 * 7)) {
      var padding = (64 * 7) - binaryMoves.length
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      binaryMoves += padding
    }
    return binaryMoves.match(/.{1,7}/g).map((move) => {
      move = new BN(move, 2).toNumber(10)
      if (move < 64) {
        return false
      } else {
        move -= 64
        var col = move % 8
        move -= col
        var row = move / 8
        return 'abcdefghijklmnopqrstuvwxyz'[col] + (row + 1) 
      }
    }).filter((move) => move).join('').toUpperCase()
  }

  moveToArray (moveArray) {
      return [
        moveArray[0].toLowerCase().charCodeAt(0) - 97 + 0,
        parseInt(moveArray[1]) - 1 + 0
      ]
    }
}

export default Clover
