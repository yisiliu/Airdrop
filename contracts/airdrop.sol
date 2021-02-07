// SPDX-License-Identifier: MIT

pragma solidity >= 0.6.0 <= 0.8.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/MerkleProof.sol";    

contract Airdrop {
    using SafeMath for uint256;

    struct Airdrop {
        bytes32 merkleRoot;
        uint64 total;
        uint8 depth;
    }
    
    mapping (bytes32 => Airdrop)
}
