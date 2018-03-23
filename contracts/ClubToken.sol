pragma solidity ^0.4.19;

/**
 * ClubToken adheres to ERC827 and by extension ERC20
 * it is a continuously mintable token administered by CloversController
 */
 
import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ClubToken is ERC827Token, Ownable {
    event Burn(address indexed burner, uint256 value);
    event Mint(address indexed to, uint256 amount);
    
    address cloversController;

    modifier onlyOwnerOrController() {
        require(
            msg.sender == cloversController ||
            msg.sender == owner
        );
        _;
    }

    function ClubToken() public {}

    function updateCloversControllerAddress(address _cloversController) public onlyOwner {
        require(_cloversController != 0);
        cloversController = _cloversController;
    }
    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(address _from, uint256 _value) public onlyOwnerOrController {
        require(_value <= balances[_from]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        address burner = _from;
        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        Burn(burner, _value);
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) public onlyOwnerOrController returns (bool) {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }
}
