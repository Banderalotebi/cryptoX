// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract ServerWallet {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function withdrawETH(address payable to, uint256 amount) external {
        require(msg.sender == owner, "Not authorized");
        require(address(this).balance >= amount, "Insufficient ETH");
        to.transfer(amount);
    }

    function withdrawToken(address token, address to, uint256 amount) external {
        require(msg.sender == owner, "Not authorized");
        require(IERC20(token).transfer(to, amount), "Token transfer failed");
    }

    function changeOwner(address newOwner) external {
        require(msg.sender == owner, "Not authorized");
        owner = newOwner;
    }
}
