// src/services/transactionHistoryService.ts
import { 
  TransactionHistoryItem, 
  TransactionFilters, 
  TransactionStats, 
  TransactionHistoryStorage,
  TransactionBuilder 
} from '../types/transactionHistory';

const STORAGE_KEY = 'tippingchain_transaction_history';
const MAX_HISTORY_ITEMS = 1000; // Limit history to prevent localStorage overflow

class LocalTransactionHistoryService implements TransactionHistoryStorage {
  private async getStoredTransactions(): Promise<TransactionHistoryItem[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load transaction history from localStorage:', error);
      return [];
    }
  }

  private async saveTransactions(transactions: TransactionHistoryItem[]): Promise<void> {
    try {
      // Keep only the most recent transactions to prevent storage overflow
      const trimmed = transactions.slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save transaction history to localStorage:', error);
      throw error;
    }
  }

  async getTransactions(filters?: TransactionFilters): Promise<TransactionHistoryItem[]> {
    const transactions = await this.getStoredTransactions();
    
    if (!filters) {
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    let filtered = transactions;

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Filter by chain ID
    if (filters.chainId && filters.chainId !== 'all') {
      filtered = filtered.filter(tx => tx.sourceChainId === filters.chainId);
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filtered.filter(tx => 
        tx.timestamp >= filters.dateRange!.start && 
        tx.timestamp <= filters.dateRange!.end
      );
    }

    // Filter by token symbol
    if (filters.tokenSymbol && filters.tokenSymbol !== 'all') {
      filtered = filtered.filter(tx => tx.tokenSymbol === filters.tokenSymbol);
    }

    // Filter by creator ID
    if (filters.creatorId) {
      filtered = filtered.filter(tx => tx.creatorId === filters.creatorId);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  async addTransaction(transaction: Omit<TransactionHistoryItem, 'id' | 'timestamp'>): Promise<string> {
    const transactions = await this.getStoredTransactions();
    
    const newTransaction: TransactionHistoryItem = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    transactions.push(newTransaction);
    await this.saveTransactions(transactions);
    
    return newTransaction.id;
  }

  async updateTransaction(id: string, updates: Partial<TransactionHistoryItem>): Promise<void> {
    const transactions = await this.getStoredTransactions();
    const index = transactions.findIndex(tx => tx.id === id);
    
    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    transactions[index] = { ...transactions[index], ...updates };
    await this.saveTransactions(transactions);
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  async getStats(filters?: TransactionFilters): Promise<TransactionStats> {
    const transactions = await this.getTransactions(filters);
    
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(tx => tx.status === 'success').length;
    const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
    const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;

    // Calculate total volume in USD
    const totalVolumeUsd = transactions.reduce((sum, tx) => {
      if (tx.status === 'success' && tx.estimatedUsdValue) {
        return sum + parseFloat(tx.estimatedUsdValue);
      }
      return sum;
    }, 0);

    // Calculate total fees in USD
    const totalFeesUsd = transactions.reduce((sum, tx) => {
      if (tx.status === 'success' && tx.platformFeeUsd) {
        return sum + parseFloat(tx.platformFeeUsd);
      }
      return sum;
    }, 0);

    // Count unique creators tipped
    const creatorIds = new Set(
      transactions
        .filter(tx => tx.type === 'tip' && tx.status === 'success' && tx.creatorId)
        .map(tx => tx.creatorId!)
    );

    // Find favorite chain
    const chainCounts: Record<number, number> = {};
    transactions.forEach(tx => {
      chainCounts[tx.sourceChainId] = (chainCounts[tx.sourceChainId] || 0) + 1;
    });
    const favoriteChainId = Object.entries(chainCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const favoriteChain = favoriteChainId ? {
      chainId: parseInt(favoriteChainId[0]),
      transactionCount: favoriteChainId[1]
    } : { chainId: 1, transactionCount: 0 };

    // Find favorite token
    const tokenStats: Record<string, { count: number; volume: number }> = {};
    transactions.forEach(tx => {
      if (tx.status === 'success') {
        if (!tokenStats[tx.tokenSymbol]) {
          tokenStats[tx.tokenSymbol] = { count: 0, volume: 0 };
        }
        tokenStats[tx.tokenSymbol].count++;
        if (tx.estimatedUsdValue) {
          tokenStats[tx.tokenSymbol].volume += parseFloat(tx.estimatedUsdValue);
        }
      }
    });
    
    const favoriteTokenEntry = Object.entries(tokenStats)
      .sort(([,a], [,b]) => b.count - a.count)[0];
    
    const favoriteToken = favoriteTokenEntry ? {
      symbol: favoriteTokenEntry[0],
      transactionCount: favoriteTokenEntry[1].count,
      volumeUsd: favoriteTokenEntry[1].volume.toFixed(2)
    } : { symbol: 'ETH', transactionCount: 0, volumeUsd: '0.00' };

    return {
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
      failedTransactions,
      totalVolumeUsd: totalVolumeUsd.toFixed(2),
      totalFeesUsd: totalFeesUsd.toFixed(2),
      uniqueCreatorsTipped: creatorIds.size,
      favoriteChain,
      favoriteToken,
    };
  }
}

// Transaction builder utility functions
export const transactionBuilder: TransactionBuilder = {
  createTipTransaction: (params) => ({
    type: 'tip',
    status: 'pending',
    sourceChainId: params.sourceChainId,
    destinationChainId: 33139, // ApeChain
    tokenSymbol: params.tokenSymbol,
    tokenAddress: params.tokenAddress,
    amount: params.amount,
    amountWei: params.amountWei,
    estimatedUsdValue: params.estimatedUsdValue,
    platformFee: params.platformFee,
    creatorId: params.creatorId,
    creatorWallet: params.creatorWallet,
    title: `Tip to Creator #${params.creatorId}`,
    description: `Sending ${params.amount} ${params.tokenSymbol} to Creator #${params.creatorId}`,
    canRetry: true,
  }),

  createApprovalTransaction: (params) => ({
    type: 'approval',
    status: 'pending',
    sourceChainId: params.chainId,
    tokenSymbol: params.tokenSymbol,
    tokenAddress: params.tokenAddress,
    amount: params.amount,
    amountWei: params.amount, // For approvals, amount is already in correct format
    spenderAddress: params.spenderAddress,
    title: `Approve ${params.tokenSymbol}`,
    description: `Approving ${params.tokenSymbol} spending for TippingChain contract`,
    canRetry: true,
  }),

  createCreatorRegistrationTransaction: (params) => ({
    type: 'creator_registration',
    status: 'pending',
    sourceChainId: params.chainId,
    tokenSymbol: 'ETH', // Gas token
    amount: '0',
    amountWei: '0',
    creatorWallet: params.creatorWallet,
    membershipTier: params.membershipTier,
    title: 'Register New Creator',
    description: `Registering creator ${params.creatorWallet.slice(0, 8)}... with Tier ${params.membershipTier}`,
    canRetry: true,
  }),
};

// Export singleton instance
export const transactionHistoryService = new LocalTransactionHistoryService();

// Helper functions for common operations
export const addTipToHistory = async (params: Parameters<typeof transactionBuilder.createTipTransaction>[0]) => {
  const transaction = transactionBuilder.createTipTransaction(params);
  return await transactionHistoryService.addTransaction(transaction);
};

export const addApprovalToHistory = async (params: Parameters<typeof transactionBuilder.createApprovalTransaction>[0]) => {
  const transaction = transactionBuilder.createApprovalTransaction(params);
  return await transactionHistoryService.addTransaction(transaction);
};

export const addCreatorRegistrationToHistory = async (params: Parameters<typeof transactionBuilder.createCreatorRegistrationTransaction>[0]) => {
  const transaction = transactionBuilder.createCreatorRegistrationTransaction(params);
  return await transactionHistoryService.addTransaction(transaction);
};

export const updateTransactionSuccess = async (
  transactionId: string, 
  sourceTransactionHash: string,
  destinationTransactionHash?: string,
  estimatedUsdcReceived?: string
) => {
  await transactionHistoryService.updateTransaction(transactionId, {
    status: 'success',
    sourceTransactionHash,
    destinationTransactionHash,
    estimatedUsdcReceived,
  });
};

export const updateTransactionError = async (
  transactionId: string, 
  error: string,
  errorCode?: string
) => {
  await transactionHistoryService.updateTransaction(transactionId, {
    status: 'failed',
    error,
    errorCode,
  });
};