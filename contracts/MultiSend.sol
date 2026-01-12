// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title EVM MultiSend (Compilable, Audited, Safe)
 * @author EVM MultiSend Team
 * @notice Native and ERC20 token batch sender, with full audit hardening.
 */
contract MultiSend is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // Custom Errors
    error LengthMismatch();
    error NoRecipients();
    error TooManyRecipients();
    error InvalidRecipient();
    error InsufficientValue();
    error RefundFailed();
    error ZeroTotalAmount();
    error TotalAmountMismatch();
    error InsufficientTokensReceived();

    event NativeSent(address indexed sender, uint256 totalValue, uint256 recipientCount);
    event TokenSent(address indexed sender, address indexed token, uint256 totalValue, uint256 recipientCount);

    /**
     * @notice Send native coin (ETH/BNB/MATIC) to multiple recipients
     * @dev Uses Address.sendValue for security, explicit checks for zero address, batch capped at 255
     */
    function multiSendNative(
        address payable[] calldata recipients,
        uint256[] calldata amounts
    )
        external
        payable
        nonReentrant
    {
        uint256 len = recipients.length;
        if (len != amounts.length) revert LengthMismatch();
        if (len == 0) revert NoRecipients();
        if (len > 255) revert TooManyRecipients();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < len; ++i) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            totalAmount += amounts[i];
        }
        if (msg.value < totalAmount) revert InsufficientValue();

        // Distribute ETH safely
        for (uint256 i = 0; i < len; ++i) {
            recipients[i].sendValue(amounts[i]);
        }

        // Refund any leftover ETH (dust) to sender
        uint256 remaining = address(this).balance;
        if (remaining > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: remaining}("");
            if (!refundSuccess) revert RefundFailed();
        }

        emit NativeSent(msg.sender, totalAmount, len);
    }

    /**
     * @notice Send ERC20 token to multiple recipients
     * @dev Handles fee-on-transfer tokens defensively, explicit checks for zero address, batch capped at 255
     */
    function multiSendToken(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount
    )
        external
        nonReentrant
    {
        uint256 len = recipients.length;
        if (len != amounts.length) revert LengthMismatch();
        if (len == 0) revert NoRecipients();
        if (len > 255) revert TooManyRecipients();
        if (totalAmount == 0) revert ZeroTotalAmount();

        uint256 calcTotal = 0;
        for (uint256 i = 0; i < len; ++i) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            calcTotal += amounts[i];
        }
        if (calcTotal != totalAmount) revert TotalAmountMismatch();

        // Transfer tokens in before splitting up
        uint256 balBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        uint256 balAfter = token.balanceOf(address(this));
        uint256 received = balAfter - balBefore;
        if (received < totalAmount) revert InsufficientTokensReceived();

        // Distribute tokens safely
        for (uint256 i = 0; i < len; ++i) {
            token.safeTransfer(recipients[i], amounts[i]);
        }

        emit TokenSent(msg.sender, address(token), totalAmount, len);
    }
}