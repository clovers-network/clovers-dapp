pragma solidity ^0.4.13;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "./Reversi.sol";
// import "./oraclizeAPI.sol";


// contract ClubToken is StandardToken, Reversi, usingOraclize {
contract ClubToken is StandardToken, Reversi {
// contract ClubToken is StandardToken {
// contract ClubToken  {



  // Token Contract

  string public name = "ClubToken";
  string public symbol = "♧";
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 1000000; // four decimals
  address public owner;

  uint256 payMultiplier = 100;
  uint Symmetricals;
  uint RotSym;
  uint Y0Sym;
  uint X0Sym;
  uint XYSym;
  uint XnYSym;

  function ClubToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    admins[msg.sender] = true;
    adminKeys.push(msg.sender);
    owner = msg.sender;
  }

  function getBalance(address someone) public constant returns(uint) {
    return balances[someone];
  }


  // Modifiers

  modifier onlyOwner { if (msg.sender != owner) revert(); _; }
  modifier onlyAdmin { if (!admins[msg.sender]) revert(); _; }
  modifier doesNotExist(bytes16 b) { if (clovers[b].exists) revert(); _; }
  modifier exists(bytes16 b) { if (!clovers[b].exists) revert(); _; }



  // Events

  event Registered(address newOwner, uint256 lastPaidAmount, bytes16 board, bool newBoard);
  event DebugGame(bytes16 board, bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym);
  event DebugBoard(bytes16 board);

  function debugGame(Game game) internal {
    DebugGame(game.board, game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }


  // Contract Administration

  mapping(address => bool) admins ;
  address[] public adminKeys;

  function isAdmin () public constant returns (bool) {
    return admins[msg.sender];
  }  

  function adminLen () public constant returns (uint256) {
    return adminKeys.length;
  } 

  function adminAt (uint256 key) public constant returns (address) {
    return adminKeys[key];
  }

  function getTallys() public constant returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
    return (Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym, payMultiplier);
  }

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

  function updateMultiplier(uint256 multiplier) public onlyAdmin(){
    payMultiplier = multiplier;
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

  function addCloverToPlayerExplicit (bytes16 board, address player) internal {
    if (!players[player].clovers[board]) {
      players[player].clovers[board] = true;
      players[player].cloverKeys.push(board);
    }
    players[player].currentCount += 1;
  }

  function addCloverToPlayer (bytes16 board) internal {
    addCloverToPlayerExplicit(board, msg.sender);
  }

  function registerPlayer() internal {
    if (!players[msg.sender].exists) {
      players[msg.sender].exists = true;
      playerKeys.push(msg.sender);
    }
  }



  // Clover Management

  struct Clover {
    // string name;
    bytes28 first32Moves;
    bytes28 lastMoves;
    address[] previousOwners;
    uint256 lastPaidAmount;
    uint256 findersFee;
    bool exists;
    // bool validated;
    uint256 created;
    uint256 modified;
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

  function getCloverOwnersLength(bytes16 board) public exists(board) constant returns(uint256) {
    return clovers[board].previousOwners.length;
  }

  function getCloverOwner(bytes16 board) public constant returns(bytes16, address previousOwner) {
    if(!cloverExists(board)) revert();
    return (board, clovers[board].previousOwners[ clovers[board].previousOwners.length - 1 ] );
  }

  function getCloverOwnerAtKeyByBoard(bytes16 board, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    if(!cloverExists(board)) revert();
    return (board, clovers[board].previousOwners[ownerKey]);
  }

  function getCloverOwnerAtKeyByBoardKey(uint boardKey, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    bytes16 board = cloverKeys[boardKey];
    if(!cloverExists(board)) revert();
    return (board, clovers[board].previousOwners[ownerKey]);
  }

  // function renameClover(bytes16 board, string name) public exists(board) {
  //   if (clovers[board].previousOwners[clovers[board].previousOwners.length - 1] != msg.sender) revert();
  //   clovers[board].name = name;
  // }

  function changeStartPrice(bytes16 board, uint256 startPrice) public exists(board) {
    if(clovers[board].previousOwners[0] != msg.sender) revert();
    if(clovers[board].previousOwners.length > 1) revert();
    clovers[board].lastPaidAmount = startPrice;
  }

  function mineClover(bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public {
    Game memory game = playGame(first32Moves, lastMoves);
    saveGame(game, startPrice);
  }

  function buyClover (bytes16 b) public{
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
    clovers[b].modified = now;
    Registered(msg.sender, nextPrice, b, false);
  }

  function adminMineClover (bytes28 first32Moves, bytes28 lastMoves, bytes16 board, uint startPrice) public doesNotExist(board) onlyAdmin() returns(uint boardKey) {
    registerPlayer();
    addCloverToPlayer(game.board);
    Game memory game;
    game.board = board;

    game = isSymmetrical(game);
    if (game.symmetrical) {
      clovers[board].findersFee = findersFee(game);
      balances[msg.sender] += clovers[board].findersFee;
      addToSymmTallys(game);
    }
    clovers[board].first32Moves = first32Moves;
    clovers[board].lastMoves = lastMoves;
    clovers[board].previousOwners.push(msg.sender);
    clovers[board].lastPaidAmount = startPrice;
    clovers[board].exists = true;
    clovers[board].created = now;
    clovers[board].modified = now;
    Registered(msg.sender, startPrice, board, true);
    return cloverKeys.push(board);
  }



  // Game Management
  //
  // see ./Reversi.sol for more...

  function gameIsValid(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
    Game memory game = playGame(first32Moves, lastMoves);
    if (game.error) return false;
    if (!game.complete) return false;
    if (!game.symmetrical) return false;
    return true;
  }

  function gameExists(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool) {
    Game memory game = playGame(first32Moves, lastMoves);
    if (game.error) revert();
    if (!game.complete) revert();
    return cloverExists(game.board);
  }

  function showGameConstant(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    Game memory game = playGame(first32Moves, lastMoves);
    return returnGame(game);
  }

  function getSymmetry(bytes16 b) public constant returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    Game memory game;
    game.board = b;
    game = isSymmetrical(game);
    return returnGame(game);
  }

  function getFindersFee(bytes16 b) public constant returns(uint256) {
    Game memory game;
    game.board = b;
    game = isSymmetrical(game);
    return findersFee(game);
  }

  function testTallys(bytes16 b) public constant returns(uint256, uint256, uint256, uint256, uint256, uint256) {
    
    Game memory game;
    game.board = b;
    game = isSymmetrical(game);

    uint256 _Symmetricals = 0;
    uint256 _RotSym = 0;
    uint256 _Y0Sym = 0;
    uint256 _X0Sym = 0;
    uint256 _XYSym = 0;
    uint256 _XnYSym = 0;

    if (game.symmetrical) _Symmetricals += 1;
    if (game.RotSym) _RotSym += 1;
    if (game.Y0Sym) _Y0Sym += 1;
    if (game.X0Sym) _X0Sym += 1;
    if (game.XYSym) _XYSym += 1;
    if (game.XnYSym) _XnYSym += 1;

    return (_Symmetricals, _RotSym, _Y0Sym, _X0Sym, _XYSym, _XnYSym);
  }

  function showGameDebug(bytes28 first32Moves, bytes28 lastMoves) public {
    Game memory game = playGame(first32Moves, lastMoves);
    debugGame(game);
  }

  function returnGame(Game game) internal returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym){
    return (game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }

  function saveGame(Game game, uint256 startPrice) internal returns(uint){
    if (game.error) revert();
    if (!game.complete) revert();
    if(cloverExists(game.board)) revert();
    
    registerPlayer();
    addCloverToPlayer(game.board);
    clovers[game.board].first32Moves = game.first32Moves;
    clovers[game.board].lastMoves = game.lastMoves;
    clovers[game.board].previousOwners.push(msg.sender);
    clovers[game.board].lastPaidAmount = startPrice;
    clovers[game.board].exists = true;
    clovers[game.board].created = now;
    clovers[game.board].modified = now;
    if (game.symmetrical) {
      clovers[game.board].findersFee = findersFee(game);
      balances[msg.sender] += clovers[game.board].findersFee;
      addToSymmTallys(game);
    }
    Registered(msg.sender, startPrice, game.board, true);
    return cloverKeys.push(game.board);
  }

  function addToSymmTallys(Game game) internal {
    if (game.symmetrical) Symmetricals += 1;
    if (game.RotSym) RotSym += 1;
    if (game.Y0Sym) Y0Sym += 1;
    if (game.X0Sym) X0Sym += 1;
    if (game.XYSym) XYSym += 1;
    if (game.XnYSym) XnYSym += 1;
  }

  function findersFee(Game game) internal constant returns(uint256) {
    return findersFeeExplicit(game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }

  function findersFeeExplicit(bool symmetrical, bool _RotSym, bool _Y0Sym, bool _X0Sym, bool _XYSym, bool _XnYSym) internal constant returns(uint256) {    
    uint256 base = 0;

    if (_RotSym) base = base.add( payMultiplier ).mul( Symmetricals + 1 ).div( RotSym + 1 );
    if (_Y0Sym) base = base.add( payMultiplier ).mul( Symmetricals + 1 ).div( Y0Sym + 1 );
    if (_X0Sym) base = base.add( payMultiplier ).mul( Symmetricals + 1 ).div( X0Sym + 1 );
    if (_XYSym) base = base.add( payMultiplier ).mul( Symmetricals + 1 ).div( XYSym + 1 );
    if (_XnYSym) base = base.add( payMultiplier ).mul( Symmetricals + 1 ).div( XnYSym + 1 );

    return base;
  }



  // // Oraclize Management


  // function claimClover (bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public {
  //   registerPlayer();

  //   Clover storage clover;
  //   clover.first32Moves = first32Moves;
  //   clover.lastMoves = lastMoves;
  //   clover.lastPaidAmount = startPrice;
  //   clover.exists = true;


  //   clover.previousOwners.push(msg.sender);

  //   clover.validated = false; // redundant

  //   Game memory game;
  //   game.board = board;
  //   clover.findersFee = findersFee(game);

  //   clovers[board] = clover;

  // }

  // // = "json(https://api.infura.io/v1/jsonrpc/rinkeby/eth_call?to="
  // string validateEndpoint = "json(https://api.infura.io/v1/jsonrpc/rinkeby/eth_call?to=";
  // mapping(bytes32=>bytes16) validIds;

  // function updateValidateEndpoint (string endpoint) public onlyAdmin() {
  //   validateEndpoint = endpoint;
  // }

  // function __callback(bytes32 myid, bool valid, bytes proof) {
  //   if (uint8 (validIds[myid]) == 0) throw;
  //   if (msg.sender != oraclize_cbAddress()) revert();
  //   if (!valid) revert();
  //   bytes16 board = validIds[myid];
  //   address player = clovers[board].previousOwners[0];
  //   if (!clovers[board].exists) revert();
  //   if (clovers[board].validated) revert();
  //   delete validIds[myid];


  //   addCloverToPlayerExplicit(board, player);

  //   balances[player] += clovers[board].findersFee;
  //   clovers[board].validated = valid;

  //   cloverKeys.push(board);  
  //   Registered(player, clovers[board].lastPaidAmount, board);
  // }

  // function returnAddress() public constant returns(address) {
  //   return this;
  // }

  // function buildString(bytes28 first32Moves, bytes28 lastMoves) public constant returns(string) {
  //   string query2 = addressToString(address(this));
  //   // string memory query3 = "&data=";
  //   // string memory func = bytes32ToString(bytes32(bytes4(sha3("gameIsValid(bytes28,bytes28)"))));
  //   // string memory param1 = bytes32ToString(bytes32(first32Moves));
  //   // string memory param2 = bytes32ToString(bytes32(lastMoves));
  //   // string memory closing = ").result";

  //   return query2;//strConcat(strConcat(validateEndpoint, query2, query3, func, param1), param2, closing);

  // }

  // function verifyGame(bytes16 board, bytes28 first32Moves, bytes28 lastMoves) payable {
  //   if (oraclize_getPrice("URL") > this.balance) {
  //       // newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
  //   } else {

  //       // newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
  //       bytes32 queryId = oraclize_query("URL", buildString(first32Moves, lastMoves));
  //       validIds[queryId] = board;
  //   }
  // }

  // function addressToString(address x) returns (string) {
  //     bytes memory b = new bytes(20);
  //     for (uint i = 0; i < 20; i++)
  //       b[i] = byte(uint8(uint256(x) / (2**(8*(19 - i)))));
  //     return string(b);
  // }
  // function bytes32ToString (bytes32 data) constant returns (string) {
  //   bytes memory bytesString = new bytes(32);
  //   for (uint j=0; j<32; j++) {
  //     byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
  //     if (char != 0) {
  //       bytesString[j] = char;
  //     }
  //   }
  //   return string(bytesString);
  // }
  // function bytes4ToString (bytes4 data) constant returns (string) {
  //   bytes memory bytesString = new bytes(4);
  //   for (uint j=0; j<4; j++) {
  //     byte char = byte(bytes4(uint(data) * 2 ** (8 * j)));
  //     if (char != 0) {
  //       bytesString[j] = char;
  //     }
  //   }
  //   return string(bytesString);
  // }

  // function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string) {
  //     bytes memory _ba = bytes(_a);
  //     bytes memory _bb = bytes(_b);
  //     bytes memory _bc = bytes(_c);
  //     bytes memory _bd = bytes(_d);
  //     bytes memory _be = bytes(_e);
  //     string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
  //     bytes memory babcde = bytes(abcde);
  //     uint k = 0;
  //     for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
  //     for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
  //     for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
  //     for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
  //     for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
  //     return string(babcde);
  // }

  // function strConcat(string _a, string _b, string _c, string _d) internal returns (string) {
  //     return strConcat(_a, _b, _c, _d, "");
  // }

  // function strConcat(string _a, string _b, string _c) internal returns (string) {
  //     return strConcat(_a, _b, _c, "", "");
  // }

  // function strConcat(string _a, string _b) internal returns (string) {
  //     return strConcat(_a, _b, "", "", "");
  // }


}