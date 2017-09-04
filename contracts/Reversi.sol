pragma solidity ^0.4.13;

contract Reversi {


  struct Game {
    bool error;
    bool complete;
    bool symmetrical;
    bool RotSym;
    bool Y0Sym;
    bool X0Sym;
    bool XYSym;
    bool XnYSym;
    uint8 currentPlayer;
    bytes16 board;
    bytes28 first32Moves;
    bytes28 lastMoves;
    uint8 moveKey;
    // string msg;
  }

  uint8 BOARDDIM = 8;

  uint8 EMPTY = 3; //0b11 //0x3
  uint8 BLACK = 1; //0b01 //0x1
  uint8 WHITE = 2; //0b10 //0x2

  // event DebugMove(uint8 col, uint8 row);
  // event DebugMoves(uint8[2][] arr);
  // event DebugByte(bytes16 foo);
  // event DebugUint(uint128 bar);
  
  function playGame(bytes28 first32Moves, bytes28 lastMoves) internal constant returns (Game)  {
    Game memory game;

    game.first32Moves = first32Moves;
    game.lastMoves = lastMoves;
    game.moveKey = 0;

    game.error = false;
    game.complete = false;
    game.currentPlayer = BLACK;

    // replaced with hex version below
    // game.board = turnTile(game.board, WHITE, 3, 3);
    // game.board = turnTile(game.board, WHITE, 4, 4);
    // game.board = turnTile(game.board, BLACK, 3, 4);
    // game.board = turnTile(game.board, BLACK, 4, 3);

    // game.board = bytes16(10625432672847758622720); // when empty was 00
    game.board = bytes16(340282366920938452837941934584009588735);
    // game.msg = "New Game";
    bool skip;
    uint8 move;
    uint8 col;
    uint8 row;
    uint8 i;
    bytes28 currentMoves;
    for (i = 0; i < 60 && !skip; i++) {

      currentMoves = game.moveKey < 32 ? game.first32Moves : game.lastMoves;

      move = readMove(currentMoves, game.moveKey % 32, 32);
      skip = !validMove(move);
      (col, row) = convertMove(move);
      if (!skip && col < 8 && row < 8 && col >= 0 && row >= 0) {
        // game.msg = "make a move";
        game = makeMove(game, col, row);
        game.moveKey++;

        if (game.error) {
          game.error = false;
          // maybe player has no valid moves and must pass
          if (game.currentPlayer == BLACK) {
            game.currentPlayer = WHITE;
          } else {
            game.currentPlayer = BLACK;
          }
          game = makeMove(game, col, row);
          if (game.error) {
            skip = true;
            game.error = false;
          }
        }
      }
    }
    if (!game.error) {
      game = isComplete(game);
      game = isSymmetrical(game);
    }
    return game;
  }
  
  function makeMove(Game game, uint8 col, uint8 row) internal constant returns (Game)  {
    // square is already occupied
    if (returnTile(game.board, col, row) != 0){
      game.error = true;
      // game.msg = "Invalid Game (square is already occupied)";
      return game;
    }
    int8[2][8] memory possibleDirections;
    uint8  possibleDirectionsLength;
    (possibleDirections, possibleDirectionsLength) = getPossibleDirections(game, col, row);
    // no valid directions
    if (possibleDirectionsLength == 0) {
      game.error = true;
      // game.msg = "Invalid Game (doesnt border other tiles)";
      return game;
    }

    bytes28 newFlips;
    uint8 newFlipsLength;
    uint8 newFlipCol;
    uint8 newFlipRow;
    uint8 j;
    bool valid = false;
    for (uint8 i = 0; i < possibleDirectionsLength; i++) {
      delete newFlips;
      delete newFlipsLength;
      (newFlips, newFlipsLength) = traverseDirection(game, possibleDirections[i], col, row);
      for (j = 0; j < newFlipsLength; j++) {
        if (!valid) valid = true;
        (newFlipCol, newFlipRow) = convertMove(readMove(newFlips, j, newFlipsLength));
        game.board = turnTile(game.board, game.currentPlayer, newFlipCol, newFlipRow);
      }
    }

    //no valid flips in directions
    if (valid) {
      game.board = turnTile(game.board, game.currentPlayer, col, row);
    } else {
      game.error = true;
      // game.msg = "Invalid Game (doesnt flip any other tiles)";
      return game;
    }

    // switch players
    if (game.currentPlayer == BLACK) {
      game.currentPlayer = WHITE;
    } else {
      game.currentPlayer = BLACK;
    }
    return game;
  }

  function getPossibleDirections (Game game, uint8 col, uint8 row) internal constant returns(int8[2][8], uint8){
    int8[2][8] memory possibleDirections;
    uint8 possibleDirectionsLength = 0;
    int8[2][8] memory dirs = [
      [int8(-1), int8(0)], // W
      [int8(-1), int8(1)], // SW
      [int8(0), int8(1)], // S
      [int8(1), int8(1)], // SE
      [int8(1), int8(0)], // E
      [int8(1), int8(-1)], // NE
      [int8(0), int8(-1)], // N
      [int8(-1), int8(-1)] // NW
    ];
    int8 focusedRowPos;
    int8 focusedColPos;
    int8[2] memory dir;
    uint8 testSquare;

    for (uint8 i = 0; i < 8; i++) {
      dir = dirs[i];
      focusedColPos = int8(col) + dir[0];
      focusedRowPos = int8(row) + dir[1];
      // if tile is off the board it is not a valid move
      if (!(focusedRowPos > 7 || focusedRowPos < 0 || focusedColPos > 7 || focusedColPos < 0)) {
        testSquare = returnTile(game.board, uint8(focusedColPos), uint8(focusedRowPos));
        // if the surrounding tile is current color or no color it can"t be part of a capture
        if (testSquare != game.currentPlayer) {
          if (testSquare != EMPTY) {
            possibleDirections[possibleDirectionsLength] = dir;
            possibleDirectionsLength++;
          }
        }
      }
    }
    return (possibleDirections, possibleDirectionsLength);
  }

  function traverseDirection(Game game, int8[2] dir, uint8 col, uint8 row) internal constant returns(bytes28, uint8) {
    bytes28 potentialFlips;
    uint8 potentialFlipsLength = 0;

    uint8 currentPlayer = game.currentPlayer;

    if (currentPlayer == BLACK) {
      uint8 opponentColor = WHITE;
    } else {
      opponentColor = BLACK;
    }

    // take one step at a time in this direction
    // ignoring the first step look for the same color as your tile
    bool skip = false;
    int8 testCol;
    int8 testRow;
    uint8 tile;
    for (uint8 j = 1; j < 9; j++) {
      if (!skip) {
        testCol = (int8(j) * dir[0]) + int8(col);
        testRow = (int8(j) * dir[1]) + int8(row);
        // ran off the board before hitting your own tile
        if (testCol > 7 || testCol < 0 || testRow > 7 || testRow < 0) {
          delete potentialFlips;
          potentialFlipsLength = 0;
          skip = true;
        } else{

          tile = returnTile(game.board, uint8(testCol), uint8(testRow));

          if (tile == opponentColor) {
            // if tile is opposite color it could be flipped, so add to potential flip array
            (potentialFlips, potentialFlipsLength) = addMove(potentialFlips, potentialFlipsLength, uint8(testCol), uint8(testRow));
          } else if (tile == currentPlayer && j > 1) {
            // hit current players tile which means capture is complete
            skip = true;
          } else {
            // either hit current players own color before hitting an opponent"s
            // or hit an empty space
            delete potentialFlips;
            delete potentialFlipsLength;
            skip = true;
          }
        }
      }
    }
    return (potentialFlips, potentialFlipsLength);
  }

  function isComplete (Game game) internal constant returns (Game) {
    if (game.moveKey == 60) {
      // game.msg = "good game";
      game.error = false;
      game.complete = true;
      return game;
    } else {
      uint8[2][60] memory empties;
      uint8 emptiesLength = 0;
      for (uint8 i = 0; i < 64; i++) {
        // for (uint8 j = 0; j < 8; j++) {
          uint8 tile = returnTile(game.board, ((i - (i % 8)) / 8), (i % 8));
          if (tile == EMPTY) {
            empties[emptiesLength] = [((i - (i % 8)) / 8), (i % 8)];
            emptiesLength++;
          }
        // }
      }
      bool validMovesRemains = false;
      if (emptiesLength > 0) {
        Game memory tmpGame;
        uint8[2] memory move;
        for (i = 0; i < emptiesLength && !validMovesRemains; i++) {
          move = empties[i];
          game.currentPlayer = BLACK;
          tmpGame = makeMove(game, move[0], move[1]);
          if (!tmpGame.error) {
            validMovesRemains = true;
          }
          game.currentPlayer = WHITE;
          tmpGame = makeMove(game, move[0], move[1]);
          if (!tmpGame.error) {
            validMovesRemains = true;
          }
        }
      } 
      if (validMovesRemains) {
        game.error = true;
        // game.msg = "Invalid Game (moves still available)";
      } else {
        // game.msg = "good game";
        game.complete = true;
        game.error = false;
      }
    }
    return game;
  }

  function isSymmetrical(Game game) internal constant returns (Game) {
    bool RotSym = true;
    bool Y0Sym = true;
    bool X0Sym = true;
    bool XYSym = true;
    bool XnYSym = true;
    for (uint8 i = 0; i < 8 && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); i++) {
      for (uint8 j = 0; j < 8 && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); j++) {

        // rotational symmetry
        if (returnBytes(game.board, i, j ) != returnBytes(game.board, (7 - i), (7 - j) ) ) {
          RotSym = false;
        }
        // symmetry on y = 0
        if (returnBytes(game.board, i, j ) != returnBytes(game.board, i, (7 - j) )) {
          Y0Sym = false;
        }
        // symetry on x = 0
        if (returnBytes(game.board, i, j ) != returnBytes(game.board, (7 - i), j ) ) {
          X0Sym = false;
        }
        // symmetry on x = y
        if (returnBytes(game.board, i, j ) != returnBytes(game.board, (7 - j) , (7 - i) ) ) {
          XYSym = false;
        }
        // symmetry on x = -y
        if (returnBytes(game.board, i, j ) != returnBytes(game.board, j, i ) ) {
          XnYSym = false;
        }
      }
    }
    if (RotSym || Y0Sym || X0Sym || XYSym || XnYSym) {
      game.symmetrical = true;
      game.RotSym = RotSym;
      game.Y0Sym = Y0Sym;
      game.X0Sym = X0Sym;
      game.XYSym = XYSym;
      game.XnYSym = XnYSym;
    }
    return game;
  }



  // Utilities

  function addBytes(bytes16 board, uint8 key, bytes16 tile) internal constant returns (bytes16) {
    board = shiftLeft(board, key);
    board = board | tile;
    return board;
  }

  function returnBytes(bytes16 board, uint8 col, uint8 row) internal constant returns (bytes16) {
    uint128 push = posToPush(col, row);
    bytes16 ones = bytes16(3);
    ones = shiftLeft(ones, push);
    bytes16 before = board & ones;
    return shiftRight(before, push);
  }

  function turnTile(bytes16 board, uint8 color, uint8 col, uint8 row) internal constant returns (bytes16){
    if (col > 7) throw;
    if (row > 7) throw;

    uint128 push = posToPush(col, row);
    bytes16 blank = bytes16(3); // 0b00000011 (ones)
    bytes16 block = shiftLeft(blank, push);

    board = ((board ^ block) & board);

    bytes16 move = bytes16(color);
    move = shiftLeft(move, push);

    return board | move;
  }

  function returnTile(bytes16 board, uint8 col, uint8 row) internal constant returns (uint8){
    uint128 push = posToPush(col, row);
    bytes16 ones = bytes16(3); // 0b00000011 (ones)
    ones = shiftLeft(ones, push); // 0b00011000 (ones shifted)
    bytes16 before = board & ones; // (board)0b01010101 & (ones)0b00011000 = (tile)0b00010000
    bytes16 tile = shiftRight(before, push); // 0b00000010 = 0b10
    return uint8(tile); // returns 2
  }

  function posToPush(uint8 col, uint8 row) internal constant returns (uint128){
    return uint128( ( (BOARDDIM * BOARDDIM) - ( (8 * col) + row + 1) ) * 2);
  }

  function readMove(bytes28 moveSequence, uint8 moveKey, uint8 movesLength) internal constant returns(uint8) {
    bytes28 mask = bytes28(127);
    uint8 push = (movesLength * 7) - (moveKey * 7) - 7;
    mask = shiftLeft28(mask, push);
    bytes28 move = moveSequence & mask;
    move = shiftRight28(move, push);
    return uint8(move);
  }

  function addMove(bytes28 moveSequence, uint8 movesLength, uint8 col, uint8 row) internal constant returns (bytes28, uint8) {
    bytes28 move = bytes28(col + (row * BOARDDIM) + 64);
    moveSequence = shiftLeft28(moveSequence, 7);
    moveSequence = moveSequence | move;
    movesLength++;
    return (moveSequence, movesLength);
  }

  function validMove(uint8 move) internal constant returns(bool) {
    return move >= 64;
  }

  function convertMove(uint8 move) internal constant returns(uint8, uint8) {
    move = move - 64;
    uint8 col = move % 8;
    uint8 row = (move - col) / 8;
    return (col, row);
  }

  function shiftLeft32(bytes32 a, uint256 n) internal constant returns (bytes32) {
      uint256 shifted = uint256(a) * 2 ** uint256(n);
      return bytes32(shifted);
  }

  function shiftRight32(bytes32 a, uint256 n) internal constant returns (bytes32) {
      uint256 shifted = uint256(a) / 2 ** uint256(n);
      return bytes32(shifted);
  }

  function shiftLeft28(bytes28 a, uint256 n) internal constant returns (bytes28) {
      uint256 shifted = uint256(a) * 2 ** uint256(n);
      return bytes28(shifted);
  }

  function shiftRight28(bytes28 a, uint256 n) internal constant returns (bytes28) {
      uint256 shifted = uint256(a) / 2 ** uint256(n);
      return bytes28(shifted);
  }

  function shiftLeft(bytes16 a, uint128 n) internal constant returns (bytes16) {
      uint128 shifted = uint128(a) * 2 ** uint128(n);
      return bytes16(shifted);
  }

  function shiftRight(bytes16 a, uint128 n) internal constant returns (bytes16) {
      uint128 shifted = uint128(a) / 2 ** uint128(n);
      return bytes16(shifted);
  }

}