pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

/**
 * The CloversController is upgradeable and contains the logic used by CloversFrontend
 * Both adhere to the CloversFactory interface design
 */
import "./IClovers.sol";
import "./Reversi.sol";
import "./Mintable.sol";
import "./CloversFactory.sol";
import "zeppelin-solidity/contracts/ownership/HasNoTokens.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract CloversController is CloversFactory, HasNoTokens, HasNoEther {
    event cloverCommited(bytes32 movesHash, address miner);
    event cloverRevealed(bytes28[2] moves, uint256 _tokenId, address miner);
    event cloverClaimed(bytes28[2] moves, uint256 _tokenId, address miner);
    event stakeRetrieved(bytes28[2] moves, uint256 _tokenId, address miner);
    event cloverChallenged(bytes28[2] moves, uint256 _tokenId, address miner, address challenger);
    event DebugGame(bytes16 board, bool error, bool complete, bool symmetrical, bool RotSym, bool Y0Sym, bool X0Sym, bool XYSym, bool XnYSym, uint256 moveKey);
    event DebugBool(bool boolean);

    using SafeMath for uint256;

    address clovers;
    address clubToken;

    uint256 payMultiplier;
    uint256 stakeAmount;
    uint256 stakePeriod;

    function CloversController(address _clovers, address _clubToken) public {
        clovers = _clovers;
        clubToken = _clubToken;
    }    

    /**
    * @dev Gets the current staking amount needed to claim a Clover.
    * @return A uint256 value of how much stake is needed.
    */
    function currentStakeAmount() public constant returns (uint256) {
        return stakeAmount;
    }
    /**
    * @dev Gets the current staking period needed to verify a Clover.
    * @return A uint256 value of stake period in seconds.
    */
    function currentStakePeriod() public constant returns (uint256) {
        return stakePeriod;
    }
    /**
    * @dev Gets the current staking period needed to verify a Clover.
    * @return A uint256 value of stake period in seconds.
    */
    function getMultiplier() public constant returns (uint256) {
        return payMultiplier;
    }
    /**
    * @dev Gets the current staking period needed to verify a Clover.
    * @return A uint256 value of stake period in seconds.
    */
    function getMovesHash(uint _tokenId) public constant returns (bytes32) {
        return keccak256(IClovers(clovers).getCloverMoves(_tokenId));
    }
    /**
    * @dev Checks whether the game is valid.
    * @param moves The moves needed to play validate the game.
    * @return A boolean representing whether or not the game is valid.
    */
    function isValid(bytes28[2] moves) public constant returns (bool) {
        Reversi.Game memory game = Reversi.playGame(moves);
        if (isValidGame(game)) {
            return true;
        } else {
            return false;
        }
    }
    function _isValid(bytes28[2] moves) public {
        Reversi.Game memory game = Reversi.playGame(moves);
        // DebugBool(game.complete);
        // return game.msg;
        // return game.moveKey;
    }
    /**
    * @dev Checks whether the game is valid.
    * @param game The pre-played game.
    * @return A boolean representing whether or not the game is valid.
    */
    function isValidGame(Reversi.Game game) public constant returns (bool) {
        if (game.error) return false;
        if (!game.complete) return false;
        return true;
    }
    /**
    * @dev Checks whether the game has passed the verification period.
    * @param _tokenId The board being checked.
    * @return A boolean representing whether or not the game has been verified.
    */
    function isVerified(uint256 _tokenId) public constant returns (bool) {
        uint256 _blockMinted = IClovers(clovers).getBlockMinted(_tokenId);
        if(_blockMinted == 0) return false;
        // require(block.number > _blockMinted);
        return (block.number - _blockMinted) > stakePeriod;
    }
    function returnBlock() public constant returns (uint) {
        return block.number;
    }
    /**
    * @dev Calculates the reward of the board.
    * @param _symmetries symmetries saved as a bytes1 value like 00010101 where bits represent symmetry types.
    * @return A uint256 representing the reward that would be returned for claiming the board.
    */
    function calculateReward(bytes1 _symmetries) public constant returns (uint256) {
        uint256 Symmetricals;
        uint256 RotSym;
        uint256 Y0Sym;
        uint256 X0Sym;
        uint256 XYSym;
        uint256 XnYSym;
        (Symmetricals,
        RotSym,
        Y0Sym,
        X0Sym,
        XYSym,
        XnYSym) = IClovers(clovers).getAllSymmetries();
        uint256 base = 0;
        if (_symmetries >> 4 & 1 == 1) base = base.add(payMultiplier.mul(Symmetricals + 1).div(RotSym + 1));
        if (_symmetries >> 3 & 1 == 1) base = base.add(payMultiplier.mul(Symmetricals + 1).div(Y0Sym + 1));
        if (_symmetries >> 2 & 1 == 1) base = base.add(payMultiplier.mul(Symmetricals + 1).div(X0Sym + 1));
        if (_symmetries >> 1 & 1 == 1) base = base.add(payMultiplier.mul(Symmetricals + 1).div(XYSym + 1));
        if (_symmetries & 1 == 1) base = base.add(payMultiplier.mul(Symmetricals + 1).div(XnYSym + 1));
        return base;
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
        require(moves[0] != 0);
        require(msg.value == stakeAmount);
        bytes32 movesHash = keccak256(moves);
        IClovers(clovers).setCommit(movesHash, _to);
        IClovers(clovers).setStake(movesHash, stakeAmount);
        clovers.transfer(stakeAmount);
        require(IClovers(clovers).getBlockMinted(_tokenId) == 0);
        IClovers(clovers).setBlockMinted(_tokenId, block.number);
        IClovers(clovers).setCloverMoves(_tokenId, moves);
        if (_symmetries > 0) {
            IClovers(clovers).setSymmetries(_tokenId, _symmetries);
            uint256 reward = calculateReward(_symmetries);
            IClovers(clovers).setReward(_tokenId, reward);
        }
        IClovers(clovers).mint(_to, _tokenId);
        return true;
    }
    /**
    * @dev Commit the hash of the moves needed to claim the Clover. A stake should be made for counterfactual verification.
    * @param movesHash The hash of the moves that makes up the Clover reversi game.
    * @param _to The address claiming the Clover.
    * @return A boolean representing whether or not the commit was successful.
    */
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool) {
        require(_to != 0);
        require(msg.value == stakeAmount);
        require(IClovers(clovers).getCommit(movesHash) == 0);
        IClovers(clovers).setCommit(movesHash, _to);
        IClovers(clovers).setStake(movesHash, stakeAmount);
        clovers.transfer(stakeAmount);
        return true;
    }
    /**
    * @dev Reveal the solution to the previous commit to claim the Clover.
    * @param moves The moves that make up the Clover reversi game.
    * @param _tokenId The board that results from the moves.
    * @param _symmetries symmetries saved as a bytes1 value like 00010101 where bits represent symmetry types.
    * @return A boolean representing whether or not the reveal and claim was successful.
    */
    function claimCloverReveal(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries) public returns (bool) {
        require(moves[0] != 0);
        bytes32 movesHash = keccak256(moves);
        address commiter = IClovers(clovers).getCommit(movesHash);
        require(IClovers(clovers).getBlockMinted(_tokenId) == 0);
        IClovers(clovers).setBlockMinted(_tokenId, block.number);
        IClovers(clovers).setCloverMoves(_tokenId, moves);
        if (_symmetries > 0) {
            IClovers(clovers).setSymmetries(_tokenId, _symmetries);
            uint256 reward = calculateReward(_symmetries);
            IClovers(clovers).setReward(_tokenId, reward);
        }
        IClovers(clovers).mint(commiter, _tokenId);
        return true;
    }
    /**
    * @dev Retrieve the stake from a Clover claim after the stake period has ended.
    * @param _tokenId The board which holds the stake.
    * @return A boolean representing whether or not the retrieval was successful.
    */
    function retrieveStake(uint256 _tokenId) public returns (bool) {
        bytes28[2] memory moves = IClovers(clovers).getCloverMoves(_tokenId);
        require(moves[0] != 0);
        bytes32 movesHash = keccak256(moves);
        uint256 stake = IClovers(clovers).getStake(movesHash);
        require(stake != 0);
        require(isVerified(_tokenId));
        IClovers(clovers).setStake(movesHash, 0);
        addSymmetries(_tokenId);
        address commiter = IClovers(clovers).getCommit(movesHash);
        uint256 reward = IClovers(clovers).getReward(_tokenId);
        require(Mintable(clubToken).mint(commiter, reward));
        require(IClovers(clovers).moveEth(commiter, stake));
        return true;
    }
    /**
    * @dev Challenge a staked Clover for being invalid.
    * @param _tokenId The board being challenged.
    * @param _to The address challenging the Clover.
    * @return A boolean representing whether or not the challenge was successful.
    */
    function challengeClover(uint256 _tokenId, address _to) public returns (bool) {
        bool valid = true;
        bytes28[2] memory moves = IClovers(clovers).getCloverMoves(_tokenId);
        require(moves[0] != 0);
        Reversi.Game memory game = Reversi.playGame(moves);
        if(isValidGame(game)) {
            bytes1 _symmetries = IClovers(clovers).getSymmetries(_tokenId);

            valid = (_symmetries >> 4 & 1) > 0 == game.RotSym ? valid : false;
            valid = (_symmetries >> 3 & 1) > 0 == game.Y0Sym ? valid : false;
            valid = (_symmetries >> 2 & 1) > 0 == game.X0Sym ? valid : false;
            valid = (_symmetries >> 1 & 1) > 0 == game.XYSym ? valid : false;
            valid = (_symmetries & 1) > 0 == game.XnYSym ? valid : false;

        } else {
            valid = false;
        }
        if (!valid) {
            IClovers(clovers).deleteClover(_tokenId);
            bytes32 movesHash = keccak256(moves);
            if (!isVerified(_tokenId)) {
                uint256 stake = IClovers(clovers).getStake(movesHash);
                IClovers(clovers).moveEth(_to, stake);
            }
            IClovers(clovers).unmint(_tokenId);
            IClovers(clovers).setCommit(movesHash, 0);
            IClovers(clovers).setStake(movesHash, 0);
            removeSymmetries(_tokenId);
        } else {
            revert();
        }
        return true;
    }

    /**
    * @dev Updates the stake amount.
    * @param _stakeAmount The new amount needed to stake.
    */
    function updateStakeAmount(uint256 _stakeAmount) public onlyOwner {
        stakeAmount = _stakeAmount;
    }
    /**
    * @dev Updates the stake period.
    * @param _stakePeriod The uint256 value of time needed to stake before being verified.
    */
    function updateStakePeriod(uint256 _stakePeriod) public onlyOwner {
        stakePeriod = _stakePeriod;
    }
    /**
    * @dev Updates the pay multiplier, used to calculate token reward.
    * @param _payMultiplier The uint256 value of pay multiplier.
    */
    function updatePayMultipier(uint256 _payMultiplier) public onlyOwner {
        payMultiplier = _payMultiplier;
    }
    /**
    * @dev Adds new tallys of the totals numbers of clover symmetries.
    * @param _tokenId The token which needs to be examined.
    */
    function addSymmetries(uint256 _tokenId) private {
        uint256 Symmetricals;
        uint256 RotSym;
        uint256 Y0Sym;
        uint256 X0Sym;
        uint256 XYSym;
        uint256 XnYSym;
        (Symmetricals,
        RotSym,
        Y0Sym,
        X0Sym,
        XYSym,
        XnYSym) = IClovers(clovers).getAllSymmetries();
        bytes1 _symmetries = IClovers(clovers).getSymmetries(_tokenId);
        Symmetricals = Symmetricals.add(_symmetries > 0 ? 1 : 0);
        RotSym = RotSym.add(uint256(_symmetries >> 4 & 1));
        Y0Sym = Y0Sym.add(uint256(_symmetries >> 3 & 1));
        X0Sym = X0Sym.add(uint256(_symmetries >> 2 & 1));
        XYSym = XYSym.add(uint256(_symmetries >> 1 & 1));
        XnYSym = XnYSym.add(uint256(_symmetries & 1));
        IClovers(clovers).setAllSymmetries(Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym);
    }
    /**
    * @dev Remove false tallys of the totals numbers of clover symmetries.
    * @param _tokenId The token which needs to be examined.
    */
    function removeSymmetries(uint256 _tokenId) private {
        uint256 Symmetricals;
        uint256 RotSym;
        uint256 Y0Sym;
        uint256 X0Sym;
        uint256 XYSym;
        uint256 XnYSym;
        (Symmetricals,
        RotSym,
        Y0Sym,
        X0Sym,
        XYSym,
        XnYSym) = IClovers(clovers).getAllSymmetries();
        bytes1 _symmetries = IClovers(clovers).getSymmetries(_tokenId);
        Symmetricals = Symmetricals.sub(_symmetries > 0 ? 1 : 0);
        RotSym = RotSym.sub(uint256(_symmetries >> 4 & 1));
        Y0Sym = Y0Sym.sub(uint256(_symmetries >> 3 & 1));
        X0Sym = X0Sym.sub(uint256(_symmetries >> 2 & 1));
        XYSym = XYSym.sub(uint256(_symmetries >> 1 & 1));
        XnYSym = XnYSym.sub(uint256(_symmetries & 1));
        IClovers(clovers).setAllSymmetries(Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym);
    }

}