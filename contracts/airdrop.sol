// SPDX-License-Identifier: MIT

pragma solidity >= 0.6.0 <= 0.8.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/MerkleProof.sol";    

contract Airdrop {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address token_address;
    bytes32 merkleRoot;
    uint256 total;
    
    constructor (address _token_address, bytes32 _merkleRoot, uint256 _total) {
        token_address = _token_address;
        merkleRoot = _merkleRoot;
        total = _total;
        require(IERC20(token_address).allowance(msg.sender, address(this)) >= total, 'Not enough allownace');
        IERC20(token_address).safeTransferFrom(msg.sender, address(this), total);
    }

    function check (address claimer, uint256 amount, bytes32[] calldata merkleProof) external view
                    returns (bool available) {
        bytes32 leaf = keccak256(abi.encodePacked(claimer, amount));
        available = MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
}
