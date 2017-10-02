pragma solidity ^0.4.13;

import "./ClubToken.sol";
import "./oraclizeAPI.sol";

contract Oracle is usingOraclize {

  function Oracle() {
    owner = msg.sender;
  }

  ClubToken clubToken;
  
  event newOraclizeQuery(string message);
  event newOraclizeUintQuery(uint8 level);

  address owner;
  bytes32 oracleHash;
  mapping (bytes32=>bytes16) validIds;
  bytes32[] validIdKeys;
  string infura = 'json(https://api.infura.io/v1/jsonrpc/rinkeby).result';
  string prefix;

  // Modifiers

  modifier onlyOwner { if (!(msg.sender == owner || msg.sender == address(clubToken))) revert(); _; }

  // Public & Constant

  function getOraclizeAddress () public constant returns(address) {
    return oraclize_cbAddress();
  }

  function getValidIdKeysCount () public constant returns(uint) {
    return validIdKeys.length;
  }

  function getValidIdAtKey (uint key) public constant returns(bytes16) {
    return validIds[validIdKeys[key]];
  }

  function getClubTokenAddress () public constant returns(address) {
    return address(clubToken);
  }

  function getOwner () public constant returns(address) {
    return owner;
  }

  function getSender () public constant returns(address) {
    return msg.sender;
  }

  function confirmHash (string endpoint) public constant returns(bool) {
    return sha3(endpoint) == oracleHash;
  }

  function getOracleHash () public constant returns(bytes32) {
    return oracleHash;
  }

  function isOwner () public constant onlyOwner() returns(bool) {
    return true;
  }

  function notOwner () public constant returns(bool) {
    return !(msg.sender == owner || msg.sender == address(clubToken));
  }

  // Public & Transactional

  function deposit() public payable {}

  function setClubToken (address clubTokenAddress) public onlyOwner() {
    clubToken = ClubToken(clubTokenAddress);
  }

  function setOracleHash(string endpoint) public onlyOwner() {
    prefix = endpoint;
    oracleHash = sha3(endpoint);
  }

  function mineClover1(bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice, string endpoint, string payload) public returns(bool){
    if (sha3(endpoint) != oracleHash || uint(oracleHash) == 0) revert();
    if (oraclize_getPrice("URL") > this.balance) {
        newOraclizeQuery("Contract Out Of Money");
        return false;
    } else {
        newOraclizeQuery("Contract Validating Game");
        string memory foo = strConcat(endpoint, payload);
        bytes32 queryId = oraclize_query("URL", infura, foo, 1000000);
        validIds[queryId] = board;
        clubToken.claimClover(board, first32Moves, lastMoves, startPrice);
        return true;
    }
  }

  function mineClover2(bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice, string payload) public returns(bool){
    if (uint(sha3(prefix)) == 0 || uint(oracleHash) == 0) revert();
    if (oraclize_getPrice("URL") > this.balance) {
        newOraclizeQuery("Contract Out Of Money");
        return false;
    } else {
        newOraclizeQuery("Contract Validating Game");
        bytes32 queryId = oraclize_query("URL", infura, strConcat(prefix, payload), 1000000);
        validIds[queryId] = board;
        clubToken.claimClover(board, first32Moves, lastMoves, startPrice);
        return true;
    }
  }

  function __callback(bytes32 myid, string valid) public {
    newOraclizeQuery(valid);
    newOraclizeUintQuery(1);
    if (uint8(validIds[myid]) == 0) revert();
    newOraclizeUintQuery(2);
    if (msg.sender != oraclize_cbAddress()) revert();
    newOraclizeUintQuery(3);
    // if (!bool(bytes(valid))) {
    if (bytes(valid)[31] != 0x01) {
      newOraclizeUintQuery(4);
      clubToken.deleteClover(board);
    } else {
      newOraclizeUintQuery(5);
      bytes16 board = validIds[myid];
      address player = clubToken.getCloverOwner(board);
      newOraclizeUintQuery(6);
      if (!clubToken.cloverExistsUnvalidated(board)) revert();
      newOraclizeUintQuery(7);
      delete validIds[myid];

      clubToken.oracleAddClover(board, player);
      newOraclizeUintQuery(8);
    }
  }

}