pragma solidity ^0.4.17;

/**
 * The Clovers contract is the interface for the CloversController Contract
 */


contract CloversFactory {

    event cloverCommited(bytes32 movesHash, address miner);
    event cloverRevealed(bytes15 moves, uint256 _tokenId, address miner);
    event cloverClaimed(bytes15 moves, uint256 _tokenId, address miner);
    event stakeRetrieved(bytes15 moves, uint256 _tokenId, address miner);
    event cloverChallenged(bytes15 moves, uint256 _tokenId, address miner, address challenger);

    function currentStakeAmount() public constant returns (uint256);
    function currentStakePeriod() public constant returns (uint256);
    function isValid(bytes15 moves) public constant returns (bool);
    function isVerified(uint256 _tokenId) public constant returns (bool);
    function getReward(uint256 _tokenId) public constant returns (uint256);
    
    function claimClover(bytes15 moves, uint256 _tokenId) public payable returns (bool);
    // function claimClover(bytes15 moves, uint256 _tokenId, address _to) public payable returns (bool);
    // function claimClover(bytes15 moves, uint256 _tokenId, bytes1 _symmetries) public payable returns (bool);
    function claimClover(bytes15 moves, uint256 _tokenId, bytes1 _symmetries, address _to) public payable returns (bool);
    // function claimCloverCommit(bytes32 movesHash) public payable returns (bool);
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool);
    // function claimCloverReveal(bytes15 moves, uint256 _tokenId) public returns (bool);
    function claimCloverReveal(bytes15 moves, uint256 _tokenId, bytes1 _symmetries) public returns (bool);
    function retrieveStake(uint256 _tokenId) public returns (bool);
    // function challengeClover(uint256 _tokenId) public returns (bool);
    function challengeClover(uint256 _tokenId, address _to) public returns (bool);

}
