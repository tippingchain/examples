// src/types/transactionHistory.ts

export interface TransactionHistoryItem {
  id: string;
  type: 'tip' | 'approval' | 'creator_registration' | 'viewer_reward';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  timestamp: number; // Unix timestamp
  
  // Transaction details
  sourceChainId: number;
  sourceTransactionHash?: string;
  destinationChainId?: number; // For cross-chain transactions (usually ApeChain)
  destinationTransactionHash?: string;
  
  // Token information
  tokenSymbol: string;
  tokenAddress?: string; // undefined for native tokens
  amount: string; // In token units (e.g., "1.5" for 1.5 ETH)
  amountWei: string; // In wei/smallest unit
  
  // USD value estimates
  estimatedUsdValue?: string;
  estimatedUsdcReceived?: string; // For tips that convert to USDC
  
  // Tip-specific fields
  creatorId?: number;
  creatorWallet?: string;
  
  // Fee information
  platformFee?: string; // In token units
  platformFeeUsd?: string;
  relayFee?: string; // Cross-chain relay fees
  
  // Approval-specific fields
  spenderAddress?: string; // Contract that was approved
  approvalAmount?: string; // Amount approved (or "unlimited")
  
  // Creator registration fields
  registeredCreatorId?: number;
  membershipTier?: number;
  
  // Viewer reward fields
  viewerId?: number;
  viewerAddress?: string;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // UI display fields
  title: string;
  description: string;
  canRetry?: boolean;
}

export interface TransactionFilters {
  type?: 'all' | 'tip' | 'approval' | 'creator_registration' | 'viewer_reward';
  status?: 'all' | 'pending' | 'success' | 'failed' | 'cancelled';
  chainId?: number | 'all';
  dateRange?: {
    start: number; // Unix timestamp
    end: number;   // Unix timestamp
  };
  tokenSymbol?: string | 'all';
  creatorId?: number;
}

export interface TransactionStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalVolumeUsd: string;
  totalFeesUsd: string;
  uniqueCreatorsTipped: number;
  favoriteChain: {
    chainId: number;
    transactionCount: number;
  };
  favoriteToken: {
    symbol: string;
    transactionCount: number;
    volumeUsd: string;
  };
}

export interface ChainExplorerUrls {
  [chainId: number]: {
    name: string;
    baseUrl: string;
    txPath: string; // e.g., "/tx/" or "/transaction/"
  };
}

// Predefined chain explorer mappings
export const CHAIN_EXPLORERS: ChainExplorerUrls = {
  1: { name: 'Etherscan', baseUrl: 'https://etherscan.io', txPath: '/tx/' },
  137: { name: 'PolygonScan', baseUrl: 'https://polygonscan.com', txPath: '/tx/' },
  10: { name: 'Optimism Explorer', baseUrl: 'https://optimistic.etherscan.io', txPath: '/tx/' },
  56: { name: 'BscScan', baseUrl: 'https://bscscan.com', txPath: '/tx/' },
  43114: { name: 'SnowTrace', baseUrl: 'https://snowtrace.io', txPath: '/tx/' },
  8453: { name: 'BaseScan', baseUrl: 'https://basescan.org', txPath: '/tx/' },
  42161: { name: 'Arbiscan', baseUrl: 'https://arbiscan.io', txPath: '/tx/' },
  167000: { name: 'Taiko Explorer', baseUrl: 'https://taikoscan.io', txPath: '/tx/' },
  2741: { name: 'Abstract Explorer', baseUrl: 'https://explorer.abstract.xyz', txPath: '/tx/' },
  33139: { name: 'ApeChain Explorer', baseUrl: 'https://apescan.io', txPath: '/tx/' },
  // Testnets
  17000: { name: 'Holesky Etherscan', baseUrl: 'https://holesky.etherscan.io', txPath: '/tx/' },
  80002: { name: 'Amoy PolygonScan', baseUrl: 'https://amoy.polygonscan.com', txPath: '/tx/' },
  33111: { name: 'Curtis ApeChain', baseUrl: 'https://curtis.explorer.caldera.xyz', txPath: '/tx/' },
};

// Transaction history storage interface
export interface TransactionHistoryStorage {
  getTransactions(filters?: TransactionFilters): Promise<TransactionHistoryItem[]>;
  addTransaction(transaction: Omit<TransactionHistoryItem, 'id' | 'timestamp'>): Promise<string>;
  updateTransaction(id: string, updates: Partial<TransactionHistoryItem>): Promise<void>;
  clearHistory(): Promise<void>;
  getStats(filters?: TransactionFilters): Promise<TransactionStats>;
}

// Helper function types
export type TransactionBuilder = {
  createTipTransaction: (params: {
    sourceChainId: number;
    creatorId: number;
    creatorWallet: string;
    tokenSymbol: string;
    tokenAddress?: string;
    amount: string;
    amountWei: string;
    estimatedUsdValue?: string;
    platformFee?: string;
  }) => Omit<TransactionHistoryItem, 'id' | 'timestamp'>;
  
  createApprovalTransaction: (params: {
    chainId: number;
    tokenSymbol: string;
    tokenAddress: string;
    spenderAddress: string;
    amount: string;
  }) => Omit<TransactionHistoryItem, 'id' | 'timestamp'>;
  
  createCreatorRegistrationTransaction: (params: {
    chainId: number;
    creatorWallet: string;
    membershipTier: number;
  }) => Omit<TransactionHistoryItem, 'id' | 'timestamp'>;
};