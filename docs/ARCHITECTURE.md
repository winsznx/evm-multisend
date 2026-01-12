# Architecture Overview

## System Architecture

EVM MultiSend is built as a decentralized application (dApp) with a clear separation between the smart contract layer and the frontend application layer.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │    Wagmi     │  │  Reown Kit   │      │
│  │   React UI   │  │   Hooks      │  │   Wallet     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Web3 RPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Blockchain Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MultiSend Smart Contract                │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │ multiSendNative│  │   multiSendToken         │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── Header/           # Navigation and wallet connection
│   ├── MultiSendForm/    # Main form component
│   ├── NetworkSelector/  # Network switching
│   ├── TokenSelector/    # Token selection
│   ├── RecipientList/    # Recipient management
│   ├── BulkImportModal/  # Bulk import UI
│   └── TransactionSummary/ # Transaction preview
│
├── config/               # Configuration
│   ├── index.ts         # Wagmi and network config
│   └── contracts.ts     # Contract addresses and ABI
│
├── utils/               # Utility functions
│   ├── index.ts        # General utilities
│   ├── validation.ts   # Input validation
│   ├── errors.ts       # Error handling
│   ├── storage.ts      # Local storage
│   └── import-export.ts # CSV/JSON handling
│
├── types/              # TypeScript types
│   └── index.ts       # Type definitions
│
└── context/           # React context
    └── AppKitProvider.tsx # Wallet provider
```

---

## Smart Contract Architecture

### MultiSend Contract

The smart contract is designed with security and gas efficiency in mind:

```solidity
MultiSend
├── Dependencies
│   ├── ReentrancyGuard (OpenZeppelin)
│   ├── SafeERC20 (OpenZeppelin)
│   └── Address (OpenZeppelin)
│
├── Functions
│   ├── multiSendNative()
│   │   ├── Validate inputs
│   │   ├── Calculate total
│   │   ├── Distribute ETH
│   │   └── Refund excess
│   │
│   └── multiSendToken()
│       ├── Validate inputs
│       ├── Transfer tokens in
│       ├── Check actual received
│       └── Distribute tokens
│
└── Events
    ├── NativeSent
    └── TokenSent
```

**Key Design Decisions:**

1. **No Admin Functions**: Fully permissionless, no owner privileges
2. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
3. **Gas Optimization**: Batch limit of 255 to prevent out-of-gas errors
4. **Fee-on-Transfer Support**: Checks actual received amounts
5. **Refund Mechanism**: Returns excess ETH to sender

---

## Data Flow

### Native Token Transfer Flow

```
1. User Input
   ↓
2. Frontend Validation
   ├── Address format
   ├── Amount validity
   ├── Duplicate check
   └── Balance check
   ↓
3. Transaction Preparation
   ├── Convert amounts to wei
   ├── Calculate total value
   └── Estimate gas
   ↓
4. User Approval (Wallet)
   ↓
5. Contract Execution
   ├── Validate arrays
   ├── Check msg.value
   ├── Loop through recipients
   ├── Send ETH to each
   └── Refund excess
   ↓
6. Transaction Confirmation
   ↓
7. UI Update
```

### ERC20 Token Transfer Flow

```
1. User Input + Token Selection
   ↓
2. Frontend Validation
   ↓
3. Token Approval (if needed)
   ├── Check current allowance
   ├── Request approval
   └── Wait for confirmation
   ↓
4. Transaction Preparation
   ↓
5. User Approval (Wallet)
   ↓
6. Contract Execution
   ├── Validate arrays
   ├── Transfer tokens in
   ├── Verify received amount
   ├── Loop through recipients
   └── Send tokens to each
   ↓
7. Transaction Confirmation
   ↓
8. UI Update
```

---

## State Management

### Frontend State

The application uses React hooks for state management:

```typescript
// Component State
├── recipients: Recipient[]      // List of recipients
├── selectedToken: Token | null  // Selected ERC20 token
├── isNative: boolean           // Native vs ERC20
├── status: TransactionStatus   // Transaction state
└── error: string | null        // Error message

// Global State (via Wagmi)
├── account: Address            // Connected wallet
├── chainId: number            // Current network
├── balance: bigint            // Wallet balance
└── isConnected: boolean       // Connection status
```

### Local Storage

Persistent data stored in browser:

```typescript
localStorage
├── multisend_recent_recipients  // Recent addresses
├── multisend_recent_tokens     // Recent tokens
├── multisend_preferences       // User settings
└── multisend_last_network      // Last used network
```

---

## Security Architecture

### Defense Layers

```
Layer 1: Frontend Validation
├── Input sanitization
├── Address validation
├── Amount validation
└── Duplicate detection

Layer 2: Transaction Simulation
├── Gas estimation
├── Balance check
└── Allowance check

Layer 3: Smart Contract Validation
├── Array length check
├── Zero address check
├── Amount verification
└── Reentrancy guard

Layer 4: Blockchain Consensus
└── Network validation
```

### Security Features

1. **Input Validation**: All inputs validated before submission
2. **No Private Key Handling**: Uses wallet providers
3. **Transaction Preview**: Users review before signing
4. **Error Handling**: Graceful error messages
5. **Rate Limiting**: Contract enforces max 255 recipients

---

## Network Architecture

### Supported Networks

The application supports multiple EVM-compatible networks:

**Mainnets:**
- Ethereum (1)
- Arbitrum (42161)
- Optimism (10)
- Polygon (137)
- Base (8453)
- BSC (56)
- Avalanche (43114)
- Gnosis (100)
- Celo (42220)

**Testnets:**
- Sepolia (11155111)
- Arbitrum Sepolia (421614)
- Optimism Sepolia (11155420)
- Base Sepolia (84532)
- BSC Testnet (97)
- Avalanche Fuji (43113)
- Celo Alfajores (44787)

### Network Switching

```
User selects network
    ↓
Check if wallet is on correct network
    ↓
    ├── Yes → Continue
    └── No → Request network switch
        ↓
        User approves in wallet
        ↓
        Network switched
```

---

## Performance Considerations

### Gas Optimization

1. **Batch Processing**: Single transaction for multiple transfers
2. **Optimized Loops**: Minimal storage operations
3. **Efficient Data Types**: Uses `uint256` arrays
4. **No Unnecessary Storage**: Stateless contract

### Frontend Optimization

1. **Code Splitting**: Next.js automatic code splitting
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo for expensive components
4. **Debouncing**: Input validation debounced

---

## Deployment Architecture

### Development Environment

```
Local Development
├── Hardhat Network (localhost:8545)
├── Next.js Dev Server (localhost:3000)
└── Hot Reload enabled
```

### Production Environment

```
Production
├── Smart Contract → Blockchain
├── Frontend → Vercel/CDN
└── RPC → Public/Private nodes
```

---

## Error Handling Architecture

```
Error Occurs
    ↓
Error Caught
    ↓
Error Parsed
    ├── User Rejected → Show friendly message
    ├── Insufficient Funds → Show balance error
    ├── Network Error → Show retry option
    └── Unknown → Show generic error
    ↓
Error Logged (console)
    ↓
User Notified (UI)
```

---

## Future Architecture Considerations

### Potential Enhancements

1. **Multi-Signature Support**: Add multi-sig wallet compatibility
2. **Scheduled Transfers**: Time-locked batch transfers
3. **Recurring Payments**: Subscription-like functionality
4. **Cross-Chain**: Bridge integration for cross-chain transfers
5. **Gas Optimization**: Further optimize for large batches
6. **Analytics**: Transaction history and statistics

---

## Technology Stack Summary

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (Type safety)
- Wagmi v2 (Ethereum hooks)
- Viem (Ethereum library)
- Reown AppKit (Wallet connection)

**Smart Contracts:**
- Solidity 0.8.24
- OpenZeppelin Contracts
- Hardhat (Development framework)

**Infrastructure:**
- Vercel (Frontend hosting)
- Public RPC nodes (Blockchain access)
- IPFS (Optional decentralized hosting)

---

This architecture is designed to be:
- **Secure**: Multiple validation layers
- **Scalable**: Supports multiple networks
- **Maintainable**: Clear separation of concerns
- **User-Friendly**: Intuitive UI/UX
- **Gas-Efficient**: Optimized for cost savings
