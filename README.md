# EVM MultiSend

## Project Overview

EVM MultiSend is a sophisticated decentralized application designed to streamline the process of sending assets to multiple recipients in a single transaction. By batching transfers, users can significantly reduce gas costs and administrative time compared to executing individual transactions. The application supports both Native Tokens (such as ETH, BNB, MATIC) and ERC20 tokens across a wide range of Ethereum Virtual Machine networks, as well as providing architectural support for Bitcoin transactions.

The interface is built with a focus on usability, reliability, and visual clarity, adhering to a strict professional design system. It integrates seamlessly with modern Web3 wallets using the Reown AppKit, ensuring a secure and familiar connection process for users.

## Technical Architecture

The project is architected as a modern full stack decentralized application, separating concerns between the reactive frontend and the on chain logic.

### Frontend Application
The user interface is developed using Next.js 14, leveraging TypeScript for type safety and code reliability. The state management and blockchain interactions are powered by Wagmi v2 and Viem. The Reown AppKit is utilized for wallet connectivity, providing support for hundreds of wallets via the WalletConnect protocol. The application is fully responsive and optimized for performance, utilizing server side rendering where appropriate.

### Smart Contracts
For EVM networks, the logic is encapsulated in the MultiSend.sol smart contract. This contract is written in Solidity 0.8.24 and utilizes industry standard libraries from OpenZeppelin, including SafeERC20 for secure token transfers and ReentrancyGuard for protection against reentrancy attacks. The contract is designed to be gas efficient and secure, enforcing batch limits and proper input validation.

For the Bitcoin network, the system follows a different architectural pattern due to the nature of the UTXO model. Instead of an on chain smart contract, the application is designed to construct Partially Signed Bitcoin Transactions (PSBT) client side. This allows for native multi input, multi output transactions without the need for a deployed contract.

## Features

### Multi Network Support
The application supports a comprehensive list of mainnet and testnet networks. Users can instantly toggle between production environments (Ethereum, Arbitrum, Optimism, Polymer, Base, BSC, Avalanche, Gnosis, Celo, Bitcoin) and their respective testnets (Sepolia, Amoy, Fuji, Alfajores).

### Asset Management
Users have complete flexibility in selecting which assets to distribute. The system automatically detects the native currency of the connected chain. Additionally, users can import any ERC20 token by simply pasting its contract address. The application verifies the contract and retrieves metadata such as the token name, symbol, and decimals automatically.

### Recipient Management
The interface provides robust tools for managing recipient lists. Users can add recipients manually one by one, specifying unique amounts for each. For larger distributions, the Bulk Import feature allows users to paste data from external sources (like CSV files or spreadsheets). The system parses this input, validates addresses and amounts, and reports any errors before processing.

### Transaction Safety
Before any transaction is submitted, the application performs a series of checks. It validates the user's balance against the total required amount, checks for duplicate addresses, and ensures all inputs are strictly formatted. The user is presented with a clear summary of the total cost and recipient count, preventing accidental transfers.

## Getting Started

### Prerequisites
To run this project locally, you must have Node.js (version 18 or higher) and npm installed on your machine. You will also need a valid Project ID from Reown (formerly WalletConnect) to enable wallet connections.

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install the dependencies by running the command `npm install`.

### Configuration

Create a file named `.env.local` in the root directory of the project. You must define the environment variable `NEXT_PUBLIC_PROJECT_ID` with your unique identifier from the Reown Dashboard. You can use the provided `.env.example` file as a reference.

### Running the Application

Start the development server by executing `npm run dev`. The application will be accessible at `http://localhost:3000` in your web browser.

## Deployment

### Frontend Deployment
The application is optimized for deployment on Vercel. Connect your GitHub repository to Vercel, and the platform will automatically detect the Next.js framework. Ensure you add the `NEXT_PUBLIC_PROJECT_ID` environment variable in the Vercel project settings before deployment.

### Smart Contract Deployment
The repository includes a Hardhat configuration for deploying the MultiSend smart contract. To deploy to a live network, configure your network settings and private key in `hardhat.config.js` (ensure this file is never shared publicly), and run the deployment script provided in the documentation or Hardhat guide.

## Security

Security is a primary focus of this application. The smart contracts have been implemented following best practices and include safeguards against common vulnerabilities. The frontend sanitizes all inputs and relies on established libraries for cryptographic operations. Access to the `.env` file containing sensitive keys is restricted via `.gitignore`.

## Contract Addresses

**Base Mainnet**
`0xA574EC6E2B51B58eb339B7D5107598474BA14eC5`

**Base Sepolia**
`0x656bc95b9E2f713184129629C1c3dFbeB67aCc59`

## Known Limitations

- **Recipient Limit**: Transactions are currently limited to a maximum of 255 recipients to ensure gas limits are not exceeded.
- **Batch Approval**: Currently, separate approvals are required for different tokens; batch approval is not yet supported.
- **Bitcoin Support**: While architecturally designed, the UI implementation for Bitcoin PSBT construction is currently in development.

## Documentation & Resources

Comprehensive documentation is available in the `docs/` directory:

- [System Architecture](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [API Reference](./docs/API.md)
- [Performance Optimization](./docs/PERFORMANCE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

Project standards and logs:

- [Security Policy](./SECURITY.md)
- [Audit Report](./AUDIT_REPORT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

