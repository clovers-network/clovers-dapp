pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

/**
* CloversMetadata contract is upgradeable and returns metadata about Clovers
*/

import "./strings.sol";

contract CloversMetadata {
    using strings for *;

    function TokenMetadataController () public {}

    function tokenMetadata(uint _tokenId) public view returns (string _infoUrl) {
        string memory base = "https://metadata.clovers.network/0x";
        string memory id = uint2hexstr(_tokenId);
        string memory suffix = ".json";
        return base.toSlice().concat(id.toSlice()).toSlice().concat(suffix.toSlice());
    }
    function uint2hexstr(uint i) internal pure returns (string) {
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j = j >> 4;
        }
        uint mask = 15;
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0){
            uint curr = (i & mask);
            bstr[k--] = curr > 9 ? byte(55 + curr) : byte(48 + curr); // 55 = 65 - 10
            i = i >> 4;
        }
        return string(bstr);
    }
}