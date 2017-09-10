pragma solidity ^0.4.13;

contract DataStorage {

  function DataStorage () {
    admins[msg.sender] = true;
    adminKeys.push(msg.sender);
    usernameLength = 21;
    clovernameLength = 21;
    payMultiplier = 100;
  }

  event newCloverName(bytes16 board, string name);

  modifier doesNotExist (bytes16 b) { if (clovers[b].exists) revert(); _; }
  modifier exists (bytes16 b) { if (!clovers[b].exists) revert(); _; }
  modifier onlyAdmin { if (!admins[msg.sender]) revert(); _; }




  // Contract Administration

  uint256 payMultiplier;
  uint256 Symmetricals;
  uint256 RotSym;
  uint256 Y0Sym;
  uint256 X0Sym;
  uint256 XYSym;
  uint256 XnYSym;
  mapping(address => bool) admins;
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

  function getTallys () public constant returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
    return (Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym, payMultiplier);
  }

  function changeUsernameLength (uint256 len) public onlyAdmin() {
    usernameLength = len;
  }

  function addAdmin (address newbie) public onlyAdmin() {
    admins[newbie] = true;
    adminKeys.push(newbie);
  }

  function updateMultiplier (uint256 multiplier) public onlyAdmin(){
    payMultiplier = multiplier;
  }




  

  // Player Management

  uint256 usernameLength;

  function changeName (string name) {
    if (bytes(name).length > usernameLength) revert();
  }







  // Clover Management


  struct Clover {
    bool exists;
    bytes28 first32Moves;
    bytes28 lastMoves;
    uint256 lastPaidAmount;
    uint256 findersFee;
    uint256 created;
    uint256 modified;
    address[] previousOwners;
    // bool validated;
  }
  uint256 clovernameLength;
  mapping (bytes16 => Clover) public clovers;
  bytes16[] public cloverKeys;


  function cloverExists(bytes16 b) public exists(b) constant{}

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

  function getCloverOwner(bytes16 board) public exists(board) constant returns(address previousOwner) {
    return clovers[board].previousOwners[ clovers[board].previousOwners.length - 1 ];
  }

  function addCloverOwner (bytes16 board) public exists(board) {
    clovers[board].previousOwners
  }

  function getLastPaidAmount (bytes16 board) public exists(board) constant returns (uint) {
    return clovers[board].lastPaidAmount;
  }

  function getNextPrice (bytes16 board) public exists(board) constant returns (uint) {
    return clovers[board].previousOwners.length == 1 ? clovers[board].lastPaidAmount : (clovers[board].lastPaidAmount * 2);
  }

  function getCloverOwnerAtKeyByBoard(bytes16 board, uint ownerKey) public exists(board) constant returns(bytes16, address previousOwner) {
    return (board, clovers[board].previousOwners[ownerKey]);
  }

  function getCloverOwnerAtKeyByBoardKey(uint boardKey, uint ownerKey) public constant returns(bytes16, address previousOwner) {
    bytes16 board = cloverKeys[boardKey];
    if(!clovers[board].exists) revert();
    return (board, clovers[board].previousOwners[ownerKey]);
  }

  function changeClovernameLength (uint256 len) public onlyAdmin() {
    clovernameLength = len;
  }

  function renameClover(bytes16 board, string name) public exists(board) {
    if (bytes(name).length > clovernameLength) revert();
    if (clovers[board].previousOwners[clovers[board].previousOwners.length - 1] != msg.sender) revert();
    newCloverName(board, name);
  }

  function changeStartPrice(bytes16 board, uint256 startPrice) public exists(board) {
    if(clovers[board].previousOwners[0] != msg.sender) revert();
    if(clovers[board].previousOwners.length > 1) revert();
    clovers[board].lastPaidAmount = startPrice;
  }
  function buyClover (bytes16 board) public exists (board){
    // every clover asset is for sale determined on an initial start price
    // if that clover is purchased, the proceeds are divided evenly among the last two buyers
    // cant flip board you currently own
    if (getCloverOwner(board) == msg.sender) revert();
    uint nextPrice = getNextPrice(board);
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
    clovers[b].previousOwners.push(msg.sender);
    clovers[b].lastPaidAmount = nextPrice;
    clovers[b].modified = now;
    Registered(msg.sender, nextPrice, b, false, registeredEvent, clovers[b].first32Moves, clovers[b].lastMoves, clovers[b].modified, clovers[b].findersFee);
    registeredEvent++;
  }
}