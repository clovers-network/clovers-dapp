import BN from 'bignumber.js'

class Clover {

  constructor () {
    this.BOARDDIM = 8
    this.EMPTY = 0
    this.BLACK = 1
    this.WHITE = 2
    this.clearAttrs()
  }

  clearAttrs () {
    this.error = false
    this.complete = false
    this.symmetrical = false
    this.currentPlayer = this.BLACK
    // this.board is an array of columns, visually the board should be arranged by arrays of rows
    this.board = new Array(this.BOARDDIM).fill(0).map(c => new Array(this.BOARDDIM).fill(this.EMPTY))
    this.board[(this.BOARDDIM / 2) - 1][(this.BOARDDIM / 2) - 1] = this.WHITE
    this.board[(this.BOARDDIM / 2)][(this.BOARDDIM / 2)] = this.WHITE
    this.board[(this.BOARDDIM / 2) - 1][(this.BOARDDIM / 2)] = this.BLACK
    this.board[(this.BOARDDIM / 2)][(this.BOARDDIM / 2) - 1] = this.BLACK
    this.moves = []
    this.byteBoard = ''
    this.byteFirst32Moves = ''
    this.byteLastMoves = ''
    this.moveKey = 0
    this.msg = ''
  }

  playGameMovesArray (moves = []) {
    if (moves.length === 0) return
    this.clearAttrs()
    this.moves = moves
    this.thisMovesToByteMoves()
    var skip = false
    for (var i = 0; i < moves.length && !skip; i++) {
      this.moveKey++
      this.makeMove(this.moveToArray(moves[i]))
      if (this.error) {
        this.error = false
        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
        this.makeMove(this.moveToArray(moves[i]))
        if (this.error) {
          skip = true
        }
      }
    }
    this.thisBoardToByteBoard()
    if (!this.error) {
      this.isComplete()
      this.isSymmetrical()
    }
  }

  playGameMovesString (moves = null) {
    this.playGameMovesArray(this.stringMovesToArrayMoves(moves))
  }

  makeMove (move) {
    var col = move[0]
    var row = move[1]
    if (this.board[col][row] !== this.EMPTY) {
      this.error = true
      this.msg = 'Invalid Game (square is already occupied)'
      return
    }
    var possibleDirections = this.possibleDirections(col, row)
    if (possibleDirections.length === 0) {
      this.error = true
      this.msg = 'Invalid Game (doesnt border other tiles)'
      return
    }
    var flipped = false
    for (var i = 0; i < possibleDirections.length; i++) {
      var possibleDirection = possibleDirections[i]
      var flips = this.traverseDirection(possibleDirection, col, row)
      for (var j = 0; j < flips.length; j ++) {
        flipped = true
        this.board[flips[j][0]][flips[j][1]] = this.currentPlayer
      }
    }
    if (flipped) {
      this.board[col][row] = this.currentPlayer
    } else {
      this.error = true
      this.msg = 'Invalid Game (doesnt flip any other tiles)'
      return
    }
    this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
  }

  possibleDirections (col, row) {
    var dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ]
    var possibleDirections = []
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i]
      var fooCol = col + dir[0]
      var fooRow = row + dir[1]
      if (!(fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0)) {
        var fooTile = this.board[fooCol][fooRow]
        if (fooTile !== this.currentPlayer && fooTile !== this.EMPTY) {
          possibleDirections.push(dir)
        }
      }
    }
    return possibleDirections
  }

  traverseDirection (possibleDirection, col, row) {
    var flips = []
    var skip = false
    var opponentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
    for (var i = 1; i < (this.BOARDDIM + 1) && !skip; i++) {
      var fooCol = (i * possibleDirection[0]) + col
      var fooRow = (i * possibleDirection[1]) + row
      if (fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0) {
        // ran off the board before hitting your own tile
        skip = true
        flips = []
      } else {
        var fooTile = this.board[fooCol][fooRow]
        if (fooTile === opponentPlayer) {
          // if tile is opposite color it could be flipped, so add to potential flip array
          flips.push([fooCol, fooRow])
        } else if (fooTile === this.currentPlayer && i > 1) {
          // hit current players tile which means capture is complete
          skip = true
        } else {
          // either hit current players own color before hitting an opponent's
          // or hit an empty space
          flips = []
          skip = true
        }
      }
    }
    return flips
  }

  isComplete () {
    if (this.moveKey === 60) {
      this.complete = true
      this.msg = 'good game'
      return
    }
    var empties = []
    for (var i = 0; i < this.BOARDDIM; i++) {
      for (var j = 0; j < this.BOARDDIM; j++) {
        if (this.board[i][j] === this.EMPTY) {
          empties.push([i, j])
        }
      }
    }
    var validMovesRemain = false
    if (empties.length) {
      for (i = 0; i < empties.length && !validMovesRemain; i++) {
        var gameCopy = JSON.parse(JSON.stringify(this))
        gameCopy.currentPlayer = this.BLACK
        gameCopy.makeMove(empties[i])
        if (!gameCopy.error) {
          validMovesRemain = true
        }
        gameCopy = JSON.parse(JSON.stringify(this))
        gameCopy.currentPlayer = this.WHITE
        gameCopy.makeMove(empties[i])
        if (!gameCopy.error) {
          validMovesRemain = true
        }
        gameCopy = undefined
      }
    } 
    if (validMovesRemain) {
      this.error = true
      this.msg = 'Invalid Game (moves still available)'
    } else {
      this.complete = true
      this.msg = 'good game'
    }
  }

  isSymmetrical () {
    var RotSym = true
    var Y0Sym = true
    var X0Sym = true
    var XYSym = true
    var XnYSym = true
    for (var i = 0; i < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); i++) {
      for (var j = 0; j < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); j++) {
        // rotational symmetry
        if (this.board[i][j] != this.board[(7 - i)][(7 - j)]) {
          RotSym = false
        }
        // symmetry on y = 0
        if (this.board[i][j] != this.board[i][(7 - j)]) {
          Y0Sym = false;
        }
        // symetry on x = 0
        if (this.board[i][j] != this.board[(7 - i)][j]) {
          X0Sym = false;
        }
        // symmetry on x = y
        if (this.board[i][j] != this.board[(7 - j)][(7 - i)]) {
          XYSym = false;
        }
        // symmetry on x = -y
        if (this.board[i][j] != this.board[j][i]) {
          XnYSym = false;
        }
      }
    }
    if (RotSym || Y0Sym || X0Sym || XYSym || XnYSym) {
      this.symmetrical = true
    }
  }


  colArrayBoardToBinaryBoard (colArrayBoard = []) {
    if (!colArrayBoard.length) return
    var boardString = ''
    for (var col = 0; col < colArrayBoard.length; col++) {
      for (var row = 0; row < colArrayBoard[col].length; row++) {
        var tile = colArrayBoard[col][row]
        boardString += tile === this.BLACK ? '01' : (tile === this.WHITE ? '10' : '00')
      }
    }
    return boardString
  }

  colArrayBoardToByteBoard (colArrayBoard = []) {
    if (!colArrayBoard.length) return
    return this.binaryBoardToByteBoard(this.colArrayBoardToBinaryBoard(colArrayBoard))
  }

  binaryBoardToByteBoard (binaryBoard) {
    var foo = new BN(binaryBoard, 2)
    return foo.toString(16)
  }

  byteBoardToArrayBoard (byteBoard = 0) {
    byteBoard = new BN(byteBoard, 16)
    byteBoard = byteBoard.toString(2)
    var len = byteBoard.length
    if (len < 128) {
      var padding = 128 - len
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      byteBoard = padding + byteBoard
    }
    return byteBoard.match(/.{1,2}/g).map((tile) => {
      return tile === '01' ? 'b' : (tile === '10' ? 'w' : '-')
    })
  }

  byteArrayToRowArray (byteBoard = 0) {
    return this.arrayBoardToRows(this.byteBoardToArrayBoard(byteBoard))
  }

  byteArrayToColArray (byteBoard = 0) {
    return this.arrayBoardToCols(this.byteBoardToArrayBoard(byteBoard))
  }

  arrayBoardToRows (arrayBoard = []) {
    var rowsArray = []
    for (var i = 0; i < 64; i++) {
      var row = i % 8
      if (!rowsArray[row]) rowsArray[row] = []
      rowsArray[row].push(arrayBoard[i])
    }
    return rowsArray
  }

  arrayBoardToCols (arrayBoard = []) {
    var colsArray = []
    for (var i = 0; i < 64; i++) {
      var col = Math.floor(i / 8)
      if (!colsArray[col]) colsArray[col] = []
      colsArray[col].push(arrayBoard[i])
    }
    return colsArray
  }

  stringBoardToArrayBoard (stringBoard = false) {
    return stringBoard && (stringBoard.match(/.{1,1}/g).map((spot) => {
      return spot === 'b' ? '01' : (spot === 'w' ? '10' : '00')
    }).join(''))
  }

  thisBoardToByteBoard () {
    this.byteBoard = this.colArrayBoardToByteBoard(this.board)
  }

  thisMovesToByteMoves (moves = this.moves) {
    moves = this.stringMovesToBinaryMoves(moves.join('')).match(/.{1,224}/g)
    var foo = new BN(moves[0], 2)
    var bar = new BN(moves[1], 2)
    this.byteFirst32Moves = foo.toString(16)
    this.byteLastMoves = bar.toString(16)
  }

  stringMovesToBinaryMoves (stringMoves = false) {
    if (!stringMoves) return
    var stringMoves = stringMoves.match(/.{1,2}/g).map((move) => {
      if (move.length < 2) return
      var moveArray = move.match(/.{1,1}/g)
      var m = this.moveToArray(moveArray)
      var foo = new BN(m[0] + (m[1] * 8) + 64)
      return foo.toString(2)
    }).join('')
    if (stringMoves.length < (64 * 7)) {
      var padding = (64 * 7) - stringMoves.length
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      stringMoves += padding
    }
    return stringMoves
  }

  stringMovesToArrayMoves (stringMoves = false) {
    if (!stringMoves) return
    return stringMoves.match(/.{1,2}/g)
  }

  binaryMovesToByteMoves (binaryMoves = 0) {
    if (!binaryMoves) return
    var foo = new BN(binaryMoves, 2)
    return foo.toString(16)
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
