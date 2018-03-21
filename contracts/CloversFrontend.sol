pragma solidity ^0.4.17;

/**
 * The Clovers contract is the interface for the CloversController Contract
 */
import "CloversFactory.sol";
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
    function isValid(bytes15 moves) public constant returns (bool) {
        return CloversFactory(cloversController).isValid(moves);
    }
    /**
    * @dev Checks whether the game has passed the verification period.
    * @param board The board being checked.
    * @return A boolean representing whether or not the game has been verified.
    */
    function isVerified(uint256 _tokenId) public constant returns (bool) {
        return CloversFactory(cloversController).isVerified(_tokenId);
    }
    /**
    * @dev Gets the reward amount based on the symmetry of the board.
    * @param board The board being checked.
    * @return A uint256 representing the reward that would be returned for claiming the board.
    */
    function getReward(uint256 _tokenId) public constant returns (uint256) {
        return CloversFactory(cloversController).getReward(_tokenId);
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
    * @param board The board that results from the moves.
    * @return A boolean representing whether or not the claim was successful.
    */
    function claimClover(bytes15 moves, uint256 _tokenId, bytes1 _symmetries, address _to) public payable returns (bool) {
        return CloversFactory(cloversController).claimClover(moves, _tokenId, _to);
    }
    /**
    * @dev Commit the hash of the moves needed to claim the Clover.
    * @param movesHash The hash of the moves that makes up the Clover reversi game.
    * @return A boolean representing whether or not the commit was successful.
    */
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool) {
        return CloversFactory(cloversController).claimCloverCommit(movesHash, _to);
    }
    /**
    * @dev Reveal the solution to the previous commit to claim the Clover.
    * @param moves The moves that make up the Clover reversi game.
    * @param board The board that results from the moves.
    * @param _symmetries The bytes1 representation of the symmetries on the board.
    * @return A boolean representing whether or not the reveal and claim was successful.
    */
    function claimCloverReveal(bytes15 moves, uint256 _tokenId, bytes1 _symetries) public returns (bool) {
        return CloversFactory(cloversController).claimCloverReveal(moves, _tokenId, _symetries);
    }
    /**
    * @dev Retrieve the stake from a Clover claim after the stake period has ended.
    * @param board The board which holds the stake.
    * @return A boolean representing whether or not the retrieval was successful.
    */
    function retrieveStake(uint256 _tokenId) public returns (bool) {
        return CloversFactory(cloversController).retrieveStake(_tokenId);
    }
    /**
    * @dev Challenge a staked Clover for being invalid.
    * @param board The board being challenged.
    * @return A boolean representing whether or not the challenge was successful.
    */
    function challengeClover(uint256 _tokenId) public returns (bool) {
        return CloversFactory(cloversController).challengeClover(_tokenId);
    }

}
