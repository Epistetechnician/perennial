# Project Overview
Perennial is an advanced Web3 dapp that creates prediction markets for public goods and environmental projects. It leverages blockchain technology to provide transparent and decentralized impact measurement and verification, with a focus on integrating cutting-edge protocols and AI-enhanced analytics.

## Core Functionalities
1. Prediction Markets for Public Goods
2. Market Creation and Management
3. Buying and Selling Shares
4. Reputation-Based Staking
5. Hyper-Local Market Support
6. AI-Enhanced Analytics (implemented)
7. Integration with Toucan's tokenized carbon markets (in progress)
8. Integration with Allo Protocol for fund allocation (implemented)
9. Integration with Astral for location verification (in progress)

## Current File Structure
- /packages
  - /nextjs
    - /app
      - perrenialpredictor.tsx (main component)
    - /components
      - AstralMap.tsx
    - /contracts
    - /generated
    - /hooks
      - scaffold-eth
  - /hardhat
    - /contracts
      - perennialprediction.sol
    - /deploy
    - /test

## Smart Contracts
The main smart contract `perennialprediction.sol` has been expanded to include:
- Creating markets with hyper-local support
- Buying and selling shares with dynamic pricing
- Resolving markets with multi-factor outcomes
- Managing market creators with reputation system
- Integration with Allo Protocol for fund allocation

## Frontend Components
The `PerennialPredictor` component has been significantly enhanced:
- Displays markets with interactive charts
- Creates new markets with advanced parameters
- Interacts with the smart contract for all core functionalities
- Implements AI-enhanced analytics for market trends
- Integrates with Allo Protocol for fund management
- Incorporates AstralMap for hyper-local market visualization

## Blockchain Integration
- Utilizing wagmi hooks for efficient blockchain interactions
- Implemented custom hooks for complex contract interactions
- Enhanced error handling and transaction management

## AI Integration
- Implemented AI-enhanced analytics for market trend prediction
- Utilizing machine learning models for impact assessment

## Allo Protocol Integration
- Successfully integrated Allo Protocol for fund allocation
- Created pools for each prediction market
- Implemented fund distribution based on market outcomes

## Next Steps
1. Complete Astral integration for precise location verification
2. Finalize Toucan Protocol integration for carbon credit markets
3. Enhance AI models for more accurate impact predictions
4. Implement comprehensive frontend and smart contract tests
5. Optimize gas usage in smart contracts
6. Develop a governance module for community-driven decision making
7. Implement a more sophisticated reputation system
8. Prepare for mainnet deployment and security audits

## Additional Requirements

1. Smart Contract Optimization
   - Implement gas optimization techniques
   - Conduct thorough security audits

2. Frontend Enhancements
   - Improve UX/UI for better user engagement
   - Implement more interactive data visualizations

3. Scalability Considerations
   - Explore Layer 2 solutions for reduced transaction costs
   - Implement state channel or optimistic rollup techniques

4. Governance and DAO Integration
   - Develop a governance token for community participation
   - Implement on-chain voting mechanisms

5. Interoperability
   - Explore cross-chain functionalities for wider reach
   - Implement bridges to other popular blockchain networks

6. Privacy Features
   - Investigate zero-knowledge proofs for enhanced privacy
   - Implement optional privacy features for sensitive markets

7. Mobile Responsiveness
   - Ensure full functionality on mobile devices
   - Consider developing a mobile app for better user experience

8. Regulatory Compliance
   - Implement KYC/AML procedures where necessary
   - Ensure compliance with relevant prediction market regulations

9. Data Analytics and Reporting
   - Develop comprehensive analytics dashboard
   - Implement automated reporting for market performance

10. Community Building
    - Develop incentive structures for early adopters and power users
    - Create educational content to onboard new users to the platform

This updated project overview reflects the significant progress made in integrating advanced features like AI analytics and Allo Protocol, while also outlining the next steps for further enhancements and optimizations.


# Perennial Prediction Market - Technical Documentation

## Project Description
Perennial is a sophisticated Web3 platform for prediction markets focused on public goods and environmental projects. The system combines advanced smart contract architecture with AI-enhanced analytics, reputation systems, and multi-protocol integrations.

## Core Architecture

### Smart Contract Components

#### Market Structure
- **Market Types**
  - FINITE: Traditional markets with definite end times
  - INFINITE: Ongoing markets for continuous assessment
  - HYBRID: Combines characteristics of both types

#### Position Management
- Dynamic share pricing using market depth
- Early unstaking penalties to prevent manipulation
- Proportional reward distribution
- Position tracking with timestamps

#### Reputation System
- Score-based authorization
- Success-based reputation updates
- Market creation privileges
- Stake-weighted influence

### Security Features
1. **Access Control**
   - Ownable pattern for admin functions
   - Role-based market creation
   - Reputation thresholds

2. **Safety Mechanisms**
   - ReentrancyGuard for all value transfers
   - Pausable functionality for emergencies
   - Emergency withdrawal capabilities
   - Minimum stake periods

3. **Economic Security**
   - Dynamic pricing to prevent manipulation
   - Penalty system for early unstaking
   - Maximum stake percentages
   - Reputation-based participation limits

## Technical Implementation

### Smart Contract Functions

#### Core Market Operations
