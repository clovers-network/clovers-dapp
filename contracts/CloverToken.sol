pragma solidity ^0.4.13;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract CloverToken is StandardToken {
  string public name = 'CloverToken';
  string public symbol = '♧';
  uint public decimals = 4;
  uint public INITIAL_SUPPLY = 1000000;

  function CloverToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  uint public flipStartValue = 1;
  uint public findersFee = 100;

  struct Board {
    // string moves;
    address[] previousOwners;
    uint lastPaidAmount;
    bool exists;
  }

  mapping (bytes16 => Board) public boards;
  bytes16[] public boardKeys;

  event Registered(address[] previousOwners, uint lastPaidAmount, bytes16 board);

  function exists(bytes16 board) public constant returns(bool isIndeed) {
      return boards[board].exists;
  }

  function getBoardsCount() public constant returns(uint boardsCount) {
    return boardKeys.length;
  }

  function registerBoard(bytes16 board) internal returns (uint rowNumber){
    // bytes16 board = movesToBoard(moves)
    if(exists(board)) revert();
    // boards[board].moves = msg.sender;
    balances[msg.sender] = balances[msg.sender].add(findersFee);
    boards[board].previousOwners.push(msg.sender);
    boards[board].lastPaidAmount = flipStartValue;
    boards[board].exists = true;
    Registered(boards[board].previousOwners, boards[board].lastPaidAmount, board);
    return boardKeys.push(board) - 1;
  }

  function buyBoard(bytes16 board) public returns(bool success) {
    if(!exists(board)) revert();
    uint nextPrice = boards[board].lastPaidAmount.mul(2);
    if (balances[msg.sender] < nextPrice) revert();
    address lastOwner = boards[board].previousOwners[ boards[board].previousOwners.length.sub(1) ];
    balances[msg.sender] = balances[msg.sender].sub(nextPrice);
    balances[lastOwner] = balances[lastOwner].add(nextPrice);
    boards[board].previousOwners.push(msg.sender);
    boards[board].lastPaidAmount = nextPrice;
    return true;
  }

  // struct Game {
  // 	bool error = false;
  // 	bool complete = false;
  // 	uint8[8][8] board;
  // 	uint8 currentPlayer = 0; //0 = black, 1 = white, 3 = green
  // }

  // struct Move {
  // 	uint8 col;
  // 	uint8 row
  // }

//   function returnGame(string moves) public constant returns (address) {
//   	return Games[stringToBytes(moves)];
//   }  

//   function returnKeys() public constant returns (uint) {
//   	return Gamekeys.length;
//   }

// 	function getThrowaway() public returns (bytes32){
// 		registerGame(uintToBytes(Gamekeys.length));
// 	}

//   function registerGame(bytes16 board) public returns (string){
//   	if (Boards[moves] != address(0x0)) {
//   		revert();
// 		} else {
// 	  	Boards[moves] = msg.sender;
// 	  	Gamekeys.push(moves);
// 	  	balances[msg.sender]++;
// 		}
//   	// game = playGame(moves)
//   	// if (game.error) return false
//   	// if (!game.complete) return false
//   	// if (Games[gameToKey(game.board)]) return false
//   	// Games[game.board] = msg.sender
//    //  balances[msg.sender]++
//   }

//  //  function playGame(string moves)  returns (struct Game)  {
//  //  	new Game game;
//  //  	moves = convertMoves(moves)
//  //  	moves = moves.split(2)
//  //  	for (uint8 i = 0; i < moves.length; i++) {
//  //  		game = makeMove(game, moves[i])
//  //  		if (game.error) {
//  //  			game.currentPlayer = (game.CurrentPlayer + 1) % 2;
//  //  			game = makeMove(game, moves[i])
//  //  			if (game.error) {
//  //  				return game
//  //  			}
//  //  		}
//  //  	}
//  //  	return isComplete(game)
//  //  }

//  //  function makeMove(struct Game game, uint8 move) returns (struct Game)  {
//  //  	uint8 col = move[0]
//  //  	uint8 row = move[1]
//  //  	// square is already occupied
//  //  	if(Game.board[col][row] != 3) {
//  //  		Game.error = true
//  //  		return Game
//  //  	}

//  //  	possibleDirections = getPossibleDirections()
//  //  	// no valid directions
//  //  	if (possibleDirections.length == 0) {
//  //  		Game.error = true
//  //  		return Game
//  //  	}
//  //  	uint flips = []
//  //  	for (uint8 i = 0; i < possibleDirections.length; i++) {
//  //  		flips.push(traverseDirection(possibleDirections[i]))
//  //  	}
//  //  	//no valid flips in directions
//  //  	if (flips.length == 0) {
//  //  		Game.error = true
//  //  		return Game
//  //  	}
//  //  	for (uint8 i = 0; i < flips.length; i++) {
//  //  		flip = flips[i]
//  //  		Game.board[flip.col][flip.row] = Game.currentPlayer;
//  //  	}
//  //  	return Game
//  //  }

//  //  function getPossibleDirections () {

//  //  }

//  //  function traverseDirection() {

//  //  }

//  //  function isComplete (struct Game game)  returns (struct Game) {
//  //  	bool isFull = true;
//  //  	memory mapping(uint8 => Move) empties;
//  //  	for (uint8 i = 0; i < game.board.length; i++) {
//  //  		for (uint8 j = 0; j < game.board[i]; j++) {
//  //  			if (game.board[i][j] === 3) {
//  //  				isFull = false
//  //  			}
//  //  		}
//  //  	}
//  //  	if (!isFull) {

// 	// 	} else {
// 	// 		game.complete = true		
// 	// 	}
// 	// 	return game
//  //  }

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





