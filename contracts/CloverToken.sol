pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

library StringAsKey {
  
}

contract CloverToken is StandardToken {
  string public name = 'CloverToken';
  string public symbol = '♣︎';
  uint public decimals = 4;
  uint public INITIAL_SUPPLY = 10000;

  function CloverToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
  bytes32[] Gamekeys;
  mapping(bytes32 => address) Games;

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

  function returnGame(string moves) public constant returns (address) {
  	return Games[stringToBytes(moves)];
  }  

  function returnKeys() public constant returns (uint) {
  	return Gamekeys.length;
  }

	function getThrowaway() public returns (bytes32){
		registerGame(uintToBytes(Gamekeys.length));
		registerGame(uintToBytes(Gamekeys.length + 1));
		registerGame(uintToBytes(Gamekeys.length + 2));
		registerGame(uintToBytes(Gamekeys.length + 3));
		registerGame(uintToBytes(Gamekeys.length + 4));
	}

  function registerGame(bytes32 moves) public returns (string){
  	if (Games[moves] != address(0x0)) {
  		revert();
		} else {
	  	Games[moves] = msg.sender;
	  	Gamekeys.push(moves);
	  	balances[msg.sender]++;
		}
  	// game = playGame(moves)
  	// if (game.error) return false
  	// if (!game.complete) return false
  	// if (Games[gameToKey(game.board)]) return false
  	// Games[game.board] = msg.sender
   //  balances[msg.sender]++
  }

 //  function playGame(string moves)  returns (struct Game)  {
 //  	new Game game;
 //  	moves = convertMoves(moves)
 //  	moves = moves.split(2)
 //  	for (uint8 i = 0; i < moves.length; i++) {
 //  		game = makeMove(game, moves[i])
 //  		if (game.error) {
 //  			game.currentPlayer = (game.CurrentPlayer + 1) % 2;
 //  			game = makeMove(game, moves[i])
 //  			if (game.error) {
 //  				return game
 //  			}
 //  		}
 //  	}
 //  	return isComplete(game)
 //  }

 //  function makeMove(struct Game game, uint8 move) returns (struct Game)  {
 //  	uint8 col = move[0]
 //  	uint8 row = move[1]
 //  	// square is already occupied
 //  	if(Game.board[col][row] != 3) {
 //  		Game.error = true
 //  		return Game
 //  	}

 //  	possibleDirections = getPossibleDirections()
 //  	// no valid directions
 //  	if (possibleDirections.length == 0) {
 //  		Game.error = true
 //  		return Game
 //  	}
 //  	uint flips = []
 //  	for (uint8 i = 0; i < possibleDirections.length; i++) {
 //  		flips.push(traverseDirection(possibleDirections[i]))
 //  	}
 //  	//no valid flips in directions
 //  	if (flips.length == 0) {
 //  		Game.error = true
 //  		return Game
 //  	}
 //  	for (uint8 i = 0; i < flips.length; i++) {
 //  		flip = flips[i]
 //  		Game.board[flip.col][flip.row] = Game.currentPlayer;
 //  	}
 //  	return Game
 //  }

 //  function getPossibleDirections () {

 //  }

 //  function traverseDirection() {

 //  }

 //  function isComplete (struct Game game)  returns (struct Game) {
 //  	bool isFull = true;
 //  	memory mapping(uint8 => Move) empties;
 //  	for (uint8 i = 0; i < game.board.length; i++) {
 //  		for (uint8 j = 0; j < game.board[i]; j++) {
 //  			if (game.board[i][j] === 3) {
 //  				isFull = false
 //  			}
 //  		}
 //  	}
 //  	if (!isFull) {

	// 	} else {
	// 		game.complete = true		
	// 	}
	// 	return game
 //  }

 //  function movesToInt(string memory moves) returns (uint8) {

	// }
	// function gameToKey (board) returns (uint8) {
	// 	string endgame;
	// 	for (uint8 i = 0; i < board.length; i++) {
	// 		row = board[i]
	// 		for(uintj = 0; j < row.length; j++) {
	// 			endgame += row[j]
	// 		}
	// 	}
	// 	return stringToInt(endgame)
	// }
	// function stringToInt(string endgame) returns (uint8) {

	// }

	function stringToBytes(string key) returns (bytes32 ret) {
    if (bytes(key).length > 32) {
      revert();
    }

    assembly {
      ret := mload(add(key, 32))
    }
  }

  function uintToBytes(uint v) constant returns (bytes32 ret) {
    if (v == 0) {
        ret = '0';
    }
    else {
        while (v > 0) {
            ret = bytes32(uint(ret) / (2 ** 8));
            ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
            v /= 10;
        }
    }
    return ret;
}

}





