pragma solidity ^0.4.17;

/**
 * The CloversController is upgradeable and contains the logic used by CloversFrontend
 * Both adhere to the CloversFactory interface design
 */
import "./Clovers.sol";
import "./Mintable.sol";
import "./CloversFactory.sol";
import "zeppelin-solidity/contracts/ownership/HasNoTokens.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract CloversController is CloversFactory, HasNoTokens, HasNoEther {
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
    * @dev Checks whether the game is valid.
    * @param moves The moves needed to play validate the game.
    * @return A boolean representing whether or not the game is valid.
    */
    function isValid(Reversi.Game game) public constant returns (bool) {
        if (game.error) return false;
        if (!game.complete) return false;
        return true;
    }
    /**
    * @dev Checks whether the game has passed the verification period.
    * @param board The board being checked.
    * @return A boolean representing whether or not the game has been verified.
    */
    function isVerified(uint256 _tokenId) public constant returns (bool) {
        uint256 _blockMinted = Clovers(clovers).getBlockMinted(_tokenId);
        require(_blockMinted != 0);
        require(now > _blockMinted);
        return ((now - _blockMinted) > stakePeriod);
    }
    /**
    * @dev Gets the reward amount based on the symmetry of the board.
    * @param _symmetries The bytes1 representation of the symmetries.
    * @return A uint256 representing the reward that would be returned for claiming the board.
    */
    function convertSymmetries(bytes1 _symmetries) private constant returns (bool, bool, bool, bool, bool) {
        bool RotSym = _symmetries >> 4 & 1 == 1;
        bool Y0Sym = _symmetries >> 3 & 1 == 1;
        bool X0Sym = _symmetries >> 2 & 1 == 1;
        bool XYSym = _symmetries >> 1 & 1 == 1;
        bool XnYSym = _symmetries & 1 == 1;
        return (RotSym, Y0Sym, X0Sym, XYSym, XnYSym);
    }
    /**
    * @dev Calculates the reward of the board.
    * @param game Reversi library board struct.
    * @return A uint256 representing the reward that would be returned for claiming the board.
    */
    function calculateReward (bool _RotSym, bool _Y0Sym, bool _X0Sym, bool _XYSym, bool _XnYSym) private constant returns(uint256) {
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
        XnYSym) = Clovers(clovers).getAllSymmetries();
        uint256 base = 0;
        if (_RotSym) base = base.add(payMultiplier.mul(Symmetricals + 1).div(RotSym + 1));
        if (_Y0Sym) base = base.add(payMultiplier.mul(Symmetricals + 1).div(Y0Sym + 1));
        if (_X0Sym) base = base.add(payMultiplier.mul(Symmetricals + 1).div(X0Sym + 1));
        if (_XYSym) base = base.add(payMultiplier.mul(Symmetricals + 1).div(XYSym + 1));
        if (_XnYSym) base = base.add(payMultiplier.mul(Symmetricals + 1).div(XnYSym + 1));
        return base;
    }

    /**
    * @dev Claim the Clover without a commit or reveal.
    * @param moves The moves that make up the Clover reversi game.
    * @param board The board that results from the moves.
    * @return A boolean representing whether or not the claim was successful.
    */
    function claimClover(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries, address _to) public payable returns (bool) {
        require(moves[0] != 0);
        bytes32 movesHash = keccak256(moves);
        Clovers(clovers).setCommit(movesHash, _to);
        Clovers(clovers).setStake(movesHash, stakeAmount);
        clovers.transfer(stakeAmount);
        require(Clovers(clovers).getBlockMinted(_tokenId) != 0);
        Clovers(clovers).setBlockMinted(_tokenId, now);
        Clovers(clovers).setCloverMoves(_tokenId, moves);
        if (_symmetries > 0) {
            Clovers(clovers).setSymmetries(_tokenId, _symmetries);
            uint256 reward = calculateReward(convertSymmetries(_symmetries));
            Clovers(clovers).setReward(_tokenId, reward);
        }
        Clovers(clovers).mint(_to, _tokenId);
        return true;
    }
    /**
    * @dev Commit the hash of the moves needed to claim the Clover. A stake should be made for counterfactual verification.
    * @param movesHash The hash of the moves that makes up the Clover reversi game.
    * @return A boolean representing whether or not the commit was successful.
    */
    function claimCloverCommit(bytes32 movesHash, address _to) public payable returns (bool) {
        require(_to != 0);
        require(msg.value == stakeAmount);
        require(Clovers(clovers).getCommit(movesHash) == 0);
        Clovers(clovers).setCommit(movesHash, _to);
        Clovers(clovers).setStake(movesHash, stakeAmount);
        clovers.transfer(stakeAmount);
        return true;
    }
    /**
    * @dev Reveal the solution to the previous commit to claim the Clover.
    * @param moves The moves that make up the Clover reversi game.
    * @param board The board that results from the moves.
    * @param _symmetries The bytes1 representation of the symmetries on the board.
    * @return A boolean representing whether or not the reveal and claim was successful.
    */
    function claimCloverReveal(bytes28[2] moves, uint256 _tokenId, bytes1 _symmetries) public returns (bool) {
        require(moves[0] != 0);
        bytes32 movesHash = keccak256(moves);
        address commiter = Clovers(clovers).getCommit(movesHash);
        require(Clovers(clovers).getBlockMinted(_tokenId) != 0);
        Clovers(clovers).setBlockMinted(_tokenId, now);
        Clovers(clovers).setCloverMoves(_tokenId, moves);
        if (_symmetries > 0) {
            Clovers(clovers).setSymmetries(_tokenId, _symmetries);
            uint256 reward = calculateReward(convertSymmetries(_symmetries));
            Clovers(clovers).setReward(_tokenId, reward);
        }
        Clovers(clovers).mint(commiter, _tokenId, moves);
        return true;
    }
    /**
    * @dev Retrieve the stake from a Clover claim after the stake period has ended.
    * @param board The board which holds the stake.
    * @return A boolean representing whether or not the retrieval was successful.
    */
    function retrieveStake(uint256 _tokenId) public returns (bool) {
        bytes28[2] moves = Clovers(clovers).getCloverMoves(_tokenId);
        require(moves[0] != 0);
        bytes32 movesHash = keccak256(moves);
        uint256 stake = Clovers(clovers).getStake(movesHash);
        require(stake != 0);
        require(isVerified(_tokenId));
        Clovers(clovers).setStake(movesHash, 0);
        addSymmetries(_tokenId);
        address commiter = Clovers(clovers).getCommit(movesHash);
        uint56 reward = Clovers(clovers).getReward(_tokenId);
        require(Mintable(clubToken).mint(commiter, reward));
        require(Clovers(clovers).moveEth(commiter, stake));
        return true;
    }
    /**
    * @dev Challenge a staked Clover for being invalid.
    * @param board The board being challenged.
    * @return A boolean representing whether or not the challenge was successful.
    */
    function challengeClover(uint256 _tokenId, address _to) public returns (bool) {
        bool valid = true;
        bytes28[2] moves = Clovers(clovers).getCloverMoves(_tokenId);
        require(moves[0] != 0);
        Reversi.Game memory game = Reversi.playGame(moves);
        if(isValid(game)) {
            bytes1 _symmetries = Clovers(clovers).getSymmetries(_tokenId);

            valid = bool(_symmetries >> 4 & 1) == game.RotSym ? valid : false;
            valid = bool(_symmetries >> 3 & 1) == game.Y0Sym ? valid : false;
            valid = bool(_symmetries >> 2 & 1) == game.X0Sym ? valid : false;
            valid = bool(_symmetries >> 1 & 1) == game.XYSym ? valid : false;
            valid = bool(_symmetries & 1) == game.XnYSym ? valid : false;

        } else {
            valid = false;
        }
        if (!valid) {
            Clovers(clovers).deleteClover(_tokenId);
            bytes32 movesHash = keccak256(moves);
            if (!isVerified(_tokenId)) {
                uint256 stake = Clovers(clovers).getStake(movesHash);
                Clovers(clovers).moveEth(_to, stake);
            }
            Clovers(clovers).burn(_tokenId);
            Clovers(clovers).setCommit(movesHash, 0);
            Clovers(clovers).setStake(movesHash, 0);
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
        XnYSym) = Clovers(clovers).getAllSymmetries();
        bytes1 _symmetries = Clovers(clovers).getSymmetries(_tokenId);
        Symmetricals = Symmetricals.add(_symmetries > 0 ? 1 : 0);
        RotSym = RotSym.add(_symmetries >> 4 & 1);
        Y0Sym = Y0Sym.add(_symmetries >> 3 & 1);
        X0Sym = X0Sym.add(_symmetries >> 2 & 1);
        XYSym = XYSym.add(_symmetries >> 1 & 1);
        XnYSym = XnYSym.add(_symmetries & 1);
        Clovers(clovers).setAllSymmetries(Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym);
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
        XnYSym) = Clovers(clovers).getAllSymmetries();
        bytes1 _symmetries = Clovers(clovers).getSymmetries(_tokenId);
        Symmetricals = Symmetricals.sub(_symmetries > 0 ? 1 : 0);
        RotSym = RotSym.sub(_symmetries >> 4 & 1);
        Y0Sym = Y0Sym.sub(_symmetries >> 3 & 1);
        X0Sym = X0Sym.sub(_symmetries >> 2 & 1);
        XYSym = XYSym.sub(_symmetries >> 1 & 1);
        XnYSym = XnYSym.sub(_symmetries & 1);
        Clovers(clovers).setAllSymmetries(Symmetricals, RotSym, Y0Sym, X0Sym, XYSym, XnYSym);
    }

}