# Perennial: Decentralized Impact Prediction Markets

![Perennial Logo](https://github.com/Epistetechnician/perennial/blob/main/packages/nextjs/public/Perennial.png)
![Perennial](https://img.shields.io/badge/HydroMaster-1.0.0-green)
![React](https://img.shields.io/badge/React-18.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0.0-blueviolet)
![Solidity](https://img.shields.io/badge/solidity-%3E%3D%200.6.8-lightgrey)
![Javascript](https://shields.io/badge/JavaScript-F7DF1E?logo=JavaScript&logoColor=000&style=flat-square)

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

4.Start the development server:

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

- Market creation and management
- Share trading and settlement
- Reputation tracking
- Carbon credit integration
- Location verification

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
