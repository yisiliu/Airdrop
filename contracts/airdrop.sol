// SPDX-License-Identifier: MIT

pragma solidity >= 0.6.0 <= 0.8.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/MerkleProof.sol";    

contract Airdrop {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Info {
        // 160+48+48 = 256
        address token_address;
        uint48 start_time;
        uint48 end_time;
    }

    address creator;
    bytes32 merkleRoot;
    uint256 total;
    Info info;
    mapping(address => uint256) claimed;

    event Claimed(uint256 amount, uint256 timestamp);

    modifier creatorOnly {
        require(msg.sender == creator, "Not Authorized");
        _;
    }
    
    constructor (address _token_address, bytes32 _merkleRoot, uint256 _total, uint256 _start_time, uint256 _end_time) {
        require(validRange(48, _start_time), "Invalid Start Time");
        require(validRange(48, _end_time), "Invalid End Time");

        merkleRoot = _merkleRoot;
        total = _total;
        info.start_time = uint48(_start_time);
        info.end_time = uint48(_end_time);
        info.token_address = _token_address;
        creator = msg.sender;
    }

    function check(address claimer, uint256 amount, bytes32[] calldata merkleProof) external view
             returns (bool available) {
        bytes32 leaf = keccak256(abi.encodePacked(claimer, amount));
        available = MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(claimed[msg.sender] == 0, "Already Claimed");
        require(block.timestamp > info.start_time, "Not Started");
        require(block.timestamp < info.end_time, "Expired");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), 'Not Verified');
        claimed[msg.sender] = amount;
        IERC20(info.token_address).transfer(msg.sender, amount * (10 ** ERC20(info.token_address).decimals()));
        emit Claimed(amount, block.timestamp); 
    }
    
    function validRange (uint16 size, uint256 data) internal pure returns (bool ifValid) {
        assembly {
            ifValid := or(eq(size, 256), gt(shl(size, 1), data))
        }
    }
}
