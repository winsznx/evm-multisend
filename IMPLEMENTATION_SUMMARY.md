# EVM MultiSend dApp Implementation Plan

## 1. Project Setup & Architecture
- [x] Initialize Next.js 14 project with TypeScript
- [x] Configure CSS Modules with a strict black & white design system
- [x] Install and configure Reown AppKit and Wagmi v2
- [x] Set up responsive layout and global styles

## 2. Core Components
- [x] **Header**: Persistent navigation with Reown `ConnectButton`
- [x] **NetworkSelector**: Grid-based selector for EVM networks (Mainnet/Testnet toggle)
- [x] **TokenSelector**:
    - [x] Native token support (ETH, MATIC, BNB, etc.)
    - [x] Custom ERC20 token import via address
    - [x] Balance display
- [x] **RecipientList**:
    - [x] Dynamic list of recipients (Address, Amount)
    - [x] Validation for addresses and amounts
    - [x] Add/Remove/Clear functionality
- [x] **BulkImportModal**:
    - [x] Text area for pasting CSV or line-separated data
    - [x] Parsing and validation logic
- [x] **TransactionSummary**:
    - [x] Real-time summary of total amount and recipient count
    - [x] Validation against user balance
    - [x] Status indicators (Prepared, Pending, Success, Error)
- [x] **MultiSendForm**:
    - [x] Orchestrator component managing state and transaction logic
    - [x] Integration of all sub-components

## 3. Implementation Details
- **Wagmi v2 Integration**: Downgraded from v3 to v2 to ensure full compatibility with the current Reown AppKit adapter.
- **Styling**: Used CSS variables for theme consistency. Primary black (`#000`), white (`#fff`), and gray scale.
- **Icons**: Exclusively used `lucide-react` for a consistent, premium feel.
- **Type Safety**: strict TypeScript configuration with custom types for `Recipient`, `Token`, etc.

## 4. Next Steps
- **Smart Contract**: Deploy a MultiSend smart contract to support batched ERC20 transfers (currently only Native token batches are simulated via loop).
- **Optimization**: Implement `useMemo` and `useCallback` for complex list rendering if recipient count grows large (+100).
- **Testing**: Add unit tests for the CSV parser and validation logic.

## 5. How to Run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`
