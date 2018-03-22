pragma solidity ^0.4.17;

/**
 * The Clovers contract is the interface for the CloversController Contract
 */


contract CloversFactory {

    event cloverCommited(bytes32 movesHash, address miner);
    event cloverRevealed(bytes28[2] moves, uint256 _tokenId, address miner);
    event cloverClaimed(bytes28[2] moves, uint256 _tokenId, address miner);
    event stakeRetrieved(bytes28[2] moves, uint256 _tokenId, address miner);
    event cloverChallenged(bytes28[2] moves, uint256 _tokenId, address miner, address challenger);

    function currentStakeAmount() public constant returns (uint256);
    function currentStakePeriod() public constant returns (uint256);
    function isValid(bytes28[2] moves) public constant returns (bool);
    function isVerified(uint256 _tokenId) public constant returns (bool);
    function calculateReward(bytes1 _symmetries) public constant returns (uint256);
    
    // function claimClover(bytes28[2] moves, uint256 _tokenId) public payable returns (bool);
    // function claimClover(bytes28[2] moves, uint256 _tokenId, address _to) public payable returns (bool);
    // function claimClover(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries) public payable returns (bool);
    function claimClover(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries, address _to) public payable returns (bool);
    // function claimCloverCommit(bytes32 movesHash) public payable returns (bool);
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool);
    // function claimCloverReveal(bytes28[2] moves, uint256 _tokenId) public returns (bool);
    function claimCloverReveal(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries) public returns (bool);
    function retrieveStake(uint256 _tokenId) public returns (bool);
    // function challengeClover(uint256 _tokenId) public returns (bool);
    function challengeClover(uint256 _tokenId, address _to) public returns (bool);

}
