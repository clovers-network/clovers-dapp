pragma solidity ^0.4.13;

import "./ClubToken.sol";
import "./oraclizeAPI.sol";

contract Oracle is usingOraclize {

  function Oracle() {
    owner = msg.sender;
  }

  ClubToken clubToken;
  
  address owner;
  bytes32 oracleHash;
  mapping (bytes32=>bytes16) validIds;

  // Modifiers

  modifier onlyOwner { if (msg.sender != owner) revert(); _; }

  // Public & Transactional

  function setClubToken (address clubTokenAddress) public onlyOwner() {
    clubToken = ClubToken(clubTokenAddress);
  }

  function setOracleHash(string endpoint) public onlyOwner() {
    oracleHash = sha3(endpoint);
  }

  function verifyGame(bytes16 board, bytes28 first32Moves, bytes28 lastMoves, uint256 startPrice, string endpoint, string payload) public payable {
    if (sha3(endpoint) != oracleHash || uint(oracleHash) == 0) revert();
    if (oraclize_getPrice("URL") > this.balance) {
        // newOraclizeQuery("Contract Out Of Money");
    } else {
        // newOraclizeQuery("Contract Validating Game");
        bytes32 queryId = oraclize_query("URL", strConcat(endpoint, payload));
        validIds[queryId] = board;
        clubToken.claimClover(board, first32Moves, lastMoves, startPrice);
    }
  }

  function __callback(bytes32 myid, bool valid) public {
    if (uint8(validIds[myid]) == 0) revert();
    if (msg.sender != oraclize_cbAddress()) revert();
    if (!valid) {
      clubToken.deleteClover(board);
    } else {
      bytes16 board = validIds[myid];
      address player = clubToken.getCloverOwner(board);
      if (!clubToken.cloverExistsUnvalidated(board)) revert();
      delete validIds[myid];

      clubToken.oracleAddClover(board, player);
    }
  }

}