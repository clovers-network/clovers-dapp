pragma solidity ^0.4.13;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ClubToken.sol";

contract TestClubToken {

  function testInitialBalanceUsingDeployedContract() {
    ClubToken clubToken = ClubToken(DeployedAddresses.ClubToken());

    uint expected = 1000000;

    Assert.equal(clubToken.getBalance(tx.origin), expected, "Owner should have 1000000 ClubToken initially1");
  }

}
