// src/components/TransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Coins,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { 
  TransactionHistoryItem, 
  TransactionFilters, 
  TransactionStats,
  CHAIN_EXPLORERS 
} from '../types/transactionHistory';
import { transactionHistoryService } from '../services/transactionHistoryService';
import { getAllTokensForChain } from '../data/tokenConfig';
import { SUPPORTED_CHAINS } from '@tippingchain/contracts-interface';

interface TransactionHistoryProps {
  className?: string;
  maxHeight?: string;
  showStats?: boolean;
  showFilters?: boolean;
  walletAddress?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  className = '',
  maxHeight = 'max-h-96',
  showStats = true,
  showFilters = true,
  walletAddress
}) => {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const [txList, statsData] = await Promise.all([
        transactionHistoryService.getTransactions(filters),
        showStats ? transactionHistoryService.getStats(filters) : null
      ]);
      
      setTransactions(txList);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const getStatusIcon = (status: TransactionHistoryItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TransactionHistoryItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: TransactionHistoryItem['type']) => {
    switch (type) {
      case 'tip': return '💰';
      case 'approval': return '✅';
      case 'creator_registration': return '👤';
      case 'viewer_reward': return '🎁';
      default: return '📄';
    }
  };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain ? chain.name : `Chain ${chainId}`;
  };

  const getExplorerLink = (chainId: number, txHash: string) => {
    const explorer = CHAIN_EXPLORERS[chainId];
    if (!explorer) return null;
    return `${explorer.baseUrl}${explorer.txPath}${txHash}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const retryTransaction = (tx: TransactionHistoryItem) => {
    // This would need to be implemented to retry failed transactions
    console.log('Retry transaction:', tx.id);
  };

  const clearAllHistory = async () => {
    if (confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      await transactionHistoryService.clearHistory();
      loadTransactions();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          {transactions.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {transactions.length} transactions
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                showFilterPanel 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          )}
          
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {transactions.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {showStats && stats && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">${stats.totalVolumeUsd}</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.successfulTransactions}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.uniqueCreatorsTipped}</div>
              <div className="text-sm text-gray-600">Creators Tipped</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">${stats.totalFeesUsd}</div>
              <div className="text-sm text-gray-600">Total Fees</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/50">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Favorite Chain: <strong>{getChainName(stats.favoriteChain.chainId)}</strong> ({stats.favoriteChain.transactionCount} txs)</span>
              <span>Favorite Token: <strong>{stats.favoriteToken.symbol}</strong> (${stats.favoriteToken.volumeUsd})</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="tip">Tips</option>
                <option value="approval">Approvals</option>
                <option value="creator_registration">Creator Registration</option>
                <option value="viewer_reward">Viewer Rewards</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Chain Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chain</label>
              <select
                value={filters.chainId || 'all'}
                onChange={(e) => setFilters({ ...filters, chainId: e.target.value === 'all' ? 'all' : parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Chains</option>
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading transaction history...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-sm text-gray-400 mt-2">
              {Object.keys(filters).length > 0 ? 'Try adjusting your filters' : 'Your transactions will appear here once you start tipping'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900 truncate">{tx.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="ml-1.5 capitalize">{tx.status}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{tx.amount} {tx.tokenSymbol}</span>
                        <span>•</span>
                        <span>{getChainName(tx.sourceChainId)}</span>
                        <span>•</span>
                        <span>{formatTimestamp(tx.timestamp)}</span>
                        {tx.estimatedUsdValue && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">${parseFloat(tx.estimatedUsdValue).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {tx.status === 'failed' && tx.canRetry && (
                      <button
                        onClick={() => retryTransaction(tx)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                        title="Retry transaction"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {expandedTx === tx.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTx === tx.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-600 mt-1">{tx.description}</p>
                        </div>
                        
                        {tx.creatorId && (
                          <div>
                            <span className="font-medium text-gray-700">Creator:</span>
                            <span className="text-blue-600 ml-2">#{tx.creatorId}</span>
                            {tx.creatorWallet && (
                              <span className="text-gray-500 ml-2">({tx.creatorWallet.slice(0, 8)}...)</span>
                            )}
                          </div>
                        )}
                        
                        {tx.error && (
                          <div>
                            <span className="font-medium text-red-700">Error:</span>
                            <p className="text-red-600 mt-1 text-xs">{tx.error}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        {tx.sourceTransactionHash && (
                          <div>
                            <span className="font-medium text-gray-700">Transaction Hash:</span>
                            <div className="flex items-center mt-1">
                              <span className="text-gray-600 font-mono text-xs">
                                {tx.sourceTransactionHash.slice(0, 10)}...{tx.sourceTransactionHash.slice(-8)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(tx.sourceTransactionHash!)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                title="Copy hash"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              {getExplorerLink(tx.sourceChainId, tx.sourceTransactionHash) && (
                                <a
                                  href={getExplorerLink(tx.sourceChainId, tx.sourceTransactionHash)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                  title="View on explorer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {tx.platformFee && (
                          <div>
                            <span className="font-medium text-gray-700">Platform Fee:</span>
                            <span className="text-gray-600 ml-2">{tx.platformFee} {tx.tokenSymbol}</span>
                            {tx.platformFeeUsd && (
                              <span className="text-gray-500 ml-1">(${tx.platformFeeUsd})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;