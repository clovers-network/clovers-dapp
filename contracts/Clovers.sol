pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

/**
 * Digital Asset Registry for the Non Fungible Token Clover
 * with upgradeable contract reference for returning metadata.
 */

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IClovers.sol";
import "./CloversMetadata.sol";

contract Clovers is IClovers, ERC721Token, Ownable {

    address private cloversMetadata;
    uint256 totalSymmetries;
    uint256[5] symmetries; // RotSym, Y0Sym, X0Sym, XYSym, XnYSym
    address cloversController;

    mapping (uint256 => Clover) public clovers;
    struct Clover {
        bytes1 symmetries;
        bytes28[2] cloverMoves;
        uint256 blockMinted;
        uint256 rewards;
    }
    mapping (bytes32 => address) public commits;
    mapping (bytes32 => uint256) public stakes;

    modifier onlyOwnerOrController() {
        require(
            msg.sender == cloversController ||
            msg.sender == owner
        );
        _;
    }

    function Clovers () public {}
    function () public payable {}

    function implementation() public view returns (address) {
        return cloversMetadata;
    }

    function tokenMetadata(uint _tokenId) public view returns (string _infoUrl) {
        // require(ownerOf(_tokenId) != 0);
        address _impl = implementation();
        bytes memory data = msg.data;
        assembly {
            let result := delegatecall(gas, _impl, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
        // return CloversMetadata(cloversMetadata).tokenMetadata(_tokenId);
    }
    function getHash(bytes28[2] moves) public view returns (bytes32) {
        return keccak256(moves);
    }
    function getStake(bytes32 movesHash) public view returns (uint256) {
        return stakes[movesHash];
    }
    function getCommit(bytes32 movesHash) public view returns (address) {
        return commits[movesHash];
    }
    function getBlockMinted(uint256 _tokenId) public view returns (uint256) {
        return clovers[_tokenId].blockMinted;
    }
    function getCloverMoves(uint256 _tokenId) public view returns (bytes28[2]) {
        return clovers[_tokenId].cloverMoves;
    }
    function getReward(uint256 _tokenId) public view returns (uint256) {
        return clovers[_tokenId].rewards;
    }
    function getSymmetries(uint256 _tokenId) public view returns (bytes1) {
        return clovers[_tokenId].symmetries;
    }
    function getAllSymmetries() public view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        return (
            totalSymmetries,
            symmetries[0], //RotSym,
            symmetries[1], //Y0Sym,
            symmetries[2], //X0Sym,
            symmetries[3], //XYSym,
            symmetries[4] //XnYSym
        );
    }

/* ---------------------------------------------------------------------------------------------------------------------- */

    function moveEth(address _to, uint256 amount) public onlyOwnerOrController returns (bool) {
        require(amount <= this.balance);
        return _to.send(amount);
    }
    function moveToken(uint256 amount, address _to, address token) public onlyOwnerOrController returns (bool) {
        require(amount <= ERC20(token).balanceOf(this));
        return ERC20(token).transfer(_to, amount);
    }
    function approveToken(uint256 amount, address _to, address token) public onlyOwnerOrController returns (bool) {
        return ERC20(token).approve(_to, amount);
    }

    function setStake(bytes32 movesHash, uint256 stake) public onlyOwnerOrController {
        stakes[movesHash] = stake;
    }
    function setCommit(bytes32 movesHash, address commiter) public onlyOwnerOrController {
        commits[movesHash] = commiter;
    }
    function setBlockMinted(uint256 _tokenId, uint256 value) public onlyOwnerOrController {
        clovers[_tokenId].blockMinted = value;
    }
    function setCloverMoves(uint256 _tokenId, bytes28[2] moves) public onlyOwnerOrController {
        clovers[_tokenId].cloverMoves = moves;
    }
    function setReward(uint256 _tokenId, uint256 _amount) public onlyOwnerOrController {
        clovers[_tokenId].rewards = _amount;
    }
    function setSymmetries(uint256 _tokenId, bytes1 _symmetries) public onlyOwnerOrController {
        clovers[_tokenId].symmetries = _symmetries;
    }
    function setAllSymmetries(uint256 _totalSymmetries, uint256 RotSym, uint256 Y0Sym, uint256 X0Sym, uint256 XYSym, uint256 XnYSym) public onlyOwnerOrController {
        totalSymmetries = _totalSymmetries;
        symmetries[0] = RotSym;
        symmetries[1] = Y0Sym;
        symmetries[2] = X0Sym;
        symmetries[3] = XYSym;
        symmetries[4] = XnYSym;
    }
    function deleteClover(uint256 _tokenId) public onlyOwnerOrController {
        delete(clovers[_tokenId]);
    }

    function updateCloversControllerAddress(address _cloversController) public onlyOwner {
        require(_cloversController != 0);
        cloversController = _cloversController;
    }
    function updateCloversMetadataAddress(address _cloversMetadata) public onlyOwner {
        require(_cloversMetadata != 0);
        cloversMetadata = _cloversMetadata;
    }

    function mint (address _to, uint256 _tokenId) public onlyOwnerOrController {
        _mint(_to, _tokenId);
    }
    function unmint (uint256 _tokenId) public onlyOwnerOrController {
        address _owner = ownerOf(_tokenId); // needs to be changed from private to internal
        if (approvedFor(_tokenId) != 0) {
            tokenApprovals[_tokenId] = 0;
            Approval(_owner, 0, _tokenId);
        }
        removeToken(_owner, _tokenId); // needs to be changed from private to internal
        Transfer(_owner, 0x0, _tokenId);
    }

}
