pragma solidity ^0.4.17;

/**
 * Mintable is a contract interface for CloversController to use
 */


contract Mintable {

  function Mintable() public {}

  function mint(address _to, uint256 amount) public returns(bool);
  
}