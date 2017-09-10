pragma solidity ^0.4.13;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "./Reversi.sol";
import "./DataStorage.sol";
// import "./oraclizeAPI.sol";

contract ClubToken is StandardToken {

  DataStorage public dataStorage;

  // Token Contract

  uint256 public decimals = 0;
  uint256 public INITIAL_SUPPLY = 1000000; // four decimals

  address public owner;
  string public name = "ClubToken";
  string public symbol = "♧";

  function ClubToken(address _dataStorage) {
    dataStorage = DataStorage(_dataStorage);
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    owner = msg.sender;
  }

  function getBalance(address someone) public constant returns (uint) {
    return balances[someone];
  }


  // Modifiers

  modifier onlyOwner { if (msg.sender != owner) revert(); _; }

  // Events

  event newUserName(address player, string name);
  event Registered(address newOwner, uint256 lastPaidAmount, bytes16 board, bool newBoard, bytes28 first32Moves, bytes28 lastMoves, uint256 modified, uint256 findersFee);
  event DebugGame(bytes16 board, bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym);

  function debugGame(Reversi.Game game) internal {
    DebugGame(game.board, game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }



  // Contract Administration

  // mapping(address => bool) admins;
  // address[] public adminKeys;


  function updateDataStorage (address _dataStorage) public {
    dataStorage = DataStorage(_dataStorage);
  }

  function isAdmin () public constant returns (bool) {
    return dataStorage.isAdmin();
  }  

  function adminLen () public constant returns (uint256) {
    return dataStorage.adminLen();
  } 

  function adminAt (uint256 key) public constant returns (address) {
    return dataStorage.adminAt(key);
  }

  function getTallys () public constant returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
    return dataStorage.getTallys();
  }

  function changeUsernameLength (uint256 len) public {
    dataStorage.changeUsernameLength(len);
  }

  function addAdmin (address newbie) public {
    dataStorage.addAdmin(newbie);
  }

  function updateMultiplier (uint256 multiplier) public {
    dataStorage.updateMultiplier(multiplier);
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

  function changeName (string name) {
    dataStorage.changeName(name);
    newUserName(msg.sender, name);
  }

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

  // struct Clover {
  //   bool exists;
  //   bytes28 first32Moves;
  //   bytes28 lastMoves;
  //   uint256 lastPaidAmount;
  //   uint256 findersFee;
  //   uint256 created;
  //   uint256 modified;
  //   address[] previousOwners;
  //   // bool validated;
  // }

  // mapping (bytes16 => Clover) public clovers;
  // bytes16[] public cloverKeys;


  function cloverExists(bytes16 b) public constant{
    return dataStorage.cloverExists(b);
  }

  function getCloversCount() public constant returns(uint) {
    return dataStorage.getCloversCount();
  }

  function getCloverByKey (uint boardKey) public constant returns(bytes16, uint lastPaidAmount, uint owners, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    return dataStorage.getCloverByKey(boardKey);
  }

  function getClover (bytes16 board) public constant returns(bytes16, uint lastPaidAmount, uint ownersLength, address lastOwner, bytes28 first32Moves, bytes28 lastMoves) {
    return dataStorage.getClover(board);
  }

  function getCloverOwnersLength(bytes16 board) public constant returns(uint256) {
    return dataStorage.getCloverOwnersLength(board);
  }

  function getCloverOwner(bytes16 board) public constant returns(address previousOwner) {
    return dataStorage.getCloverOwner(board);
  }

  function getCloverOwnerAtKeyByBoard(bytes16 board, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    return dataStorage.getCloverOwnerAtKeyByBoard(board, ownerKey);
  }

  function getCloverOwnerAtKeyByBoardKey(uint boardKey, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    return dataStorage.getCloverOwnerAtKeyByBoardKey(boardKey, ownerKey);
  }

  function changeClovernameLength (uint256 len) public {
    dataStorage.changeClovernameLength(len);
  }

  function changeStartPrice(bytes16 board, uint256 startPrice) public {
    return dataStorage.changeStartPrice(board, startPrice);
  }

  function renameClover(bytes16 board, string name) public {
    return dataStorage.renameClover(board, name);
  }

  function mineClover(bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice) public {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    saveGame(game, startPrice);
  }

  function buyClover (bytes16 b) public{
    cloverExists(b);
    // every clover asset is for sale determined on an initial start price
    // if that clover is purchased, the proceeds are divided evenly among the last two buyers
    // cant flip board you currently own
    if (dataStorage.getCloverOwner(b) == msg.sender) revert();
    uint nextPrice = dataStorage.getNextPrice(b);
    if (balances[msg.sender] < nextPrice) revert();
    registerPlayer();

    uint previousOwnersLength = dataStorage.getCloverOwnersLength(b);
    for (uint8 i = 1; i < 3; i++) {
      if (i <= previousOwnersLength) {
        uint256 lastOwnerKey = previousOwnersLength - uint(i);
        address lastOwner = dataStorage.getCloverOwnerAtKeyByBoard(b, lastOwnerKey);

        balances[msg.sender] = balances[msg.sender].sub(dataStorage.getLastPaidAmount(b));

        balances[lastOwner] = balances[lastOwner].add(dataStorage.getLastPaidAmount(b));
        if (i == 1) {
          players[lastOwner].currentCount -= 1;
        }
      }
    }
    addCloverToPlayer(b);
    dataStorage.addPreviousOwners(b);
    dataStorage.clovers[b].lastPaidAmount = nextPrice;
    dataStorage.clovers[b].modified = now;
    Registered(msg.sender, nextPrice, b, false, dataStorage.clovers[b].first32Moves, dataStorage.clovers[b].lastMoves, dataStorage.clovers[b].modified, dataStorage.clovers[b].findersFee);
  }

  function adminMineClover (bytes28 first32Moves, bytes28 lastMoves, bytes16 board, uint startPrice) public returns(uint boardKey) {
    if(!dataStorage.admins[msg.sender]) revert();
    if (dataStorage.clovers[board].exists) revert();

    registerPlayer();
    addCloverToPlayer(game.board);
    Reversi.Game memory game;
    game.board = board;

    game = Reversi.isSymmetrical(game);
    if (game.symmetrical) {
      dataStorage.clovers[board].findersFee = findersFee(game);
      balances[msg.sender] += dataStorage.clovers[board].findersFee;
      addToSymmTallys(game);
    }
    dataStorage.clovers[board].first32Moves = first32Moves;
    dataStorage.clovers[board].lastMoves = lastMoves;
    dataStorage.clovers[board].previousOwners.push(msg.sender);
    dataStorage.clovers[board].lastPaidAmount = startPrice;
    dataStorage.clovers[board].exists = true;
    dataStorage.clovers[board].created = now;
    dataStorage.clovers[board].modified = now;
    Registered(msg.sender, startPrice, board, true, first32Moves, lastMoves, now, dataStorage.clovers[board].findersFee);
    return dataStorage.cloverKeys.push(board);
  }



  // Game Management
  //
  // see ./Reversi.sol for playGame(), isSymmetrical() and Game struct

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
    return dataStorage.clovers[game.board].exists;
  }

  function showGameBoard(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bytes16 board) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    return game.board;
  }

  function showGameConstant(bytes28 first32Moves, bytes28 lastMoves) public constant returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym) {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);
    return returnGame(game);
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

  function testTallys(bytes16 b) public constant returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
    
    Reversi.Game memory game;
    game.board = b;
    game = Reversi.isSymmetrical(game);

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

    return (_Symmetricals, _RotSym, _Y0Sym, _X0Sym, _XYSym, _XnYSym, dataStorage.payMultiplier);
  }

  function showGameDebug(bytes28 first32Moves, bytes28 lastMoves) public {
    Reversi.Game memory game = Reversi.playGame(first32Moves, lastMoves);

  }

  function returnGame(Reversi.Game game) internal returns(bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym){
    return (game.error, game.complete, game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }

  function saveGame(Reversi.Game game, uint256 startPrice) internal returns(uint){
    if (game.error) revert();
    if (!game.complete) revert();
    if (dataStorage.clovers[game.board].exists) revert();
    
    registerPlayer();
    addCloverToPlayer(game.board);
    dataStorage.clovers[game.board].first32Moves = game.first32Moves;
    dataStorage.clovers[game.board].lastMoves = game.lastMoves;
    dataStorage.clovers[game.board].previousOwners.push(msg.sender);
    dataStorage.clovers[game.board].lastPaidAmount = startPrice;
    dataStorage.clovers[game.board].exists = true;
    dataStorage.clovers[game.board].created = now;
    dataStorage.clovers[game.board].modified = now;
    if (game.symmetrical) {
      dataStorage.clovers[game.board].findersFee = findersFee(game);
      balances[msg.sender] += dataStorage.clovers[game.board].findersFee;
      addToSymmTallys(game);
    }
    Registered(msg.sender, startPrice, game.board, true, game.first32Moves, game.lastMoves, now, dataStorage.clovers[game.board].findersFee);
    return dataStorage.cloverKeys.push(game.board);
  }

  function addToSymmTallys (Reversi.Game game) internal {
    if (game.symmetrical) dataStorage.Symmetricals += 1;
    if (game.RotSym) dataStorage.RotSym += 1;
    if (game.Y0Sym) dataStorage.Y0Sym += 1;
    if (game.X0Sym) dataStorage.X0Sym += 1;
    if (game.XYSym) dataStorage.XYSym += 1;
    if (game.XnYSym) dataStorage.XnYSym += 1;
  }

  function findersFee (Reversi.Game game) internal constant returns(uint256) {
    return findersFeeExplicit(game.symmetrical, game.RotSym, game.Y0Sym, game.X0Sym, game.XYSym, game.XnYSym);
  }

  function findersFeeExplicit (bool symmetrical, bool _RotSym, bool _Y0Sym, bool _X0Sym, bool _XYSym, bool _XnYSym) internal constant returns(uint256) {    
    uint256 base = 0;

    if (_RotSym) base = base.add( dataStorage.payMultiplier.mul( dataStorage.Symmetricals + 1 ).div( dataStorage.RotSym + 1 ) );
    if (_Y0Sym) base = base.add( dataStorage.payMultiplier.mul( dataStorage.Symmetricals + 1 ).div( dataStorage.Y0Sym + 1 ) );
    if (_X0Sym) base = base.add( dataStorage.payMultiplier.mul( dataStorage.Symmetricals + 1 ).div( dataStorage.X0Sym + 1 ) );
    if (_XYSym) base = base.add( dataStorage.payMultiplier.mul( dataStorage.Symmetricals + 1 ).div( dataStorage.XYSym + 1 ) );
    if (_XnYSym) base = base.add( dataStorage.payMultiplier.mul( dataStorage.Symmetricals + 1 ).div( dataStorage.XnYSym + 1 ) );

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

  //   dataStorage.clovers[board] = clover;

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
  //   address player = dataStorage.clovers[board].previousOwners[0];
  //   if (!clovers[board].exists) revert();
  //   if (clovers[board].validated) revert();
  //   delete validIds[myid];


  //   addCloverToPlayerExplicit(board, player);

  //   balances[player] += dataStorage.clovers[board].findersFee;
  //   dataStorage.clovers[board].validated = valid;

  //   cloverKeys.push(board);  
  //   Registered(player, dataStorage.clovers[board].lastPaidAmount, board);
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