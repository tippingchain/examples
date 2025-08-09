/**
 * Multi-chain token configuration for TippingChain demo
 * Defines supported tokens across all chains with metadata and mock balances
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  address?: string; // undefined for native tokens
  icon: string; // emoji or icon identifier
  color: string; // color theme for UI
  isStable?: boolean; // for stablecoins
  popular?: boolean; // for highlighting popular tokens
}

export interface ChainTokens {
  chainId: number;
  chainName: string;
  native: TokenConfig;
  tokens: TokenConfig[];
}

// Native token configurations
export const NATIVE_TOKENS: Record<number, TokenConfig> = {
  1: { symbol: 'ETH', name: 'Ethereum', decimals: 18, icon: '💎', color: '#627EEA' },
  137: { symbol: 'MATIC', name: 'Polygon', decimals: 18, icon: '🟣', color: '#8247E5' },
  10: { symbol: 'ETH', name: 'Ethereum (Optimism)', decimals: 18, icon: '🔴', color: '#FF0420' },
  56: { symbol: 'BNB', name: 'BNB Chain', decimals: 18, icon: '🟨', color: '#F3BA2F' },
  2741: { symbol: 'ETH', name: 'Ethereum (Abstract)', decimals: 18, icon: '🌀', color: '#00D2FF' },
  43114: { symbol: 'AVAX', name: 'Avalanche', decimals: 18, icon: '🏔️', color: '#E84142' },
  8453: { symbol: 'ETH', name: 'Ethereum (Base)', decimals: 18, icon: '🔵', color: '#0052FF' },
  42161: { symbol: 'ETH', name: 'Ethereum (Arbitrum)', decimals: 18, icon: '🔷', color: '#28A0F0' },
  167000: { symbol: 'ETH', name: 'Ethereum (Taiko)', decimals: 18, icon: '🎌', color: '#FA4F00' },
  33139: { symbol: 'APE', name: 'ApeChain', decimals: 18, icon: '🐒', color: '#FFD700' },
  // Testnets
  17000: { symbol: 'ETH', name: 'Ethereum (Holesky)', decimals: 18, icon: '🧪', color: '#627EEA' },
  80002: { symbol: 'MATIC', name: 'Polygon (Amoy)', decimals: 18, icon: '🧪', color: '#8247E5' },
  33111: { symbol: 'APE', name: 'ApeChain (Curtis)', decimals: 18, icon: '🧪', color: '#FFD700' },
};

// Chain-specific token configurations
export const CHAIN_TOKENS: ChainTokens[] = [
  {
    chainId: 1, // Ethereum
    chainName: 'Ethereum',
    native: NATIVE_TOKENS[1],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86a33E6045c56d65F4E7E7334E1d2b7aC9f15', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', icon: '💎', color: '#627EEA', popular: true },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', icon: '₿', color: '#F7931A' },
      { symbol: 'UNI', name: 'Uniswap', decimals: 18, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', icon: '🦄', color: '#FF007A' },
    ]
  },
  {
    chainId: 137, // Polygon
    chainName: 'Polygon',
    native: NATIVE_TOKENS[137],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin (PoS)', decimals: 6, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD (PoS)', decimals: 6, address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin (PoS)', decimals: 18, address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', icon: '💎', color: '#627EEA', popular: true },
      { symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18, address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', icon: '🟣', color: '#8247E5' },
      { symbol: 'AAVE', name: 'Aave Token (PoS)', decimals: 18, address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', icon: '👻', color: '#B6509E' },
    ]
  },
  {
    chainId: 10, // Optimism
    chainName: 'Optimism',
    native: NATIVE_TOKENS[10],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x4200000000000000000000000000000000000006', icon: '💎', color: '#627EEA', popular: true },
      { symbol: 'OP', name: 'Optimism Token', decimals: 18, address: '0x4200000000000000000000000000000000000042', icon: '🔴', color: '#FF0420' },
    ]
  },
  {
    chainId: 56, // BSC
    chainName: 'BNB Chain',
    native: NATIVE_TOKENS[56],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 18, address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'BUSD', name: 'Binance USD', decimals: 18, address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', icon: '🟨', color: '#F3BA2F', isStable: true, popular: true },
      { symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', icon: '🟨', color: '#F3BA2F' },
      { symbol: 'ETH', name: 'Ethereum Token', decimals: 18, address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', icon: '💎', color: '#627EEA' },
    ]
  },
  {
    chainId: 2741, // Abstract
    chainName: 'Abstract',
    native: NATIVE_TOKENS[2741],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x1234567890123456789012345678901234567890', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x2345678901234567890123456789012345678901', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x3456789012345678901234567890123456789012', icon: '💎', color: '#627EEA', popular: true },
    ]
  },
  {
    chainId: 43114, // Avalanche
    chainName: 'Avalanche',
    native: NATIVE_TOKENS[43114],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18, address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', icon: '🏔️', color: '#E84142' },
      { symbol: 'WETH.e', name: 'Wrapped Ethereum', decimals: 18, address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', icon: '💎', color: '#627EEA' },
    ]
  },
  {
    chainId: 8453, // Base
    chainName: 'Base',
    native: NATIVE_TOKENS[8453],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x4200000000000000000000000000000000000006', icon: '💎', color: '#627EEA', popular: true },
      { symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', decimals: 8, address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', icon: '₿', color: '#F7931A' },
    ]
  },
  {
    chainId: 42161, // Arbitrum
    chainName: 'Arbitrum',
    native: NATIVE_TOKENS[42161],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', icon: '💎', color: '#627EEA', popular: true },
      { symbol: 'ARB', name: 'Arbitrum Token', decimals: 18, address: '0x912CE59144191C1204E64559FE8253a0e49E6548', icon: '🔷', color: '#28A0F0' },
    ]
  },
  {
    chainId: 167000, // Taiko
    chainName: 'Taiko',
    native: NATIVE_TOKENS[167000],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x1234567890123456789012345678901234567890', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x2345678901234567890123456789012345678901', icon: '💚', color: '#26A17B', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x3456789012345678901234567890123456789012', icon: '💎', color: '#627EEA', popular: true },
    ]
  },
  {
    chainId: 33139, // ApeChain
    chainName: 'ApeChain',
    native: NATIVE_TOKENS[33139],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, address: '0x4200000000000000000000000000000000000006', icon: '💎', color: '#627EEA', popular: true },
    ]
  },
  // Testnets
  {
    chainId: 17000, // Holesky
    chainName: 'Ethereum Holesky',
    native: NATIVE_TOKENS[17000],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin (Testnet)', decimals: 6, address: '0x1234567890123456789012345678901234567890', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin (Testnet)', decimals: 18, address: '0x2345678901234567890123456789012345678901', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum (Testnet)', decimals: 18, address: '0x3456789012345678901234567890123456789012', icon: '💎', color: '#627EEA', popular: true },
    ]
  },
  {
    chainId: 80002, // Amoy
    chainName: 'Polygon Amoy',
    native: NATIVE_TOKENS[80002],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin (Testnet)', decimals: 6, address: '0x4567890123456789012345678901234567890123', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'DAI', name: 'Dai Stablecoin (Testnet)', decimals: 18, address: '0x5678901234567890123456789012345678901234', icon: '🟡', color: '#F5AC37', isStable: true, popular: true },
      { symbol: 'WMATIC', name: 'Wrapped Matic (Testnet)', decimals: 18, address: '0x6789012345678901234567890123456789012345', icon: '🟣', color: '#8247E5' },
    ]
  },
  {
    chainId: 33111, // Curtis (ApeChain Testnet)
    chainName: 'ApeChain Curtis',
    native: NATIVE_TOKENS[33111],
    tokens: [
      { symbol: 'USDC', name: 'USD Coin (Testnet)', decimals: 6, address: '0x7890123456789012345678901234567890123456', icon: '💵', color: '#2775CA', isStable: true, popular: true },
      { symbol: 'WETH', name: 'Wrapped Ethereum (Testnet)', decimals: 18, address: '0x8901234567890123456789012345678901234567', icon: '💎', color: '#627EEA', popular: true },
    ]
  }
];


// Helper functions
export function getTokensForChain(chainId: number): ChainTokens | undefined {
  return CHAIN_TOKENS.find(chain => chain.chainId === chainId);
}

export function getAllTokensForChain(chainId: number): TokenConfig[] {
  const chainTokens = getTokensForChain(chainId);
  if (!chainTokens) return [];
  return [chainTokens.native, ...chainTokens.tokens];
}


export function getPopularTokens(chainId: number): TokenConfig[] {
  const allTokens = getAllTokensForChain(chainId);
  return allTokens.filter(token => token.popular || token.isStable);
}

export function getStablecoins(chainId: number): TokenConfig[] {
  const allTokens = getAllTokensForChain(chainId);
  return allTokens.filter(token => token.isStable);
}

export function formatTokenAmount(amount: string, decimals: number = 18, displayDecimals: number = 4): string {
  const value = parseFloat(amount);
  if (value === 0) return '0';
  
  if (value < 0.0001) {
    return value.toExponential(2);
  }
  
  if (value < 1) {
    return value.toFixed(displayDecimals);
  }
  
  if (value < 1000) {
    return value.toFixed(2);
  }
  
  if (value < 1000000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  
  return (value / 1000000).toFixed(1) + 'M';
}

export function isNativeToken(tokenSymbol: string, chainId: number): boolean {
  const chainTokens = getTokensForChain(chainId);
  return chainTokens?.native.symbol === tokenSymbol;
}