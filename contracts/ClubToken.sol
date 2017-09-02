pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import './Reversi.sol';

contract ClubToken is StandardToken, Reversi {



  // Token Contract

  string public name = 'ClubToken';
  string public symbol = '♧';
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 1000000; // four decimals
  address public owner;

  function ClubToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    admins[msg.sender] = true;
    adminKeys.push(msg.sender);
    owner = msg.sender;
  }



  // Modifiers

  modifier onlyOwner { if (msg.sender != owner) revert(); _; }
  modifier onlyAdmin { if (!admins[msg.sender]) revert(); _; }
  modifier doesNotExist(bytes16 b) { if (clovers[b].exists) revert(); _; }
  modifier exists(bytes16 b) { if (!clovers[b].exists) revert(); _; }



  // Events

  event Registered(address newOwner, uint256 lastPaidAmount, bytes16 board);
  event DebugGame(uint8 moveKey, bool error, bool complete, bool symmetrical, uint8 currentPlayer, bytes16 board, string msg);



  // Contract Administration

  mapping(address => bool) public admins;
  address[] public adminKeys;

  function addAdmin (address newbie) public onlyAdmin() {
    if (!admins[msg.sender]) revert();
    admins[newbie] = true;
    adminKeys.push(newbie);
  }

  function updateName (string newName) public onlyAdmin() {
    name = newName;
  }

  function updateSymbol (string newSymbol) public onlyAdmin() {
    if (!admins[msg.sender]) revert();
    symbol = newSymbol;
  }



  // Player Management

  struct Player {
    mapping(bytes16 => bool) clovers;
    bytes16[] cloverKeys;
    uint currentCount;
    bool exists;
  }

  mapping(address => Player) public players;
  address[] public playerKeys;

  function listPlayerCount() public constant returns(uint) {
    return playerKeys.length;
  }

  function playerAddressByKey(uint playerKey) public constant returns(address) {
    return playerKeys[playerKey];
  }

  function playerExists(address player) public constant returns(bool) {
    return players[player].exists;
  }

  function playerCurrentCount(address player) public constant returns(uint) {
    return players[player].currentCount;
  }

  function playerAllCount(address player) public constant returns(uint) {
    return players[player].cloverKeys.length;
  }

  function playerCloverByKey(address player, uint cloverKey) public constant returns(bytes16) {
    return players[player].cloverKeys[cloverKey];
  }

  function playerOwnsClover(address player, bytes16 board) public constant returns (bool) {
    return players[player].clovers[board];
  }

  function addCloverToPlayer (bytes16 board) internal {
    if (!players[msg.sender].clovers[board]) {
      players[msg.sender].clovers[board] = true;
      players[msg.sender].cloverKeys.push(board);
    }
    players[msg.sender].currentCount += 1;
  }

  function registerPlayer() internal {
    if (!players[msg.sender].exists) {
      players[msg.sender].exists = true;
      playerKeys.push(msg.sender);
    }
  }


  // Clover Management

  struct Clover {
    bytes28 first32Moves;
    bytes28 lastMoves;
    address[] previousOwners;
    uint256 lastPaidAmount;
    bool exists;
  }

  mapping (bytes16 => Clover) public clovers;
  bytes16[] public cloverKeys;

  function cloverExists(bytes16 b) public constant returns(bool) {
    return clovers[b].exists;
  }

  function getCloversCount() public constant returns(uint) {
    return cloverKeys.length;
  }

  function getCloverByKey (uint boardKey) public constant returns(bytes16, uint lastPaidAmount, uint owners, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    bytes16 board = cloverKeys[boardKey];
    return getClover(board);
  }

  function getClover (bytes16 board) public exists(board) constant returns(bytes16, uint lastPaidAmount, uint ownersLength, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    return (board, clovers[board].lastPaidAmount, clovers[board].previousOwners.length, clovers[board].previousOwners[clovers[board].previousOwners.length - 1], clovers[board].first32Moves, clovers[board].lastMoves);
  }

  function getCloverOwner(uint boardKey, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    bytes16 board = cloverKeys[boardKey];
    if(!cloverExists(board)) revert();
    return (board, clovers[board].previousOwners[ownerKey]);
  }

  function buyClover (bytes16 b) public returns(bool) {
    // every clover asset is for sale determined on an initial start price
    // if that clover is purchased, the proceeds are divided evenly among the last two buyers
    if(!cloverExists(b)) revert();
    // cant flip board you currently own
    if (clovers[b].previousOwners[ clovers[b].previousOwners.length - 1 ] == msg.sender) revert();
    uint nextPrice = clovers[b].lastPaidAmount.mul(2);
    if (balances[msg.sender] < nextPrice) revert();
    registerPlayer();
    for (uint8 i = 1; i < 3; i++) {
      if (i <= clovers[b].previousOwners.length) {
        uint256 lastOwnerKey = clovers[b].previousOwners.length - uint(i);
        address lastOwner = clovers[b].previousOwners[ lastOwnerKey ];

        balances[msg.sender] = balances[msg.sender].sub(clovers[b].lastPaidAmount);

        balances[lastOwner] = balances[lastOwner].add(clovers[b].lastPaidAmount);
        if (i == 1) {
          players[lastOwner].currentCount -= 1;
        }
      }
    }
    addCloverToPlayer(b);
    clovers[b].previousOwners.push(msg.sender);
    clovers[b].lastPaidAmount = nextPrice;
    return true;
  }



  // Game Management
  //
  // see ./Reversi.sol for more...
  //
  // struct Game {
  //   bool error;
  //   bool complete;
  //   bool symmetrical;
  //   bool RotSym;
  //   bool Y0Sym;
  //   bool X0Sym;
  //   bool XYSym;
  //   bool XnYSym;
  //   uint8 currentPlayer;
  //   bytes16 board;
  //   bytes28 first32Moves;
  //   bytes28 lastMoves;
  //   uint8 moveKey;
  //   string msg;
  // }

  function gameExists(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
    Game memory game = playGame(first32Moves, lastMoves);
    if (game.error) revert();
    if (!game.complete) revert();
    return cloverExists(game.board);
  }

  function showGameConstant(bytes28 first32Moves, bytes28 lastMoves) public constant returns(uint8 moveKey, bool error, bool complete, uint8 currentPlayer, bytes16 board, string msg) {
    Game memory game = playGame(first32Moves, lastMoves);
    return (game.moveKey, game.error, game.complete, game.currentPlayer, game.board, game.msg);
  }

  function getPayout(bytes16 board) public constant returns(uint256) {
    Game memory game;
    game.board = board;
    game = isSymmetrical(game);
    return findersFee(game);
  }

  function showGameDebug(bytes28 first32Moves, bytes28 lastMoves) public {
    Game memory game = playGame(first32Moves, lastMoves);
    DebugGame(game.moveKey, game.error, game.complete, game.symmetrical, game.currentPlayer, game.board, game.msg);
  }

  function mineGame(bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public returns(uint) {
    Game memory game = playGame(first32Moves, lastMoves);
    DebugGame(game.moveKey, game.error, game.complete, game.symmetrical, game.currentPlayer, game.board, game.msg);
    return saveGame(game, startPrice);
  }

  function adminRegisterGame (bytes28 first32Moves, bytes28 lastMoves, bytes16 board, uint startPrice) public doesNotExist(board) onlyAdmin() returns(uint boardKey) {
    clovers[board].first32Moves = first32Moves;
    clovers[board].lastMoves = lastMoves;
    clovers[board].previousOwners.push(msg.sender);
    clovers[board].exists = true;
    clovers[board].lastPaidAmount = startPrice;
    DebugGame(0, false, true, true, 1, board, 'okay');
    return cloverKeys.push(board);
  }

  function saveGame(Game game, uint256 startPrice) internal returns(uint){
    if (game.error) revert();
    if (!game.complete) revert();
    if (!game.symmetrical) revert();
    if(cloverExists(game.board)) revert();
    
    registerPlayer();
    addCloverToPlayer(game.board);

    balances[msg.sender] += findersFee(game);
    clovers[game.board].first32Moves = game.first32Moves;
    clovers[game.board].lastMoves = game.lastMoves;
    clovers[game.board].previousOwners.push(msg.sender);
    clovers[game.board].lastPaidAmount = startPrice;
    clovers[game.board].exists = true;
    Registered(msg.sender, clovers[game.board].lastPaidAmount, game.board);
    return cloverKeys.push(game.board);
  }

  function findersFee(Game game) internal constant returns(uint256) {
    uint256 base = 0;
    if (game.symmetrical) base += 1;
    if (game.RotSym) base *= 100;
    if (game.Y0Sym) base *= 100;
    if (game.X0Sym) base *= 100;
    if (game.XYSym) base *= 100;
    if (game.XnYSym) base *= 100;
    return base;
  }





  
}