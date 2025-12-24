// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title EVM MultiSend
 * @author EVM MultiSend Team
 * @notice Allows sending Native Tokens (ETH, MATIC, BNB) and ERC20 tokens to multiple addresses in a single transaction.
 * @dev Security Note: This contract generally assumes standard ERC20 behavior. 
 * Be cautious with Fee-On-Transfer tokens as values might change during transfer.
 */
contract MultiSend is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // Events to track transactions
    event NativeSent(address indexed sender, uint256 totalValue, uint256 recipientCount);
    event TokenSent(address indexed sender, address indexed token, uint256 totalValue, uint256 recipientCount);

    /**
     * @notice Send Native Coin (ETH/BNB/MATIC) to multiple recipients
     * @dev Uses OpenZeppelin's Address.sendValue for safety against reentrancy via fallback
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send to each recipient (in wei)
     */
    function multiSendNative(address payable[] calldata recipients, uint256[] calldata amounts) external payable nonReentrant {
        require(recipients.length == amounts.length, "MultiSend: Length mismatch");
        require(recipients.length > 0, "MultiSend: No recipients");
        // Limit batch size to prevent out-of-gas errors
        require(recipients.length <= 255, "MultiSend: Too many recipients (max 255)");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; ) {
            totalAmount += amounts[i];
            unchecked { ++i; }
        }

        require(msg.value >= totalAmount, "MultiSend: Insufficient value sent");

        // Distribute funds
        for (uint256 i = 0; i < recipients.length; ) {
            // Address.sendValue prevents reentrancy issues by limiting gas, 
            // but we use OpenZeppelin implementation which forwards gas but checks success.
            // ReentrancyGuard is the primary protection here.
            recipients[i].sendValue(amounts[i]);
            unchecked { ++i; }
        }

        // Refund excess native currency if any
        uint256 remaining = address(this).balance;
        if (remaining > 0) {
            // Using low-level call for refund to avoid griefing
            (bool success, ) = msg.sender.call{value: remaining}("");
            require(success, "MultiSend: Refund failed");
        }

        emit NativeSent(msg.sender, totalAmount, recipients.length);
    }

    /**
     * @notice Send ERC20 Token to multiple recipients
     * @dev Requires user to approve this contract for the totalAmount first
     * @param token Address of the ERC20 token
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send to each recipient
     * @param totalAmount Total amount to be sent. Must equal sum of amounts.
     */
    function multiSendToken(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount
    ) external nonReentrant {
        require(recipients.length == amounts.length, "MultiSend: Length mismatch");
        require(recipients.length > 0, "MultiSend: No recipients");
        require(recipients.length <= 255, "MultiSend: Too many recipients (max 255)");
        require(totalAmount > 0, "MultiSend: Zero total amount");

        // Verify total amount matches sum of amounts
        uint256 calculatedTotal = 0;
        for (uint256 i = 0; i < amounts.length; ) {
            calculatedTotal += amounts[i];
            unchecked { ++i; }
        }
        require(calculatedTotal == totalAmount, "MultiSend: Total amount mismatch");

        // Transfer funds from user to contract
        // This is safer/efficient than looping transferFrom
        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        uint256 balanceAfter = token.balanceOf(address(this));
        
        // Check actual received amount to handle fee-on-transfer tokens
        uint256 received = balanceAfter - balanceBefore;
        require(received >= totalAmount, "MultiSend: Insufficient tokens received (fee-on-transfer?)");

        // Distribute tokens
        for (uint256 i = 0; i < recipients.length; ) {
            token.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        emit TokenSent(msg.sender, address(token), totalAmount, recipients.length);
    }
}
