pragma solidity ^0.4.19;

/**
 * Interface for Digital Asset Registry for the Non Fungible Token Clover
 * with upgradeable contract reference for returning metadata.
 */

contract IClovers {

    function IClovers () public {}

    function tokenMetadata(uint _tokenId) public view returns (string _infoUrl);
    function getStake(bytes32 movesHash) public view returns (uint256);
    function getCommit(bytes32 movesHash) public view returns (address);
    function getBlockMinted(uint256 _tokenId) public view returns (uint256);
    function getCloverMoves(uint256 _tokenId) public view returns (bytes28[2]);
    function getReward(uint256 _tokenId) public view returns (uint256);
    function getSymmetries(uint256 _tokenId) public view returns (bytes1);
    function getAllSymmetries() public view returns (uint256, uint256, uint256, uint256, uint256, uint256);

    function moveEth(address _to, uint256 amount) public returns (bool);
    function moveToken(uint256 amount, address _to, address token) public returns (bool);
    function approveToken(uint256 amount, address _to, address token) public returns (bool);

    function setStake(bytes32 movesHash, uint256 stake) public;
    function setCommit(bytes32 movesHash, address commiter) public;
    function setBlockMinted(uint256 _tokenId, uint256 value) public;
    function setCloverMoves(uint256 _tokenId, bytes28[2] moves) public;
    function setReward(uint256 _tokenId, uint256 _amount) public;
    function setSymmetries(uint256 _tokenId, bytes1 _symmetries) public;
    function setAllSymmetries(uint256 _totalSymmetries, uint256 RotSym, uint256 Y0Sym, uint256 X0Sym, uint256 XYSym, uint256 XnYSym) public;
    function deleteClover(uint256 _tokenId) public;

    function updateCloversControllerAddress(address _cloversController) public;
    function updateCloversMetadataAddress(address _cloversMetadata) public;

    function mint (address _to, uint256 _tokenId) public;
    function burn (uint256 _tokenId) public;

}
