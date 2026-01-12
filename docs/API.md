# API Documentation

## Smart Contract API

### MultiSend Contract

The MultiSend contract provides two main functions for batch transfers:

#### multiSendNative

Send native cryptocurrency (ETH, BNB, MATIC, etc.) to multiple recipients in a single transaction.

**Function Signature:**
```solidity
function multiSendNative(
    address payable[] calldata recipients,
    uint256[] calldata amounts
) external payable nonReentrant
```

**Parameters:**
- `recipients`: Array of recipient addresses (max 255)
- `amounts`: Array of amounts to send (in wei)

**Requirements:**
- Arrays must have the same length
- At least one recipient required
- Maximum 255 recipients per transaction
- `msg.value` must be >= sum of all amounts
- No recipient can be the zero address

**Events:**
```solidity
event NativeSent(address indexed sender, uint256 totalValue, uint256 recipientCount);
```

**Errors:**
- `LengthMismatch()`: Arrays have different lengths
- `NoRecipients()`: Empty recipient array
- `TooManyRecipients()`: More than 255 recipients
- `InsufficientValue()`: Insufficient ETH sent
- `InvalidRecipient()`: Zero address in recipients
- `RefundFailed()`: Refund of excess ETH failed

**Example Usage:**
```javascript
const recipients = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  '0xA574EC6E2B51B58eb339B7D5107598474BA14eC5'
];
const amounts = [
  ethers.parseEther('1.0'),
  ethers.parseEther('2.0')
];
const totalValue = ethers.parseEther('3.0');

await multiSend.multiSendNative(recipients, amounts, { value: totalValue });
```

---

#### multiSendToken

Send ERC20 tokens to multiple recipients in a single transaction.

**Function Signature:**
```solidity
function multiSendToken(
    IERC20 token,
    address[] calldata recipients,
    uint256[] calldata amounts,
    uint256 totalAmount
) external nonReentrant
```

**Parameters:**
- `token`: ERC20 token contract address
- `recipients`: Array of recipient addresses (max 255)
- `amounts`: Array of amounts to send (in token's smallest unit)
- `totalAmount`: Total amount to transfer (must equal sum of amounts)

**Requirements:**
- Arrays must have the same length
- At least one recipient required
- Maximum 255 recipients per transaction
- `totalAmount` must be > 0
- `totalAmount` must equal sum of all amounts
- Caller must have approved contract for `totalAmount`
- No recipient can be the zero address

**Events:**
```solidity
event TokenSent(
    address indexed sender,
    address indexed token,
    uint256 totalValue,
    uint256 recipientCount
);
```

**Errors:**
- `LengthMismatch()`: Arrays have different lengths
- `NoRecipients()`: Empty recipient array
- `TooManyRecipients()`: More than 255 recipients
- `ZeroTotalAmount()`: Total amount is zero
- `TotalAmountMismatch()`: Calculated total doesn't match provided total
- `InvalidRecipient()`: Zero address in recipients
- `InsufficientTokensReceived()`: Fee-on-transfer token detected

**Example Usage:**
```javascript
const tokenAddress = '0x...'; // ERC20 token address
const recipients = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  '0xA574EC6E2B51B58eb339B7D5107598474BA14eC5'
];
const amounts = [
  ethers.parseUnits('100', 18),
  ethers.parseUnits('200', 18)
];
const totalAmount = ethers.parseUnits('300', 18);

// First approve the contract
await token.approve(multiSendAddress, totalAmount);

// Then execute the batch transfer
await multiSend.multiSendToken(tokenAddress, recipients, amounts, totalAmount);
```

---

## Frontend API

### Utility Functions

#### Address Validation

```typescript
isValidAddress(address: string): boolean
```
Validates an Ethereum address format.

**Example:**
```typescript
const isValid = isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
// Returns: true
```

---

#### Amount Validation

```typescript
isValidAmount(amount: string): boolean
```
Validates that an amount is a positive number.

**Example:**
```typescript
const isValid = isValidAmount('1.5');
// Returns: true
```

---

#### Parse Recipients

```typescript
parseRecipients(text: string): ParsedRecipient[]
```
Parses bulk import text into recipient objects. Supports multiple formats:
- Comma-separated: `address,amount`
- Space-separated: `address amount`
- Semicolon-separated: `address;amount`
- Equals-separated: `address=amount`

**Example:**
```typescript
const text = `
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0,1.5
0xA574EC6E2B51B58eb339B7D5107598474BA14eC5,2.0
`;
const recipients = parseRecipients(text);
// Returns: [
//   { address: '0x742d35...', amount: '1.5' },
//   { address: '0xA574EC...', amount: '2.0' }
// ]
```

---

#### Find Duplicates

```typescript
findDuplicateAddresses(recipients: Recipient[]): string[]
```
Finds duplicate addresses in recipient list (case-insensitive).

**Example:**
```typescript
const duplicates = findDuplicateAddresses(recipients);
// Returns: ['0x742d35cc6634c0532925a3b844bc9e7595f0beb0']
```

---

#### Format Display

```typescript
formatAddress(address: string, chars?: number): string
formatNumber(value: string | number, decimals?: number): string
formatBalance(balance: string, symbol: string, decimals?: number): string
```

Format values for display.

**Examples:**
```typescript
formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
// Returns: '0x742d35...f0bEb0'

formatNumber(1234.5678, 2);
// Returns: '1,234.57'

formatBalance('1.5', 'ETH');
// Returns: '1.5 ETH'
```

---

### Network Configuration

#### Supported Networks

The application supports the following networks:

**Mainnets:**
- Ethereum (Chain ID: 1)
- Arbitrum One (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Polygon (Chain ID: 137)
- Base (Chain ID: 8453)
- BNB Smart Chain (Chain ID: 56)
- Avalanche (Chain ID: 43114)
- Gnosis (Chain ID: 100)
- Celo (Chain ID: 42220)
- Bitcoin

**Testnets:**
- Sepolia (Chain ID: 11155111)
- Arbitrum Sepolia (Chain ID: 421614)
- Optimism Sepolia (Chain ID: 11155420)
- Base Sepolia (Chain ID: 84532)
- BSC Testnet (Chain ID: 97)
- Avalanche Fuji (Chain ID: 43113)
- Celo Alfajores (Chain ID: 44787)
- Bitcoin Testnet

---

### Contract Addresses

**Base Mainnet (8453):**
```
0xA574EC6E2B51B58eb339B7D5107598474BA14eC5
```

**Base Sepolia (84532):**
```
0x656bc95b9E2f713184129629C1c3dFbeB67aCc59
```

---

## Error Handling

### Common Errors

#### Wallet Connection Errors
- **User Rejected**: User declined the connection request
- **No Provider**: No wallet extension detected
- **Wrong Network**: Connected to unsupported network

#### Transaction Errors
- **Insufficient Balance**: User doesn't have enough tokens/ETH
- **Insufficient Allowance**: Token approval needed
- **Gas Estimation Failed**: Transaction would fail
- **User Rejected**: User declined the transaction

### Error Recovery

```typescript
try {
  await multiSend.multiSendNative(recipients, amounts, { value: totalValue });
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User rejected transaction
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    // Insufficient balance
  } else {
    // Other error
  }
}
```

---

## Rate Limits

- Maximum 255 recipients per transaction
- No rate limiting on contract calls
- Gas limits apply per network

---

## Best Practices

1. **Always validate inputs** before submitting transactions
2. **Check for duplicates** to avoid sending to the same address twice
3. **Verify total amounts** match expected values
4. **Use appropriate gas limits** for large batches
5. **Test on testnet** before mainnet deployment
6. **Keep private keys secure** - never commit to version control
7. **Verify contract addresses** before interacting
8. **Monitor transaction status** until confirmation
