# Smart Contract Audit & Multi-Chain Architecture Report

## 1. Scope
This audit covers the `MultiSend.sol` smart contract designed for EVM chains (Ethereum, Arbitrum, Base, etc.) and analyzes the architectural approach for Bitcoin MultiSend functionality.

## 2. EVM Smart Contract (`MultiSend.sol`)

### **Summary**
The contract allows batching Native Token (ETH) and ERC20 Token transfers. It leverages OpenZeppelin's `SafeERC20` and `ReentrancyGuard` for security.

### **Detailed Analysis**

#### **Security Features**
*   **Reentrancy Protection**: The `nonReentrant` modifier is applied to both `multiSendNative` and `multiSendToken`. This effectively mitigates reentrancy attacks where a malicious recipient contract could call back into `MultiSend` before the state is updated.
*   **SafeERC20**: Used for all token transfers. This ensures compatibility with non-standard ERC20 tokens (like USDT on mainnet) that do not return a boolean value, protecting against silent failures.
*   **Overflow Protection**: Solidity 0.8.24 is used, which acts as a built-in SafeMath. All arithmetic operations will revert on overflow/underflow.

#### **Gas Optimization**
*   **Unchecked Loops**: Loop increments use `unchecked { ++i; }` to save gas, as the loop counter `i` cannot overflow feasible array lengths (bounded by gas limits and explicit requires).
*   **Batch Limit**: A strict limit of `255` recipients is enforced to prevent accidental OOG (Out Of Gas) errors that could lock funds or waste gas.

#### **Edge Cases & Vulnerabilities Checked**
*   **Fee-On-Transfer Tokens**: The contract checks `balanceAfter - balanceBefore` to ensure the contract actually received the `totalAmount`. This protects against tokens that burn a % on transfer, ensuring the contract doesn't try to send more than it holds (which would revert safely anyway, but this custom error message is clearer).
*   **Griefing with ETH**: `Address.sendValue` is used, which forwards gas. If a recipient is a contract that consumes excessive gas or reverts, the entire batch fails. This is intended behavior for atomicity (either all succeed or all fail).
*   **Refunds**: Any excess ETH sent to the contract (e.g., if `msg.value > totalAmount`) is securely refunded to the sender using a low-level call to prevent DoS via fallback gas limits.

### **Recommendation**
The contract is solid for deployment.
*   **Severity**: Low/Info
*   **Action**: Ensure `totalAmount` passed to `multiSendToken` exactly matches the sum of amounts to avoid calculation errors. The contract enforces this check on-chain.

---

## 3. Bitcoin Architecture

### **Concept**
Bitcoin does not use account-based smart contracts like EVM. "MultiSend" on Bitcoin isn't a contract you deploy; it is a **Transaction Pattern**.
A standard Bitcoin transaction can have multiple **Outputs** (`vout`).

### **Implementation Strategy**
To achieve MultiSend on Bitcoin:
1.  **No On-Chain Code**: You do not deploy anything to the Bitcoin network.
2.  **Client-Side Construction**: The application constructs a single PSBT (Partially Signed Bitcoin Transaction).
3.  **Outputs**: This transaction will contain:
    *   1 Output for Recipient A
    *   1 Output for Recipient B
    *   ...
    *   1 Change Output (back to sender)
4.  **Signing**: The user signs this single transaction via their wallet (e.g., Xverse, Unisat via Reown AppKit).
5.  **Broadcasting**: The signed transaction is broadcasted.

### **Security Considerations**
*   **Dust Limit**: Bitcoin outputs must be above the "dust limit" (usu. 546 satoshis). The client UI must validate this.
*   **Fee Calculation**: Bitcoin fees are based on transaction size (vBytes), not "gas". A transaction with 100 outputs is large. The fee rate (sats/vByte) must be calculated dynamically.

## 4. Conclusion
The EVM `MultiSend.sol` is secure and optimized. The Bitcoin implementation relies on client-side creation of multi-output transactions, which is the native and most efficient way to batch transfers on Bitcoin.
