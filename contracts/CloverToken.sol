pragma solidity ^0.4.13;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import "solidity-stringutils/strings.sol";

contract CloverToken is StandardToken {
  using strings for *;
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
  event DebugMoves(uint8[] arr);

  function testMoves(uint8[2][] moves) public constant returns (uint8[2][] arr){
    return moves;
    // DebugMoves(moves);
    // DebugSring('working!');
  }  
  function testEvent(string hello) public constant returns(bool fuckyou){
    DebugSring(hello);
    return true;
  }

  function boardExists(bytes16 board) public constant returns(bool isIndeed) {
      return boards[board].exists;
  }

  function gameExists(int8[2][] moves) public constant returns(bool isIndeed) {
      Game memory game = playGame(moves);
      if (game.error) return true;
      return boards[game.board].exists;
  }

  function getBoardsCount() public constant returns(uint boardsCount) {
    return boardKeys.length;
  }

  // function getBoard(bytes16 board) public constant returns(uint, bool, bytes16, address, string) {
  //   if(!boardExists(board)) revert();
  //   return (boards[board].lastPaidAmount, boards[board].exists, board, boards[board].previousOwners[boards[board].previousOwners.length - 1], boards[board].moves);
  // }

  function registerBoard(int8[2][] moves) public returns(string ret) {
    Game memory game = playGame(moves);
    return evalGame(game);
  }

  // function registerBoardString(string moves) public returns (string ret) {
  //   Game memory game = playGameString(moves);
  //   return evalGame(game);
  // }

  function evalGame(Game game) internal returns (string ret) {
    if (game.error) return game.msg;
    if (!game.complete) return game.msg;
    if(boardExists(game.board)) return 'Game Already Exists';
    balances[msg.sender] += findersFee;
    boards[game.board].moves = game.movesArray;
    boards[game.board].previousOwners.push(msg.sender);
    boards[game.board].lastPaidAmount = flipStartValue;
    boards[game.board].exists = true;
    // Registered(boards[game.board].previousOwners, boards[game.board].lastPaidAmount, games.board);
    boardKeys.push(game.board);
    return 'Success';
  }

  function buyBoard(bytes16 board) public returns(bool success) {
    if(!boardExists(board)) revert();
    uint nextPrice = boards[board].lastPaidAmount.mul(2);
    if (balances[msg.sender] < nextPrice) revert();
    address lastOwner = boards[board].previousOwners[ boards[board].previousOwners.length.sub(1) ];
    balances[msg.sender] = balances[msg.sender].sub(nextPrice);
    balances[lastOwner] = balances[lastOwner].add(nextPrice);
    boards[board].previousOwners.push(msg.sender);
    boards[board].lastPaidAmount = nextPrice;
    return true;
  }

  struct Game {
  	bool error;
  	bool complete;
    uint8 currentPlayer;
    bytes16 board;
    string msg;
    string[] movesArray;
    int8[8][8] boardArray;
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

    function playGame(int8[2][] moves) internal constant returns (Game ret)  {
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

  function makeMove(Game game, int8[2] move) internal returns (Game game)  {
  	int8 col = move[0];
  	int8 row = move[1];
  	// square is already occupied
  	if(game.board[col][row] != 0) {
      game.msg = 'Invalid Game (makeMove)';
      game.error = true;
  		return game;
  	}

  	int8[2][] memory possibleDirections = getPossibleDirections(game, move);
  	// no valid directions
  	if (possibleDirections.length == 0) {
  		game.error = true;
  		return game;
  	}
    int8[2][] memory flips;
  	for (uint8 i = 0; i < possibleDirections.length; i++) {
  		flips[flips.length] = traverseDirection(game, possibleDirections[i], move);
      flips.length  = flips.length + 1;
  	}
  	//no valid flips in directions
  	if (flips.length == 0) {
  		game.error = true;
      game.msg = 'Not a valid move';
  		return game;
  	}
  	for (uint8 i = 0; i < flips.length; i++) {
  		int8[2] flip = flips[i];
  		game.boardArray[flip[0]][flip[1]] = game.currentPlayer;
  	}
  	return game;
  }

  function getPossibleDirections (Game game, int8[2] move) internal returns(int8[2][] possibleD){
    int8[2][] memory possibleDirections;
    int8[2][8] memory dirs = [
      [int(-1), int(0)], // N
      [int(-1), int(1)], // NE
      [int(0), int(1)], // E
      [int(1), int(1)], // SE
      [int(1), int(0)], // S
      [int(1), int(-1)], // SW
      [int(0), int(-1)], // W
      [int(-1), int(-1)] // NW
    ];
    for (uint8 i = 0; i < dirs.length; i++) {
      int8[2] memory dir = dirs[i];
      int8 focusedColPos = int8(move[0]) + dir[0];
      int8 focusedRowPos = int8(move[1]) + dir[1];
      // if tile is off the board it is not a valid move
      if (!(focusedRowPos > 7 || focusedRowPos < 0 || focusedColPos > 7 || focusedColPos < 0)) {
        int8 testSquare = game.boardArray[focusedColPos][focusedRowPos];
        // if the surrounding tile is current color or no color it can't be part of a capture
        if (testSquare != game.currentPlayer) {
          if (testSquare != EMPTY) {
            possibleDirections[possibleDirections.length] = dir;
            possibleDirections.length = possibleDirections.length + 1;
          }
        }
      }
    }
    return possibleDirections;
  }

  function traverseDirection(Game game, int8[2] dir, int8[2] move) internal returns(int8[2][] potentialFlips) {
    int8[2][] memory potentialFlips;

    uint8 currentPlayer = game.currentPlayer;

    if (currentPlayer == BLACK) {
      uint8 opponentColor = WHITE;
    } else {
      uint8 opponentColor = BLACK;
    }

    // take one step at a time in this direction
    // ignoring the first step look for the same color as your tile
    bool skip = false;
    for (uint8 j = 1; j < 9; j++) {
      if (!skip) {
        int8 testCol = (int8(j) * dir[0]) + int8(move[0]);
        int8 testRow = (int8(j) * dir[1]) + int8(move[1]);
        // ran off the board before hitting your own tile
        if (testCol > 7 || testCol < 0 || testRow > 7 || testRow < 0) {
          potentialFlips.length = 0;
          skip = true;
        } else if (game.boardArray[testCol][testRow] == opponentColor) {
          // if tile is opposite color it coudl be flipped, so add to potential flip array
          potentialFlips[potentialFlips.length] = [testCol, testRow];
          potentialFlips.length = potentialFlips.length + 1;
        } else if (game.boardArray[testCol][testRow] == currentPlayer && j > 0) {
          // hit current players tile which means capture is complete
          skip = true;
        } else {
          // either hit current players own color before hitting an opponent's
          // or hit an empty space
          potentialFlips.length = 0;
          skip = true;
        }
      }
    }
    return potentialFlips;
  }

  function isComplete (Game game) internal returns (Game game) {
    int8[2][] memory empties;
    for (int8 i = 0; i < game.boardArray.length; i++) {
      int8[8] memory row = game.boardArray[i];
      for (int8 j = 0; j < row.length; j++) {
        if (row[i] == EMPTY) {
          empties[empties.length] = [int8(i), int8(j)];
          empties.length = empties.length + 1;
        }
      }
    }
  	if (empties.length > 0) {
      bool validMoveRemains = false;
      Game memory testGame;
      for (int8 i = 0; i < empties.length; i++) {
        int8[2] memory move = empties[i];
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





