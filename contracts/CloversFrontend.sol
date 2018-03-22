pragma solidity ^0.4.17;

/**
 * The Clovers contract is the interface for the CloversController Contract
 */
import "./CloversFactory.sol";
import "zeppelin-solidity/contracts/ownership/HasNoTokens.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";


contract CloversFrontend is CloversFactory, HasNoTokens, HasNoEther {

    address cloversController;

    function CloversFrontend (address _cloversController) public {
        updateCloversControllerAddress(_cloversController);
    }

    /**
    * @dev Gets the current staking amount needed to claim a Clover.
    * @return A uint256 value of how much stake is needed.
    */
    function currentStakeAmount() public constant returns (uint256) {
        return CloversFactory(cloversController).currentStakeAmount();
    }
    /**
    * @dev Gets the current staking period needed to verify a Clover.
    * @return A uint256 value of stake period in seconds.
    */
    function currentStakePeriod() public constant returns (uint256) {
        return CloversFactory(cloversController).currentStakePeriod();
    }
    /**
    * @dev Checks whether the game is valid.
    * @param moves The moves needed to play validate the game.
    * @return A boolean representing whether or not the game is valid.
    */
    function isValid(bytes28[2] moves) public constant returns (bool) {
        return CloversFactory(cloversController).isValid(moves);
    }
    /**
    * @dev Checks whether the game has passed the verification period.
    * @param _tokenId The board being checked.
    * @return A boolean representing whether or not the game has been verified.
    */
    function isVerified(uint256 _tokenId) public constant returns (bool) {
        return CloversFactory(cloversController).isVerified(_tokenId);
    }
    /**
    * @dev Calculates the reward of the board.
    * @param _symmetries symmetries saved as a bytes1 value like 00010101 where bits represent symmetry types.
    * @return A uint256 representing the reward that would be returned for claiming the board.
    */
    function calculateReward(bytes1 _symmetries) public constant returns (uint256) {
        return CloversFactory(cloversController).calculateReward(_symmetries);
    }

    /**
    * @dev Updates the deployed address of the CloverController contract.
    * @param _cloversController The address of the CloverController contract.
    */
    function updateCloversControllerAddress(address _cloversController) public onlyOwner {
        if (_cloversController == 0) {
            revert();
        }
        cloversController = _cloversController;
    }

    /**
    * @dev Claim the Clover without a commit or reveal.
    * @param moves The moves that make up the Clover reversi game.
    * @param _tokenId The board that results from the moves.
    * @param _symmetries symmetries saved as a bytes1 value like 00010101 where bits represent symmetry types.
    * @param _to The address claiming the Clover.
    * @return A boolean representing whether or not the claim was successful.
    */
    function claimClover(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries, address _to) public payable returns (bool) {
        return CloversFactory(cloversController).claimClover(moves, _tokenId, _symmetries, _to);
    }
    /**
    * @dev Commit the hash of the moves needed to claim the Clover. A stake should be made for counterfactual verification.
    * @param movesHash The hash of the moves that makes up the Clover reversi game.
    * @param _to The address claiming the Clover.
    * @return A boolean representing whether or not the commit was successful.
    */
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool) {
        return CloversFactory(cloversController).claimCloverCommit(movesHash, _to);
    }
    /**
    * @dev Reveal the solution to the previous commit to claim the Clover.
    * @param moves The moves that make up the Clover reversi game.
    * @param _tokenId The board that results from the moves.
    * @param _symmetries symmetries saved as a bytes1 value like 00010101 where bits represent symmetry types.
    * @return A boolean representing whether or not the reveal and claim was successful.
    */
    function claimCloverReveal(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries) public returns (bool) {
        return CloversFactory(cloversController).claimCloverReveal(moves, _tokenId, _symmetries);
    }
    /**
    * @dev Retrieve the stake from a Clover claim after the stake period has ended.
    * @param _tokenId The board which holds the stake.
    * @return A boolean representing whether or not the retrieval was successful.
    */
    function retrieveStake(uint256 _tokenId) public returns (bool) {
        return CloversFactory(cloversController).retrieveStake(_tokenId);
    }
    /**
    * @dev Challenge a staked Clover for being invalid.
    * @param _tokenId The board being challenged.
    * @param _to The address challenging the Clover.
    * @return A boolean representing whether or not the challenge was successful.
    */
    function challengeClover(uint256 _tokenId, address _to) public returns (bool) {
        return CloversFactory(cloversController).challengeClover(_tokenId, _to);
    }

}
