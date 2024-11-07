# Perennial: Decentralized Impact Prediction Markets

![Perennial Logo](https://github.com/Epistetechnician/perennial/blob/main/packages/nextjs/public/favicon.png?raw=true)

## Overview

Perennial is a revolutionary Web3 platform that combines prediction markets with environmental impact measurement. By leveraging blockchain technology, AI analytics, and decentralized verification systems, Perennial creates transparent and efficient markets for public goods and environmental projects.

## Key Features

- **Prediction Markets for Public Goods**
  - Create and participate in markets for environmental outcomes
  - Stake ETH on predictions with dynamic pricing
  - Reputation-based participation system

- **Hyper-Local Markets**
  - Location-verified environmental impact tracking
  - Integration with Astral Protocol for geospatial verification
  - Local community engagement and verification

- **AI-Enhanced Analytics**
  - Real-time market probability calculations
  - Trend analysis and impact predictions
  - Carbon credit quality assessment

- **Blockchain Integration**
  - Built on Ethereum (Sepolia Testnet)
  - Integration with Toucan Protocol for carbon credits
  - Allo Protocol integration for fund allocation

- **Ethereum Attestation Service (EAS) Integration**
  - On-chain verification of market outcomes
  - Immutable record of market creation and resolution
  - Transparent reputation tracking
  - Schema-based market attestations

## Technology Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - wagmi v2 for Web3 interactions
  - RainbowKit for wallet connections

- **Smart Contracts**
  - Solidity 0.8.20
  - Hardhat development environment
  - OpenZeppelin contracts

- **External Integrations**
  - Ethereum Attestation Service (EAS)
  - Toucan Protocol (Carbon Credits)
  - Astral Protocol (Location Verification)
  - Allo Protocol (Fund Distribution)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/perennial.git
cd perennial
```

2.Install dependencies:

```bash
yarn install
```

3.Set up environment variables:

```bash
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

4.Deploy contracts
```bash
cd hardhat
yarn deploy
```

5.Start the development server:

```bash
yarn dev
```

## Project Structure

perennial/
├── packages/
│ ├── nextjs/
│ │ ├── app/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── services/
│ └── hardhat/
│ ├── contracts/
│ ├── deploy/
│ └── test/

## Smart Contracts

Our core smart contracts handle:

- Market creation and management with EAS attestations
- Share trading and settlement
- Reputation tracking through verifiable attestations
- Carbon credit integration
- Location verification

## Architecture

### EAS Integration
The platform uses EAS for:
1. **Market Creation Attestations**
   - Records market parameters
   - Verifies creator reputation
   - Stores location data for hyper-local markets

2. **Market Resolution Attestations**
   - Documents final outcomes
   - Records stake distributions
   - Maintains resolution proofs

3. **Reputation Attestations**
   - Tracks user participation
   - Records successful predictions
   - Maintains creator reliability scores

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Run frontend tests

```bash
Run frontend tests
cd packages/nextjs
```

### Run contract tests

```bash
yarn test
Run contract tests
cd packages/hardhat
yarn test
```

## Deployment

The application is deployed on:

- Frontend: Vercel
- Smart Contracts: Sepolia Testnet

## License

MIT License - see LICENSE.md for details

## Contact

Project Link: [https://github.com/yourusername/perennial](https://github.com/yourusername/perennial)

## Acknowledgments

- Scaffold-ETH 2 for the initial framework
- Toucan Protocol for carbon credit infrastructure
- Astral Protocol for location verification
- Allo Protocol for fund distribution
