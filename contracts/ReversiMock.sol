pragma solidity ^0.4.19;

/**
 * The CloversController is upgradeable and contains the logic used by CloversFrontend
 * Both adhere to the CloversFactory interface design
 */
import "./Reversi.sol";
contract ReversiMock {
    function ReversiMock() public {}
    function logGame(bytes28[2] moves) public {
        Reversi.Game memory game = Reversi.playGame(moves);
    }
}