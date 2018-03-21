pragma solidity ^0.4.17;

/**
* CloversMetadata contract is upgradeable and returns metadata about Clovers
*/

import "zeppelin-solidity/contracts/ownership/HasNoTokens.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";

contract TokenMetadataController is HasNoTokens, HasNoEther {
    
    address cloversController;
    mapping(uint => string) internal tokenIdToMetadata;

    modifier onlyOwnerOrController() {
        require(
            msg.sender == cloversController ||
            msg.sender == owner
        );
        _;
    }

    function TokenMetadataController (address _cloversController) public {
        cloversController = _cloversController;
    }

    function tokenMetadata(uint _tokenId) public view returns (string _infoUrl) {
        return tokenIdToMetadata[_tokenId];
    }

    function insertTokenMetadata(uint _tokenId, string _metadata) public onlyOwnerOrController {
        tokenIdToMetadata[_tokenId] = _metadata;
    }

}