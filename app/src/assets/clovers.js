// import BN from 'bignumber.js'

var Clover = function () {
  this.init()
}

Clover.prototype.init = () => {
  this.BOARDDIM = 8
  this.EMPTY = 0
  this.BLACK = 1
  this.WHITE = 2
}

Clover.prototype.game = () => {
  this.error = false, 
  this.complete = false,
  this.symmetrical = false,
  this.currentPlayer = 1,
  this.board = [],
  this.moves = [],
  this.byteBoard = '0x0',
  this.byteFirst32Moves = '0x0',
  this.byteLastMoves = '0x0',
  this.moveKey = 0,
  this.msg = ''
}

Clover.prototype.playGame = (moves = []) => {
  if (moves.length === 0) return
  this.currentGame = new this.game()
}

Clover.prototype.byteBoardToArrayBoard = (byteBoard = '0x0') => {
  // console.log(BN)
  // var byteBoard = new BN(byteBoard, 2)
  console.log(byteBoard)
  return byteBoard
}

module.exports = new Clover()