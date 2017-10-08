pragma solidity ^0.4.13;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "./Reversi.sol";
import "./Oracle.sol";


/// @title Clover
/// @author Billy Rennekamp

contract ClubToken is StandardToken {

  function ClubToken(address oracleAddress) {
    oracle = Oracle(oracleAddress);
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    admins[msg.sender] = true;
    adminKeys.push(msg.sender);
    owner = msg.sender;
  }

  // Club Token

  Oracle oracle;

  uint256 public decimals = 0;
  uint256 public INITIAL_SUPPLY = 1;
  uint256 payMultiplier = 10;
  uint256 Symmetricals;
  uint256 RotSym;
  uint256 Y0Sym;
  uint256 X0Sym;
  uint256 XYSym;
  uint256 XnYSym;
  uint256 nameLength = 21;
  address public owner;
  string public name = "ClubToken";
  string public symbol = "♧";


  // Modifiers

  modifier onlyOwner { if (msg.sender != owner) revert(); _; }
  modifier onlyAdmin { if (!admins[msg.sender]) revert(); _; }
  modifier doesNotExist(bytes16 b) { if (clovers[b].exists && clovers[b].validated) revert(); _; }
  modifier exists(bytes16 b) { if (!clovers[b].exists && clovers[b].validated) revert(); _; }
  modifier onlyOracle() {if (msg.sender != address(oracle)) revert(); _; }



  // Events

  event newUserName(address player, string name);
  event newCloverName(bytes16 board, string name);
  event Registered(address newOwner, uint256 lastPaidAmount, bytes16 board, bool newBoard, bytes28 first32Moves, bytes28 lastMoves, uint256 modified, uint256 findersFee, bool validated);
  event newOraclizeQuery(string message);
  event newOraclizeSubmit(uint8 level);


  // Contract Administration

  mapping(address => bool) admins;
  address[] public adminKeys;

  // Public & Constant

  /// @notice Gets balance
  /// @dev 
  /// @param _someone Address of the account balance requested
  /// @return uint balance of address

  function getBalance(address _someone) public constant returns(uint) {
    return balances[_someone];
  }

  function myAddress () public constant returns(address) {
    return msg.sender;
  }

  function isAdmin () public constant returns(bool) {
    return admins[msg.sender];
  }  

  function getTallys() public constant returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
    return (Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym, payMultiplier);
  }

  function changeNameLength (uint256 len) public onlyAdmin() {
    nameLength = len;
  }

  function addAdmin (address newbie) public onlyAdmin() {
    if (!admins[msg.sender]) revert();
    admins[newbie] = true;
    adminKeys.push(newbie);
  }

  function updateMultiplier(uint256 multiplier) public onlyAdmin(){
    payMultiplier = multiplier;
  }




  // Player Management

  struct Player {
    bool exists;
    uint currentCount;
    bytes16[] cloverKeys;
    mapping(bytes16 => bool) clovers;
  }

  mapping(address => Player) public players;
  address[] public playerKeys;

  // Public & Constant

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

  function playerOwnsClover(address player, bytes16 board) public constant returns(bool) {
    return players[player].clovers[board];
  }

  // Public & Transactional

  function changeName (string name) public {
    if (bytes(name).length > nameLength) revert();
    newUserName(msg.sender, name);
  }


  // Internal & Transactional

  function addCloverToPlayer (bytes16 board) internal {
    if (!players[msg.sender].clovers[board]) {
      players[msg.sender].clovers[board] = true;
      players[msg.sender].cloverKeys.push(board);
    }
    players[msg.sender].currentCount += 1;
  }

  function registerPlayer() {
    registerPlayerExplicit(msg.sender);
  }

  function registerPlayerExplicit(address player) {
    if (!players[player].exists) {
      players[player].exists = true;
      playerKeys.push(player);
    }
  }



  // Clover Management

  struct Clover {
    bool exists;
    bool validated;
    bytes28 first32Moves;
    bytes28 lastMoves;
    uint256 lastPaidAmount;
    uint256 findersFee;
    uint256 created;
    uint256 modified;
    address[] previousOwners;
  }

  mapping (bytes16 => Clover) public clovers;
  bytes16[] public cloverKeys;

  // Public & Constant

  function cloverValid(bytes16 b) public constant returns(bool) {
    return clovers[b].validated;
  }

  function cloverExistsUnvalidated(bytes16 b) public constant returns(bool) {
    return clovers[b].exists && !cloverValid(b);
  }

  function cloverExists(bytes16 b) public constant returns(bool) {
    return clovers[b].exists && cloverValid(b);
  }

  function getCloversCount() public constant returns(uint) {
    return cloverKeys.length;
  }

  function getCloverByKey (uint boardKey) public constant returns(bytes16, uint lastPaidAmount, uint owners, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    bytes16 board = cloverKeys[boardKey];
    return getClover(board);
  }

  function getClover (bytes16 board) public constant exists(board) returns(bytes16, uint lastPaidAmount, uint ownersLength, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    return (board, clovers[board].lastPaidAmount, clovers[board].previousOwners.length, clovers[board].previousOwners[clovers[board].previousOwners.length - 1], clovers[board].first32Moves, clovers[board].lastMoves);
  }

  function getCloverOwnersLength(bytes16 board) public constant exists(board) returns(uint256) {
    return clovers[board].previousOwners.length;
  }

  function getCloverOwner(bytes16 board) public constant exists(board) returns(address previousOwner) {
    return clovers[board].previousOwners[ clovers[board].previousOwners.length - 1 ];
  }

  function getCloverOwnerAtKeyByBoard(bytes16 board, uint ownerKey) public constant exists(board) returns(address previousOwner) {
    return clovers[board].previousOwners[ownerKey];
  }

  function getCloverOwnerAtKeyByBoardKey(uint boardKey, uint ownerKey) public constant returns(address previousOwner) {
    bytes16 board = cloverKeys[boardKey];
    if(!cloverExists(board)) revert();
    return clovers[board].previousOwners[ownerKey];
  }

  // Public & Transactional

  function deleteClover (bytes16 board) public onlyOracle() {
    delete clovers[board];
  }

  function renameClover(bytes16 board, string name) public exists(board) {
    if (bytes(name).length > nameLength) revert();
    if (clovers[board].previousOwners[clovers[board].previousOwners.length - 1] != msg.sender) revert();
    newCloverName(board, name);
  }

  function changeStartPrice(bytes16 board, uint256 startPrice) public exists(board) {
    if(clovers[board].previousOwners[0] != msg.sender) revert();
    if(clovers[board].previousOwners.length > 1) revert();
    Registered(msg.sender, startPrice, board, true, clovers[board].first32Moves, clovers[board].lastMoves, now, clovers[board].findersFee, true);
    clovers[board].lastPaidAmount = startPrice;
  }

  function oracleMineClover(bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice, string endpoint, string payload) public {
    oracle.mineClover1(board, msg.sender, endpoint, payload);
    claimClover(board, first32Moves, lastMoves, startPrice);
  }
  // function oracleMineClover2(bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice, string payload) public {
  //   oracle.mineClover2(board, first32Moves, lastMoves, startPrice, payload);
  // }

  function mineClover(bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    saveGame(game, startPrice);
  }

  function adminMineClover (bytes28 first32Moves, bytes28 lastMoves, bytes16 board, uint startPrice) public doesNotExist(board) onlyAdmin() {
    registerPlayer();
    addCloverToPlayer(game.board);
    Reversi.Game memory game;
    game.board = board;

    game = Reversi.isSymmetrical(game);
    if (game.symmetrical) {
      clovers[board].findersFee = findersFee(game);
      balances[msg.sender] += clovers[board].findersFee;
      totalSupply += clovers[board].findersFee;
      addToSymmTallys(game);
    }
    clovers[board].first32Moves = first32Moves;
    clovers[board].lastMoves = lastMoves;
    clovers[board].previousOwners.push(msg.sender);
    clovers[board].lastPaidAmount = startPrice;
    clovers[board].exists = true;
    clovers[board].created = now;
    clovers[board].modified = now;
    clovers[board].validated = true;
    Registered(msg.sender, startPrice, board, true, first32Moves, lastMoves, now, clovers[board].findersFee, true);
    cloverKeys.push(board);
  }

  function flipClover (bytes16 b) exists(b) public {
    // every clover asset is for sale determined on an initial start price
    // if that clover is purchased, the proceeds are divided evenly among the last two buyers
    // cant flip board you currently own
    if (clovers[b].previousOwners[ clovers[b].previousOwners.length - 1 ] == msg.sender) revert();
    uint nextPrice = clovers[b].previousOwners.length == 1 ? clovers[b].lastPaidAmount : clovers[b].lastPaidAmount.mul(2);
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
    clovers[b].modified = now;
    Registered(msg.sender, nextPrice, b, false, clovers[b].first32Moves, clovers[b].lastMoves, clovers[b].modified, clovers[b].findersFee, true);
  }


  // Game Management

  // see ./Reversi.sol for playGame(), isSymmetrical() and Game struct

  // Public & Constant

  function gameIsValid(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    if (game.error) return false;
    if (!game.complete) return false;
    if (!game.symmetrical) return false;
    return true;
  }

  function gameExists(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    if (game.error) revert();
    if (!game.complete) revert();
    return cloverExists(game.board);
  }

  function showGame(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    return returnGame(game);
  }

  function showGame2(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bytes16 board, uint8 blackScore, uint8 whiteScore, uint8 currentPlayer, uint8 moveKey) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    return (game.board, game.blackScore, game.whiteScore, game.currentPlayer, game.moveKey);
  }

  function getSymmetry(bytes16 b) public constant returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    Reversi.Game memory game;
    game.board = b;
    game = Reversi.isSymmetrical(game);
    return returnGame(game);
  }

  function getFindersFee(bytes16 b) public constant returns(uint256) {
    Reversi.Game memory game;
    game.board = b;
    game = Reversi.isSymmetrical(game);
    return findersFee(game);
  }

  // Public & Transactional

  function debugGame(bytes28 first32Moves, bytes28 lastMoves) public {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
  }

  // Internal & Transactional

  function returnGame(Reversi.Game game) internal returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    return (game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }

  function saveGame(Reversi.Game game, uint256 startPrice) internal {
    if (game.error) revert();
    if (!game.complete) revert();
    if (cloverExists(game.board)) revert();
    
    registerPlayer();
    addCloverToPlayer(game.board);
    clovers[game.board].first32Moves = game.first32Moves;
    clovers[game.board].lastMoves = game.lastMoves;
    clovers[game.board].previousOwners.push(msg.sender);
    clovers[game.board].lastPaidAmount = startPrice;
    clovers[game.board].exists = true;
    clovers[game.board].created = now;
    clovers[game.board].modified = now;
    clovers[game.board].validated = true;
    if (game.symmetrical) {
      clovers[game.board].findersFee = findersFee(game);
      balances[msg.sender] += clovers[game.board].findersFee;
      totalSupply += clovers[game.board].findersFee;
      addToSymmTallys(game);
    }
    Registered(msg.sender, startPrice, game.board, true, game.first32Moves, game.lastMoves, now, clovers[game.board].findersFee, true);
    cloverKeys.push(game.board);
  }

  function addToSymmTallys (Reversi.Game game) internal {
    if (game.symmetrical) Symmetricals += 1;
    if (game.RotSym) RotSym += 1;
    if (game.Y0Sym) Y0Sym += 1;
    if (game.X0Sym) X0Sym += 1;
    if (game.XYSym) XYSym += 1;
    if (game.XnYSym) XnYSym += 1;
  }

  function findersFee (Reversi.Game game) internal constant returns(uint256) {
    uint256 base = 0;

    if (game.RotSym) base = base.add( payMultiplier.mul( Symmetricals + 1 ).div( RotSym + 1 ) );
    if (game.Y0Sym) base = base.add( payMultiplier.mul( Symmetricals + 1 ).div( Y0Sym + 1 ) );
    if (game.X0Sym) base = base.add( payMultiplier.mul( Symmetricals + 1 ).div( X0Sym + 1 ) );
    if (game.XYSym) base = base.add( payMultiplier.mul( Symmetricals + 1 ).div( XYSym + 1 ) );
    if (game.XnYSym) base = base.add( payMultiplier.mul( Symmetricals + 1 ).div( XnYSym + 1 ) );

    return base;
  }



  // Oracle Management

  // Public & Constant

  function getClubTokenAddress () public constant returns(address) {
    return oracle.getClubTokenAddress();
  }

  function getOracleHash () public constant returns(bytes32) {
    return oracle.getOracleHash();
  }

  // Public & Transactional

  function deposit () public payable {
    oracle.deposit();
  }

  function setClubToken () public onlyAdmin() {
    oracle.setClubToken(this);
  }

  function setOracleHash (string endpoint) public onlyAdmin() {
    oracle.setOracleHash(endpoint);
  }

  function oracleAddClover (bytes16 board, address player) public onlyOracle() {
    registerPlayerExplicit(player);
    if (!players[player].clovers[board]) {
      players[player].clovers[board] = true;
      players[player].cloverKeys.push(board);
    }
    players[player].currentCount += 1;

    balances[player] += clovers[board].findersFee;
    clovers[board].validated = true;
    clovers[board].previousOwners.push(player);

    cloverKeys.push(board);  
    Registered(player, clovers[board].lastPaidAmount, board, true, clovers[board].first32Moves, clovers[board].lastMoves, now, clovers[board].findersFee, true);
  }

  function claimClover (bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public doesNotExist(board) {
    delete clovers[board];
    clovers[board].findersFee = getFindersFee(board);
    clovers[board].first32Moves = first32Moves;
    clovers[board].lastMoves = lastMoves;
    clovers[board].lastPaidAmount = startPrice;
    clovers[board].exists = true;
    clovers[board].validated = false;
    Registered(msg.sender, clovers[board].lastPaidAmount, board, true, clovers[board].first32Moves, clovers[board].lastMoves, now, clovers[board].findersFee, false);
  }

}