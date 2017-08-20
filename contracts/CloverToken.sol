pragma solidity ^0.4.13;
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
    string[] moves;
    address[] previousOwners;
    uint lastPaidAmount;
    bool exists;
  }

  mapping (bytes16 => Board) public boards;
  bytes16[] public boardKeys;

  // event Registered(address[] previousOwners, uint lastPaidAmount, bytes16 board);
  event DebugSring(string print);
  event DebugMoves(uint8[2][] arr);

  function testMoves(uint8[2][] moves) public returns (uint8[2][]){
    DebugMoves(moves);
    DebugSring('working!');
    return moves;
  }  
  function testEvent(string hello) public returns(bool){
    DebugSring(hello);
    return true;
  }

  function boardExists(bytes16 b) public constant returns(bool) {
      return boards[b].exists;
  }

  function gameExists(uint8[2][] moves) public constant returns(bool) {
      Game memory game = playGame(moves);
      if (game.error) revert();
      return boards[game.board].exists;
  }

  function getBoardsCount() public constant returns(uint) {
    return boardKeys.length;
  }

  // function getBoard(bytes16 board) public constant returns(uint, bool, bytes16, address, string) {
  //   if(!boardExists(board)) revert();
  //   return (boards[board].lastPaidAmount, boards[board].exists, board, boards[board].previousOwners[boards[board].previousOwners.length - 1], boards[board].moves);
  // }

  function registerBoard(uint8[2][] moves) public returns(string) {
    Game memory game = playGame(moves);
    return saveGame(game);
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
    boards[game.board].moves = game.movesArray;
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

  struct Game {
  	bool error;
  	bool complete;
    uint8 currentPlayer;
    bytes16 board;
    string msg;
    string[] movesArray;
    uint8[8][8] boardArray;
  }

  uint8 EMPTY = 0;
  uint8 BLACK = 1;
  uint8 WHITE = 2;

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

    function playGame(uint8[2][] moves) internal returns (Game)  {
      Game memory game;
      game.error = false;
      game.complete = false;
      game.currentPlayer = BLACK;
      game.board = 0x0;
      game.msg = 'New Game';

    	for (uint8 i = 0; i < moves.length; i++) {
    		game = makeMove(game, moves[i]);
    		if (game.error) {
          if (game.currentPlayer == BLACK) {
            game.currentPlayer = WHITE;
          } else {
            game.currentPlayer = BLACK;
          }
    			game = makeMove(game, moves[i]);
    			if (game.error) {
    				return game;
    			}
    		}
    	}
      game = isComplete(game);
      return game;
    }
  
  function makeMove(Game game, uint8[2] move) internal returns (Game)  {
  	uint8 col = move[0];
  	uint8 row = move[1];
  	// square is already occupied
  	if(game.board[col][row] != 0) {
      game.msg = 'Invalid Game (makeMove)';
      game.error = true;
  		return game;
  	}
    int8[2][8] memory possibleDirections;
    uint8 possibleDirectionsLength;
  	(possibleDirections, possibleDirectionsLength) = getPossibleDirections(game, move);
  	// no valid directions
  	if (possibleDirectionsLength == 0) {
  		game.error = true;
      game.msg = 'Invalid Game (makeMove)';
  		return game;
  	}
    uint8[2][32] memory flips;
    uint8 flipsLength = 0;

    uint8[2][32] memory newFlips;
    uint8 newFlipsLength = 0;
  	for (uint8 i = 0; i < possibleDirectionsLength; i++) {
      delete newFlips;
      delete newFlipsLength;
      (newFlips, newFlipsLength) = traverseDirection(game, possibleDirections[i], move);
      for (uint8 j = 0; j < newFlipsLength; j++) {
        flips[flipsLength] = newFlips[j];
        flipsLength++;
      }
  	}
  	//no valid flips in directions
  	if (flipsLength == 0) {
  		game.error = true;
      game.msg = 'Not a valid move';
  		return game;
  	}
  	for (i = 0; i < flipsLength; i++) {
  		uint8[2] memory flip = flips[i];
  		game.boardArray[flip[0]][flip[1]] = game.currentPlayer;
  	}
  	return game;
  }

  function getPossibleDirections (Game game, uint8[2] move) internal constant returns(int8[2][8], uint8){
    int8[2][8] memory possibleDirections;
    uint8 possibleDirectionsLength = 0;
    int8[2][8] memory dirs = [
      [int8(-1), int8(0)], // N
      [int8(-1), int8(1)], // NE
      [int8(0), int8(1)], // E
      [int8(1), int8(1)], // SE
      [int8(1), int8(0)], // S
      [int8(1), int8(-1)], // SW
      [int8(0), int8(-1)], // W
      [int8(-1), int8(-1)] // NW
    ];
    for (uint8 i = 0; i < dirs.length; i++) {
      int8[2] memory dir = dirs[i];
      int8 focusedColPos = int8(move[0]) + dir[0];
      int8 focusedRowPos = int8(move[1]) + dir[1];
      // if tile is off the board it is not a valid move
      if (!(focusedRowPos > 8 || focusedRowPos < 1 || focusedColPos > 8 || focusedColPos < 1)) {
        uint8 testSquare = game.boardArray[uint8(focusedColPos)][uint8(focusedRowPos)];
        // if the surrounding tile is current color or no color it can't be part of a capture
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
  function traverseDirection(Game game, int8[2] dir, uint8[2] move) internal constant returns(uint8[2][32], uint8) {
    uint8[2][32] memory potentialFlips;
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
        uint8 testCol = uint8((int8(j) * dir[0]) + int8(move[0]));
        uint8 testRow = uint8((int8(j) * dir[1]) + int8(move[1]));
        // ran off the board before hitting your own tile
        if (testCol > 8 || testCol < 1 || testRow > 8 || testRow < 1) {
          delete potentialFlips;
          potentialFlipsLength = 0;
          skip = true;
        } else if (game.boardArray[testCol][testRow] == opponentColor) {
          // if tile is opposite color it coudl be flipped, so add to potential flip array
          potentialFlips[potentialFlipsLength] = [uint8(testCol), uint8(testRow)];
          potentialFlipsLength++;

        } else if (game.boardArray[testCol][testRow] == currentPlayer && j > 0) {
          // hit current players tile which means capture is complete
          skip = true;
        } else {
          // either hit current players own color before hitting an opponent's
          // or hit an empty space
          delete potentialFlips;
          potentialFlipsLength = 0;
          skip = true;
        }
      }
    }
    return (potentialFlips, potentialFlipsLength);
  }

  function isComplete (Game game) internal returns (Game) {
    uint8[2][32] memory empties;
    uint8 emptiesLength = 0;
    for (uint8 i = 0; i < game.boardArray.length; i++) {
      uint8[8] memory row = game.boardArray[i];
      for (uint8 j = 0; j < row.length; j++) {
        if (row[i] == EMPTY) {
          empties[emptiesLength] = [(i + 1), (j + 1)];
          emptiesLength++;
        }
      }
    }
  	if (emptiesLength > 0) {
      bool validMoveRemains = false;
      Game memory testGame;
      for (i = 0; i < emptiesLength; i++) {
        uint8[2] memory move = empties[i];
        game.currentPlayer = BLACK;
        testGame = makeMove(game, move);
        if (!testGame.error) {
          validMoveRemains = true;
        }
        game.currentPlayer = WHITE;
        testGame = makeMove(game, move);
        if (!testGame.error) {
          validMoveRemains = true;
        }
      }
      if (validMoveRemains) {
        game.complete = false;
        game.error = true;
        game.msg = 'Incomplete Game';
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





