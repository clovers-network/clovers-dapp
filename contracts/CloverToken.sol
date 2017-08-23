pragma solidity ^0.4.13;
// contract CloverToken {
//   string public name = 'foobar';
//   function helloWorld () public constant returns (string) {
//     return 'Hello, World!';
//   }
// }
import 'zeppelin-solidity/contracts/token/StandardToken.sol';
// import "solidity-stringutils/strings.sol";

contract CloverToken is StandardToken {
  // using strings for *;
  string public name = 'CloverToken';
  string public symbol = '♧';
  uint public decimals = 4;
  uint public INITIAL_SUPPLY = 10000000000; // four decimals

  function CloverToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  uint public flipStartValue = 1000000;
  uint public findersFee = 1000000;

  struct Board {
    uint8[2][] moves;
    address[] previousOwners;
    uint lastPaidAmount;
    bool exists;
  }

  mapping (bytes16 => Board) public boards;
  bytes16[] public boardKeys;


  struct Game {
    bool error;
    bool complete;
    uint8 currentPlayer;
    bytes16 board;
    string msg;
    bytes28 first32Moves;
    bytes28 lastMoves;
    uint8 moveKey;
    // uint8[2][] movesArray;
    // uint8[8][8] boardArray;
  }

  uint8 BOARDDIM = 8;

  uint8 EMPTY = 0; //0b00 //0x0
  uint8 BLACK = 1; //0b01 //0x1
  uint8 WHITE = 2; //0b10 //0x2

  // event Registered(address[] previousOwners, uint lastPaidAmount, bytes16 board);
  event DebugGame(uint8 moveKey, bool error, bool complete, uint8 currentPlayer, bytes16 board, string msg);
  event DebugMove(uint8 col, uint8 row);
  event DebugMoves(uint8[2][] arr);
  event DebugByte(bytes16 foo);
  event DebugUint(uint128 bar);

  function updateName (string newName) public{
    name = newName;
  }
  function updateSymbol (string newSymbol) public{
    symbol = newSymbol;
  }


  function boardExists(bytes16 b) public constant returns(bool) {
      return boards[b].exists;
  }

  function showGame(bytes28 first32Moves, bytes28 lastMoves) public returns(uint8 moveKey, bool error, bool complete, uint8 currentPlayer, bytes16 board, string msg) {
      Game memory game = playGame(first32Moves, lastMoves);
      return (game.moveKey, game.error, game.complete, game.currentPlayer, game.board, game.msg);
  }

  function showGameConstant(bytes28 first32Moves, bytes28 lastMoves) public constant returns(uint8 moveKey, bool error, bool complete, uint8 currentPlayer, bytes16 board, string msg) {
      Game memory game = playGame(first32Moves, lastMoves);
      return (game.moveKey, game.error, game.complete, game.currentPlayer, game.board, game.msg);
  }

  function gameExists(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
      Game memory game = playGame(first32Moves, lastMoves);
      if (game.error) return true;//revert();
      // if (!game.complete) return true;//revert();
      return boards[game.board].exists;
  }

  function returnByte(uint8 input) public constant returns (bytes16 output) {
    return bytes16(input);
  }

  // function boardToByte(uint8[8][8] boardArray) public constant returns(bytes16 board) {
  //   // DebugByte(bytes32(boardArray[0][0]));
  //   for(uint8 c = 0; c < 8; c++) {
  //     uint8[8] memory col = boardArray[c];
  //     for(uint8 r = 0; r < 8; r++) {
  //       if (col[r] != 0) {
  //         uint8 offset = (126 - (2 * c) - (r * 16) );
  //         bytes16 tileShifted = shiftLeft(bytes16(col[r]),  uint128(offset));
  //         board = board | tileShifted;
  //       }
  //     }
  //   }
  //   return board;
  // }

  function posToPush(uint8 col, uint8 row) public constant returns (uint128){
    return uint128( ( (BOARDDIM * BOARDDIM) - ( (8 * col) + row + 1) ) * 2);
  }

  function turnTile(bytes16 board, uint8 color, uint8 col, uint8 row) public constant returns (bytes16){

    if (col > 7) throw;
    if (row > 7) throw;
    if (color > 2) throw;

    uint128 push = posToPush(col, row);
    bytes16 blank = bytes16(3); // 0b00000011 (ones)
    bytes16 block = shiftLeft(blank, push);

    // bytes16 blank = bytes16(-1);
    // bytes16 block = shiftLeft(blank, push + 2);
    // block = block | shiftLeft(blank, push - 2);

    board = ((board ^ block) & board);

    bytes16 move = bytes16(color);
    move = shiftLeft(move, push);

    return board | move;
  }

  function returnTile(bytes16 board, uint8 col, uint8 row) public constant returns (uint8){
    if (col > 7) throw;
    if (row > 7) throw;
    if (row < 0) throw;
    if (col < 0) throw;
    uint128 push = posToPush(col, row);
    bytes16 ones = bytes16(3); // 0b00000011 (ones)
    ones = shiftLeft(ones, push); // 0b00011000 (ones shifted)
    bytes16 before = board & ones; // (board)0b01010101 & (ones)0b00011000 = (tile)0b00010000
    bytes16 tile = shiftRight(before, push); // 0b00000010 = 0b10
    return uint8(tile); // returns 2
  }

  function addMove(bytes28 moveSequence, uint8 movesLength, uint8 col, uint8 row) returns (bytes28, uint8) {
    bytes28 move = bytes28(col + (row * BOARDDIM) + 64);
    moveSequence = shiftLeft28(moveSequence, 7);
    moveSequence = moveSequence | move;
    movesLength++;
    return (moveSequence, movesLength);
  }

  function validMove(uint8 move) returns(bool) {
    return move >= 64;
  }

  function convertMove(uint8 move) returns(uint8, uint8) {
    move = move - 64;
    uint8 col = move % 8;
    uint8 row = (move - col) / 8;
    return (col, row);
  }

  function readMove(bytes28 moveSequence, uint8 moveKey, uint8 movesLength) returns(uint8) {
    bytes28 mask = bytes28(127);
    uint8 push = (movesLength * 7) - (moveKey * 7) - 7;
    mask = shiftLeft28(mask, push);
    bytes28 move = moveSequence & mask;
    move = shiftRight28(move, push);
    return uint8(move);
  }

  function shiftLeft28(bytes28 a, uint256 n) public constant returns (bytes28) {
      uint256 shifted = uint256(a) * 2 ** uint256(n);
      return bytes28(shifted);
  } 

  function shiftRight28(bytes28 a, uint256 n) public constant returns (bytes28) {
      uint256 shifted = uint256(a) / 2 ** uint256(n);
      return bytes28(shifted);
  }
  function shiftLeft(bytes16 a, uint128 n) public constant returns (bytes16) {
      uint128 shifted = uint128(a) * 2 ** uint128(n);
      return bytes16(shifted);
  }  

  function shiftRight(bytes16 a, uint128 n) public constant returns (bytes16) {
      uint128 shifted = uint128(a) / 2 ** uint128(n);
      return bytes16(shifted);
  }


  // function shiftLeft(uint128 a, uint128 n) public constant returns (bytes16) {
  //     // DebugUint(uint128(a));
  //     // DebugUint(uint128(n));
  //     uint128 shifted = uint128(a) * 2 ** uint128(n);
  //     return bytes16(shifted);
  // }

  function getBoardsCount() public constant returns(uint) {
    return boardKeys.length;
  }

  // function getBoard(bytes16 board) public constant returns(uint, bool, bytes16, address, string) {
  //   if(!boardExists(board)) revert();
  //   return (boards[board].lastPaidAmount, boards[board].exists, board, boards[board].previousOwners[boards[board].previousOwners.length - 1], boards[board].moves);
  // }

  function registerBoard(bytes28 first32Moves, bytes28 lastMoves) public returns(string) {
    Game memory game = playGame(first32Moves, lastMoves);
    return 'asfd';
    // return saveGame(game);
  }

  // function registerBoardString(string moves) public returns (string ret) {
  //   Game memory game = playGameString(moves);
  //   return saveGame(game);
  // }

  function saveGame(Game game) internal returns (string) {
    if (game.error) return game.msg;
    if (!game.complete) return game.msg;
    // if(boardExists(game.board)) return 'Game Already Exists'; //board is still 0x0
    balances[msg.sender] += findersFee;
    // boards[game.board].moves = game.movesArray;
    boards[game.board].previousOwners.push(msg.sender);
    boards[game.board].lastPaidAmount = flipStartValue;
    boards[game.board].exists = true;
    // Registered(boards[game.board].previousOwners, boards[game.board].lastPaidAmount, games.board);
    boardKeys.push(game.board);
    return 'Success';
  }

  function buyBoard(bytes16 b) public returns(bool) {
    if(!boardExists(b)) revert();
    uint nextPrice = boards[b].lastPaidAmount.mul(2);
    if (balances[msg.sender] < nextPrice) revert();
    address lastOwner = boards[b].previousOwners[ boards[b].previousOwners.length.sub(1) ];
    balances[msg.sender] = balances[msg.sender].sub(nextPrice);
    balances[lastOwner] = balances[lastOwner].add(nextPrice);
    boards[b].previousOwners.push(msg.sender);
    boards[b].lastPaidAmount = nextPrice;
    return true;
  }



  // struct Move {
  // 	uint8 col;
  // 	uint8 row
  // }

    // function convertMoves(string moves) internal constant returns (uint8[2][] movesArray) {
    //   var s = moves.toSlice();
    //   var delim = "-".toSlice();
    //   var parts = new string[](s.count(delim));
    //   for(uint i = 0; i < parts.length; i++) {
    //     // unsure of this casting
    //      parts[i] = s.split(delim).toString();
    //   }
    // }

    // function playGameString(string moves) internal constant returns (Game ret) {
    //   return playGame(convertMoves(moves));
    // }

    function playGame(bytes28 first32Moves, bytes28 lastMoves) internal returns (Game)  {
      Game memory game;

      game.first32Moves = first32Moves;
      game.lastMoves = lastMoves;
      game.moveKey = 0;

      game.error = false;
      game.complete = false;
      game.currentPlayer = BLACK;
      
      game.board = turnTile(game.board, WHITE, 3, 3);
      game.board = turnTile(game.board, WHITE, 4, 4);
      game.board = turnTile(game.board, BLACK, 3, 4);
      game.board = turnTile(game.board, BLACK, 4, 3);

      game.msg = 'New Game';
      bool skip = false;
      bool valid;
      uint8 move;
      uint8 col;
      uint8 row;
    	for (uint8 i = 0; i < 60 && !skip; i++) {

        bytes28 currentMoves = game.moveKey < 32 ? game.first32Moves : game.lastMoves;

        move = readMove(currentMoves, game.moveKey % 32, 32);
        valid = validMove(move);
        (col, row) = convertMove(move);
        DebugMove(col, row);
        if (valid) {
          game.msg = 'make a move';
          // DebugMove(col, row);
          game = makeMove(game, col, row);
          game.moveKey++;
          DebugGame(game.moveKey, game.error, game.complete, game.currentPlayer, game.board, game.msg);
        } else {
          DebugMove(col, row);
          game.msg = 'game over?';
          skip = true;
        }
        if (game.error) {
          game.msg = 'do a pass';
          game.error = false;
          // maybe player has no valid moves and must pass
          if (game.currentPlayer == BLACK) {
            game.currentPlayer = WHITE;
          } else {
            game.currentPlayer = BLACK;
          }
          game = makeMove(game, col, row);
          DebugGame(game.moveKey, game.error, game.complete, game.currentPlayer, game.board, game.msg);
          if (game.error) {
            game.complete = true;
            return game;
          }
        }
    	}
      // game = isComplete(game);
      return game;
    }
  
  function makeMove(Game game, uint8 col, uint8 row) internal constant returns (Game)  {
    // DebugMove(col, row);
  	// square is already occupied
    if (returnTile(game.board, col, row) != 0){
      game.error = true;
      game.msg = 'Invalid Game (square is already occupied)';
  		return game;
  	}
    int8[2][8] memory possibleDirections;
    uint8  possibleDirectionsLength;
  	(possibleDirections, possibleDirectionsLength) = getPossibleDirections(game, col, row);
  	// no valid directions
  	if (possibleDirectionsLength == 0) {
  		game.error = true;
      game.msg = 'Invalid Game (doesnt border other tiles)';
  		return game;
  	}

    bytes28 flips;
    uint8 flipsLength;

    bytes28 newFlips;
    uint8 newFlipsLength;
    uint8 newFlipCol;
    uint8 newFlipRow;

  	for (uint8 i = 0; i < possibleDirectionsLength; i++) {
      delete newFlips;
      delete newFlipsLength;
      (newFlips, newFlipsLength) = traverseDirection(game, possibleDirections[i], col, row);
      for (uint8 j = 0; j < newFlipsLength; j++) {
        (newFlipCol, newFlipRow) = convertMove(readMove(newFlips, j, newFlipsLength));
        // DebugMove(newFlipCol, newFlipRow);
        (flips, flipsLength) = addMove(flips, flipsLength, newFlipCol, newFlipRow);
      }
  	}
  	//no valid flips in directions
  	if (flipsLength == 0) {
  		game.error = true;
      game.msg = 'Invalid Game (doesnt flip any other tiles)';
  		return game;
  	}
    game.board = turnTile(game.board, game.currentPlayer, col, row);
  	for (i = 0; i < flipsLength; i++) {
      // DebugGame(game.error, game.complete, game.currentPlayer, game.board, game.msg);
      // DebugMove(newFlipCol, newFlipRow);
      (newFlipCol, newFlipRow) = convertMove(readMove(flips, i, flipsLength));
      game.board = turnTile(game.board, game.currentPlayer, newFlipCol, newFlipRow);
  	}


    // switch players
    if (game.currentPlayer == BLACK) {
      game.currentPlayer = WHITE;
    } else {
      game.currentPlayer = BLACK;
    }
    // DebugGame(game.currentPlayer, game.boardArray, game.msg, move);
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
    for (uint8 i = 0; i < 8; i++) {
      int8[2] memory dir = dirs[i];
      int8 focusedColPos = int8(col) + dir[0];
      int8 focusedRowPos = int8(row) + dir[1];
    //   // // if tile is off the board it is not a valid move
      if (!(focusedRowPos > 7 || focusedRowPos < 0 || focusedColPos > 7 || focusedColPos < 0)) {
        uint8 testSquare = returnTile(game.board, uint8(focusedColPos), uint8(focusedRowPos));
    //     // if the surrounding tile is current color or no color it can't be part of a capture
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
    // DebugMove(col, row);

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
    for (uint8 j = 1; j < 9; j++) {
      if (!skip) {
        int8 testCol = (int8(j) * dir[0]) + int8(col);
        int8 testRow = (int8(j) * dir[1]) + int8(row);
        // ran off the board before hitting your own tile
        if (testCol > 7 || testCol < 0 || testRow > 7 || testRow < 0) {
          delete potentialFlips;
          potentialFlipsLength = 0;
          skip = true;
        // } else if (game.boardArray[testCol][testRow] == opponentColor) {
        } else{

          uint8 tile = returnTile(game.board, uint8(testCol), uint8(testRow));

          if (tile == opponentColor) {
            // DebugMove(uint8(testCol), uint8(testRow));
            // DebugMove(uint8(testCol), uint8(testRow));
            // if tile is opposite color it coudl be flipped, so add to potential flip array
            (potentialFlips, potentialFlipsLength) = addMove(potentialFlips, potentialFlipsLength, uint8(testCol), uint8(testRow));
            // potentialFlips[potentialFlipsLength] = [uint8(testCol), uint8(testRow)];
            // potentialFlipsLength++;

          // } else if (game.boardArray[testCol][testRow] == currentPlayer && j > 0) {
          } else if (tile == currentPlayer && j > 1) {
            // hit current players tile which means capture is complete
            skip = true;
          } else {
            // either hit current players own color before hitting an opponent's
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

  function isComplete (Game game) internal returns (Game) {
    uint8[2][32] memory empties;
    uint8 emptiesLength = 0;
    for (uint8 i = 0; i < 8; i++) {
      // uint8[8] memory row = game.boardArray[i];
      for (uint8 j = 0; j < 8; j++) {
        uint8 tile = returnTile(game.board, i, j);
        // if (row[i] == EMPTY) {
        if (tile == EMPTY) {
          empties[emptiesLength] = [(i), (j)];
          emptiesLength++;
        }
      }
    }
  	if (emptiesLength > 0) {
      bool validMoveRemains = false;
      Game memory tmpGame;
      for (i = 0; i < emptiesLength; i++) {
        uint8[2] memory move = empties[i];
        game.currentPlayer = BLACK;
        tmpGame = makeMove(game, move[0], move[1]);
        if (!tmpGame.error) {
          validMoveRemains = true;
        }
        game.currentPlayer = WHITE;
        tmpGame = makeMove(game, move[0], move[1]);
        if (!tmpGame.error) {
          validMoveRemains = true;
        }
      }
      if (validMoveRemains) {
        game.complete = false;
        game.error = true;
        game.msg = 'Invalid Game (moves still available)';
      }
		} else {
			game.complete = true;	
		}
		return game;
  }




//  //  function movesToInt(string memory moves) returns (uint8) {

// 	// }
// 	// function gameToKey (board) returns (uint8) {
// 	// 	string endgame;
// 	// 	for (uint8 i = 0; i < board.length; i++) {
// 	// 		row = board[i]
// 	// 		for(uintj = 0; j < row.length; j++) {
// 	// 			endgame += row[j]
// 	// 		}
// 	// 	}
// 	// 	return stringToInt(endgame)
// 	// }
// 	// function stringToInt(string endgame) returns (uint8) {

// 	// }

// 	function stringToBytes(string key) public constant returns (bytes32 ret) {
//     if (bytes(key).length > 32) {
//       revert();
//     }

//     assembly {
//       ret := mload(add(key, 32))
//     }
//   }
//   function bytes32ToString(bytes32 x) constant returns (string) {
//     bytes memory bytesString = new bytes(32);
//     uint charCount = 0;
//     for (uint j = 0; j < 32; j++) {
//         byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
//         if (char != 0) {
//             bytesString[charCount] = char;
//             charCount++;
//         }
//     }
//     bytes memory bytesStringTrimmed = new bytes(charCount);
//     for (j = 0; j < charCount; j++) {
//         bytesStringTrimmed[j] = bytesString[j];
//     }
//     return string(bytesStringTrimmed);
//   }

//   function uintToBytes(uint v) constant returns (bytes32 ret) {
//     if (v == 0) {
//         ret = '0';
//     }
//     else {
//         while (v > 0) {
//             ret = bytes32(uint(ret) / (2 ** 8));
//             ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
//             v /= 10;
//         }
//     }
//     return ret;
// }

}





