# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite for MultiSend smart contract
- Unit tests for utility functions
- API documentation covering all functions and error handling
- Detailed deployment guide with troubleshooting section
- Enhanced security policy with disclosure process
- Helpful npm scripts for testing and deployment
- Mock contracts for testing (MockERC20, MaliciousReceiver)
- Stricter TypeScript configuration for better type safety
- CHANGELOG.md to track project changes

### Changed
- Improved SECURITY.md with detailed vulnerability reporting process
- Enhanced package.json with additional development scripts

### Security
- Added reentrancy attack test cases
- Documented security best practices for users and developers
- Enhanced input validation documentation

## [0.1.0] - 2026-01-12

### Added
- Initial release of EVM MultiSend
- MultiSend smart contract for batch transfers
- Support for native tokens (ETH, BNB, MATIC, etc.)
- Support for ERC20 tokens
- Next.js frontend application
- Reown AppKit wallet integration
- Multi-network support (10+ networks)
- Bulk import functionality
- Transaction summary and validation
- Responsive UI design
- Smart contract deployment scripts
- Basic documentation (README, CONTRIBUTING, CODE_OF_CONDUCT)
- MIT License

### Security
- ReentrancyGuard protection
- SafeERC20 for token transfers
- Input validation on contract and frontend
- Maximum 255 recipients per transaction
- Fee-on-transfer token handling

---

## Release Notes

### Version 0.1.0 - Initial Release

This is the first public release of EVM MultiSend, a decentralized application for sending cryptocurrency to multiple recipients in a single transaction.

**Key Features:**
- Batch send native tokens and ERC20 tokens
- Support for 10+ blockchain networks
- Gas-efficient smart contract
- User-friendly interface
- Wallet integration via Reown AppKit

**Supported Networks:**
- Ethereum, Arbitrum, Optimism, Polygon, Base, BSC, Avalanche, Gnosis, Celo
- Testnets: Sepolia, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia, BSC Testnet, Avalanche Fuji, Celo Alfajores

**Contract Addresses:**
- Base Mainnet: `0xA574EC6E2B51B58eb339B7D5107598474BA14eC5`
- Base Sepolia: `0x656bc95b9E2f713184129629C1c3dFbeB67aCc59`

**Known Limitations:**
- Maximum 255 recipients per transaction
- No batch approval for multiple tokens
- Bitcoin support is architectural only (not yet implemented)

**Security Notice:**
This contract has not undergone a professional security audit. Use at your own risk. Always test on testnet before using on mainnet.

---

## Migration Guides

### Migrating from 0.0.x to 0.1.0

Not applicable - this is the initial release.

---

## Deprecation Notices

None at this time.

---

## Contributors

Thank you to all contributors who helped make this release possible!

- Initial development and architecture
- Smart contract implementation
- Frontend development
- Documentation
- Testing

---

## Links

- [GitHub Repository](https://github.com/[owner]/evm-multisend)
- [Documentation](./README.md)
- [Security Policy](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [License](./LICENSE)

---

**Note:** This changelog is maintained manually. For a complete list of changes, see the [commit history](https://github.com/[owner]/evm-multisend/commits).
