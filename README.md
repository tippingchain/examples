# TippingChain Demo App

Demo application showcasing the TippingChain SDK and UI components for multi-chain tipping with USDC payouts on ApeChain.

## 🌐 Live Demo

**Deploy your own**: [![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://github.com/tippingchain/examples/blob/main/DEPLOYMENT.md)

The demo app is ready for immediate deployment to GitHub Pages. See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions.

## 🚀 What's New in v2.0

- **🔗 Integrated Relay.link Architecture**: No separate bridge contracts needed - direct integration for simplified deployment
- **💰 Dynamic Tier-Based Fees**: 4 creator tiers (60/40, 70/30, 80/20, 90/10) with transparent fee breakdown
- **🌐 Enhanced Testnet Support**: Holesky (ETH), Amoy (Polygon), Curtis (ApeChain) for modern development
- **🎁 Advanced Viewer Rewards**: 1% platform fee, batch operations, reward pools with multiple ID types
- **⚡ Simplified Architecture**: 98% cost reduction vs factory pattern, one unified contract per chain
- **🔄 Automatic USDC Conversion**: All tips and rewards converted to stable USDC on ApeChain

## Features

### Core Functionality
- **Multi-chain tipping** from 9 networks with integrated Relay.link bridging to ApeChain
- **Creator registry** with sequential ID system and wallet recovery capabilities
- **Dynamic tier fees** with real-time breakdown (5% platform + tier-based creator/business splits)
- **Viewer rewards system** with reduced 1% platform fee and batch operations
- **Automatic USDC conversion** on ApeChain for price-stable payouts
- **Real-time quotes** via Relay.link API with transparent fee estimation

### User Interface Components (v2.0)
- **ApeChainTippingInterface**: Main tipping component with dynamic fee calculations
- **Admin Panel**: Creator management with tier-based revenue analytics
- **Viewer Rewards Suite**: Single, batch, and pool reward interfaces
- **Chain Selector**: Support for mainnet and testnet configurations
- **Creator Selector**: Search by ID, wallet, or Thirdweb account
- **Responsive Design**: Tailwind CSS with mobile-first approach

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `VITE_THIRDWEB_CLIENT_ID`: Get from [Thirdweb Dashboard](https://thirdweb.com/dashboard)

3. **Package versions (v2.0):**
   The demo uses the latest v2.0 packages:
   - `@tippingchain/sdk`: ^2.0.0 (integrated Relay.link support)
   - `@tippingchain/ui-react`: ^2.0.0 (dynamic fee calculations)
   - `@tippingchain/contracts-interface`: ^1.2.0 (testnet configurations)

## Running the Demo

### Local Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The demo will be available at `http://localhost:5173`

### GitHub Pages Deployment

Deploy automatically to GitHub Pages with one click:

1. **Fork or clone** this repository to your GitHub account
2. **Enable GitHub Pages**: Go to Settings → Pages → Source → "GitHub Actions" 
3. **Push to main/master** branch - deployment happens automatically
4. **Manual deploy**: Actions tab → "Deploy to GitHub Pages" → "Run workflow"

Your app will be live at: `https://yourusername.github.io/repository-name/`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## App Structure

### Pages

1. **Tipping Page** (`/`) - Multi-Chain Creator Tipping
   - Creator ID-based tipping system (eliminates wallet complexity)
   - Dynamic fee breakdown with tier-based calculations
   - Real-time Relay.link quotes and USDC conversion estimates
   - Chain selector with testnet support (Holesky, Amoy, Curtis)
   - Transaction status tracking and confirmation

2. **Admin Panel** (`/admin`) - Platform Management
   - Creator registration with default Tier 1 (60/40 split)
   - Wallet recovery system (updateCreatorWallet functionality)
   - Comprehensive analytics: tips, relays, active creators
   - Viewer rewards platform statistics with 1% fee tracking
   - Real-time creator performance monitoring

3. **Viewer Rewards** (`/viewer-rewards`) - Creator-to-Audience Rewards
   - **Access Control**: Only registered creators can send rewards
   - **Single Rewards**: Individual viewer rewards with multiple ID types
   - **Batch Rewards**: Up to 50 viewers with CSV import/export
   - **Reward Pools**: Equal distribution among multiple viewers
   - **Statistics Dashboard**: Track reward history and platform metrics

4. **Thirdweb Demo** (`/thirdweb-demo`) - Smart Account Integration
   - Social login and account abstraction examples
   - Creator registration with Thirdweb account IDs
   - Smart wallet creation and gasless transactions
   - Cross-wallet identity preservation and recovery

## Fee Structure (v2.0 Dynamic System)

### Creator Tips - 5% Platform Fee + Tier-Based Splits
After 5% platform fee to TippingChain treasury, remaining 95% split by tier:
- **Tier 1 (Default)**: 60% creator / 40% business
- **Tier 2**: 70% creator / 30% business  
- **Tier 3**: 80% creator / 20% business
- **Tier 4**: 90% creator / 10% business

**Example**: $100 tip → $5 platform → $95 remaining → Tier 1: $57 creator, $38 business

### Viewer Rewards - 1% Platform Fee (Reduced)
- **Platform fee**: 1% to TippingChain treasury
- **Viewer receives**: 99% of reward amount
- **Auto-conversion**: All rewards → USDC on ApeChain
- **Batch efficiency**: Up to 50 viewers per transaction

## Testing Guide

### 1. Basic Tipping Flow
1. Navigate to the **Tipping** page
2. Connect your wallet
3. Select a creator (must be registered first)
4. Choose source chain and amount
5. Confirm transaction

### 2. Creator Registration
1. Go to **Admin Panel** (requires owner wallet)
2. Enter creator wallet address
3. Optionally add thirdweb ID
4. Select membership tier
5. Register on desired chains

### 3. Viewer Rewards Flow
1. Register as a creator first
2. Navigate to **Viewer Rewards**
3. Choose between:
   - **Single Reward**: Reward one viewer
   - **Batch Rewards**: Reward up to 50 viewers
   - **Reward Pool**: Distribute funds equally among viewers
4. Enter viewer details (ID, address, or thirdweb ID)
5. Set reward amount and reason
6. Send rewards

### 4. Thirdweb Integration
1. Visit **Thirdweb Demo** page
2. Try creator registration with thirdweb ID
3. Search creators by thirdweb ID
4. Register viewers with thirdweb IDs
5. Send rewards using thirdweb IDs

## Supported Networks (v2.0)

### Mainnet Source Chains (9 networks)
| Chain | ID | Token | Status | Relay Support |
|-------|-----|-------|--------|---------------|
| Ethereum | 1 | ETH | ✅ Active | ✅ Integrated |
| Polygon | 137 | MATIC | ✅ Active | ✅ Integrated |
| Optimism | 10 | ETH | ✅ Active | ✅ Integrated |
| BSC | 56 | BNB | ✅ Active | ✅ Integrated |
| Abstract | 2741 | ETH | ✅ Active | ✅ Integrated |
| Avalanche | 43114 | AVAX | ✅ Active | ✅ Integrated |
| Base | 8453 | ETH | ✅ Active | ✅ Integrated |
| Arbitrum | 42161 | ETH | ✅ Active | ✅ Integrated |
| Taiko | 167000 | ETH | ✅ Active | ✅ Integrated |

### Testnet Support (Development)
| Chain | ID | Token | Purpose |
|-------|-----|-------|---------|
| Holesky | 17000 | ETH | Ethereum testnet (replaces Sepolia) |
| Amoy | 80002 | MATIC | Polygon testnet (replaces Mumbai) |
| Curtis | 33111 | APE | ApeChain testnet destination |

### Destination Chain
- **ApeChain Mainnet** (33139) - Production USDC payouts
- **ApeChain Curtis** (33111) - Testnet USDC payouts
- Automatic conversion: All native tokens → USDC for price stability

## Architecture

### Technology Stack (v2.0)
- **@tippingchain/sdk v2.0**: Integrated Relay.link support, testnet configurations
- **@tippingchain/ui-react v2.0**: Dynamic fee calculations, enhanced viewer rewards UI
- **@tippingchain/contracts-interface v1.2.0**: Updated ABIs, testnet addresses, relay endpoints
- **React Router v7**: Modern client-side routing with data loading
- **Thirdweb v5**: Advanced wallet connection, account abstraction, gasless transactions
- **Vite + React 18**: Fast build tooling with HMR and TypeScript support
- **Tailwind CSS v4**: Utility-first styling with advanced responsive design

### Smart Contract Architecture (v2.0)
- **Sequential ID System**: Creator/viewer registry with wallet recovery
- **Tier-Based Revenue**: Dynamic 4-tier creator/business splits
- **Integrated Bridging**: Direct Relay.link calls (no separate bridge contracts)
- **Batch Operations**: Gas-efficient multi-viewer rewards
- **Thirdweb Compatibility**: Smart account and social login support
- **USDC Stability**: Automatic conversion on ApeChain destination

## v2.0 Advanced Features

### Integrated Relay.link Architecture
- **Direct Integration**: No separate bridge contracts
- **Simplified Deployment**: 98% cost reduction vs factory pattern architecture
- **Real-time Quotes**: Live fee estimation via Relay.link API before transactions
- **Automatic Bridging**: Single transaction for tip/reward + cross-chain relay
- **USDC Conversion**: All payouts automatically converted to stable USDC on ApeChain

### Dynamic Tier-Based Fee System
- **Real-time Calculations**: UI components dynamically compute fees based on creator tier
- **Transparent Breakdown**: Users see exact platform fee + creator/business split
- **4-Tier System**: 60/40, 70/30, 80/20, 90/10 creator/business revenue sharing
- **Upgrade Path**: Creators can be promoted to higher tiers by admin

### Enhanced Viewer Rewards
- **Reduced Platform Fee**: Only 1% vs 5% for creator tips (encourages community engagement)
- **Multiple ID Types**: Support viewer ID, wallet address, or Thirdweb account ID
- **Batch Operations**: Reward up to 50 viewers in single transaction for gas efficiency
- **Reward Pools**: Equal distribution among multiple viewers with single input
- **Creator Access Control**: Only registered creators can send viewer rewards

### Thirdweb Smart Account Integration
- **Account Abstraction**: Support for smart wallets and social logins
- **Gasless Transactions**: When configured with paymaster for improved UX
- **Identity Persistence**: Thirdweb IDs survive wallet changes and device switches
- **Cross-Wallet Recovery**: Update wallet addresses without losing creator/viewer history
- **Social Authentication**: Login with Google, Discord, Twitter, etc.

## Production Deployment (v2.0)

### Smart Contract Deployment
- **Unified Architecture**: Deploy one contract per chain (not per creator)
- **Relay Integration**: Each contract configured with chain-specific Relay.link endpoints
- **USDC Addresses**: Configured with correct USDC token addresses on each chain
- **Admin Setup**: Set platform treasury and initial admin addresses

### Prerequisites
- **Creator Registration**: Creators must be registered via admin before receiving tips
- **Viewer Registration**: Optional - unregistered viewers can receive rewards by wallet address
- **Admin Access**: Contract owner required for creator management and tier updates
- **Relay.link Service**: Ensure Relay.link supports all source→ApeChain routes
- **ApeChain USDC**: Sufficient USDC liquidity on destination chain for conversions

### Configuration Notes
- **Testnet Mode**: Set `useTestnet: true` in SDK for Holesky/Amoy/Curtis testing
- **Fee Recipients**: Configure platform treasury addresses for 5%/1% fees
- **Gas Limits**: Set appropriate limits for cross-chain relay transactions
- **RPC Endpoints**: Use reliable RPC providers for all 9 supported chains

## Troubleshooting

### Common Issues (v2.0 Troubleshooting)

1. **"Creator not found"**: 
   - Ensure creator is registered via Admin Panel on the selected chain
   - Check that creator wallet address matches exactly (case-sensitive)
   - Verify you're connected to the correct network

2. **"Not a registered creator"** (Viewer Rewards):
   - Only registered creators can send viewer rewards
   - Register as creator first via Admin Panel
   - Confirm creator status is "Active"

3. **"Viewer rewards disabled"**:
   - Platform admin has temporarily disabled viewer rewards feature
   - Check platform stats in Admin Panel for current status

4. **"Transaction failed"**:
   - Insufficient balance for gas fees + relay costs
   - Network congestion - try increasing gas price
   - Check minimum relay amounts via Relay.link API

5. **"Relay service unavailable"**:
   - Relay.link service may be down or maintaining
   - Check supported routes: source chain → ApeChain
   - Verify USDC liquidity on destination ApeChain

6. **"Invalid tier calculation"**:
   - Ensure creator tier is properly set (0-3 for Tiers 1-4)
   - Check fee breakdown in UI matches expected tier percentages
   - Verify contracts have latest tier configuration

### Support & Resources

- **GitHub Issues**: [TippingChain Repository](https://github.com/tippingchain)
- **Documentation**: Complete v2.0 documentation in root repository README
- **Contract Interface**: `@tippingchain/contracts-interface` v1.2.0
- **SDK Reference**: `@tippingchain/sdk` v2.0.0 with integrated Relay.link
- **UI Components**: `@tippingchain/ui-react` v2.0.0 with dynamic fee calculations

## License

MIT License - see LICENSE file for details