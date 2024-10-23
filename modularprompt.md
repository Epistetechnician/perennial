## Project Overview
Perennial is a Web3 dapp that revolutionizes environmental impact measurement and verification using blockchain technology. It combines prediction markets, dynamic NFTs, and reputation-based governance to create a transparent ecosystem for environmental projects.

## Core Functionalities
1. Prediction Markets for Public Goods
2. Dynamic Impact NFTs
3. Decentralized Verification System
4. Reputation-Based Staking
5. AI-Enhanced Analytics
6. Carbon Credit Quality Assessment
7. On-ground Verification using Astral
8. Integration with Toucan's tokenized carbon markets

## Docs
For detailed documentation, refer to the following:
- Project details: 

## Current File Structure
- /src
  - /components
  - /pages
  - /services
- /contracts
- /scripts
- /test

## Additional Requirements

1. Project Setup
- Use Scaffold-ETH 2 as the base framework
- All new components should go in /packages/nextjs/components and be named like example-component.tsx
- All new pages go in /packages/nextjs/app
- Use the Next.js 14 app router
- All data fetching should be done in a server component and pass the data down as props
- Client components (useState, hooks, etc) require that 'use client' is set at the top of the file

2. Smart Contract Development:
- Develop smart contracts in Solidity 0.8.20 or 0.8.19
- Use Hardhat for contract compilation, testing, and deployment
- Implement contracts for prediction markets, NFT minting, and carbon credit tracking

3. Frontend Development:
- Use React with TypeScript for frontend development
- Implement components for prediction market dashboard, carbon retirement interface, and impact visualization
- Utilize Tailwind CSS for styling

4. Blockchain Integration:
- Use ethers.js or viem for blockchain interactions
- Implement wallet connection using ConnectKit or similar libraries
- Deploy contracts to Sepolia testnet for testing

5. External Integrations:
- Integrate with Toucan Protocol for tokenized carbon credits
- Use Astral for location verification
- Implement AI-enhanced analytics for impact prediction

6. Environment Variables:
- Store all sensitive information (API keys, contract addresses) in environment variables
- Use a `.env.local` file for local development and ensure it's listed in `.gitignore`
- For production, set environment variables in the deployment platform (e.g., Vercel)

7. Error Handling and Logging:
- Implement comprehensive error handling for all blockchain interactions and API calls
- Log errors on the server side for debugging
- Display user-friendly error messages in the UI

8. Testing:
- Write unit tests for smart contracts using Hardhat
- Implement frontend tests using React Testing Library

9. Documentation:
- Maintain clear and up-to-date documentation for the project
- Include setup instructions, architecture overview, and API documentation

10. Deployment:
- Deploy the frontend to Vercel or a similar platform
- Deploy smart contracts to the Sepolia testnet
