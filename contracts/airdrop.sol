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
    uint256 start_time;
    mapping(address => uint256) claimed;

    event Claimed(uint256 amount, uint256 timestamp);
    
    constructor (address _token_address, bytes32 _merkleRoot, uint256 _total, uint256 _start_time) {
        token_address = _token_address;
        merkleRoot = _merkleRoot;
        total = _total;
        start_time = _start_time;
        require(IERC20(token_address).allowance(msg.sender, address(this)) >= total, 'Not enough allownace');
        IERC20(token_address).safeTransferFrom(msg.sender, address(this), total);
    }

    function check(address claimer, uint256 amount, bytes32[] calldata merkleProof) external view
             returns (bool available) {
        bytes32 leaf = keccak256(abi.encodePacked(claimer, amount));
        available = MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(claimed[msg.sender] == 0, "Already Claimed");
        require(block.timestamp > start_time, "Not Started");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), 'Not Verified');
        claimed[msg.sender] = amount;
        IERC20(token_address).transfer(msg.sender, amount);
        emit Claimed(amount, block.timestamp); 
    }
    
}
