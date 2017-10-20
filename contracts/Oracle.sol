pragma solidity ^0.4.13;

import "./ClubToken.sol";
import "./oraclizeAPI.sol";

contract Oracle is usingOraclize {

  function Oracle() {
    owner = msg.sender;
  }

  ClubToken clubToken;
  
  event newOraclizeQuery(string message);

  struct Claim {
    bytes16 board;
    address player;
    bool claimed;
  }

  address owner;
  bytes32 oracleHash;
  mapping (bytes32=>Claim) validIds;
  bytes32[] validIdKeys;
  // string infura = 'json(https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d).result';
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

  function getValidIdAtKey (uint key) public constant returns(bytes16, address) {
    return (validIds[validIdKeys[key]].board, validIds[validIdKeys[key]].player);
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

  function setOracleHash(bytes32 endpoint) public onlyOwner() {
    oracleHash = endpoint;
  }

  function mineClover1(bytes16 board, address player, string endpoint, string payload) public onlyOwner() returns(bytes32){
    newOraclizeQuery("hits mineclover1");
    if (sha3(endpoint) != oracleHash || uint(oracleHash) == 0) revert();
    bytes32 queryId;
    if (oraclize_getPrice("URL") > this.balance) {
        newOraclizeQuery("Contract Out Of Money");
        clubToken.deleteClover(board);
    } else {
        newOraclizeQuery("Attempt Oracle");
        queryId = oraclize_query("URL", 'json(https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d).result', strConcat(endpoint, payload), 500000);
        validIdKeys.push(queryId);
        validIds[queryId].board = board;
        validIds[queryId].player = player;
    }
    return queryId;
  }

  function __callback(bytes32 myid, string result) public{
    newOraclizeQuery("callback called");
    if (uint8(validIds[myid].board) != 0) {
      newOraclizeQuery("callback called 2");
      if (msg.sender == oraclize_cbAddress()) {
        bytes16 board = validIds[myid].board;
        address player = validIds[myid].player;
        if (bytes(result)[65] != 0x31) {
          newOraclizeQuery("callback called 4");
          clubToken.deleteClover(board);
        } else {
          newOraclizeQuery("callback called 5");
          if (clubToken.cloverExistsUnvalidated(board)) {
            newOraclizeQuery("callback called 6");
            clubToken.oracleAddClover(board, player);
            validIds[myid].claimed = true;
          }
        }
      }
    } else {
      newOraclizeQuery("callback called 3");
    }
  }

}