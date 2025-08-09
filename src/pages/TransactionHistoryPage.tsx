// src/pages/TransactionHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { 
  History, 
  Download, 
  Calendar, 
  BarChart3,
  TrendingUp,
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';
import { TransactionHistory, createTransactionHistoryService } from '@tippingchain/ui-react';
import type { TransactionStats, TransactionHistoryItem } from '@tippingchain/ui-react';

interface TransactionHistoryPageProps {
  client: any;
  sdk?: any;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ client, sdk }) => {
  const account = useActiveAccount();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Create transaction history service
  const historyService = createTransactionHistoryService();

  useEffect(() => {
    loadPageData();
  }, [account]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const [statsData, recentTxs] = await Promise.all([
        historyService.getStats(),
        historyService.getTransactions({ status: 'all' })
      ]);
      
      setStats(statsData);
      setRecentTransactions(recentTxs.slice(0, 5)); // Get last 5 transactions
    } catch (error) {
      console.error('Failed to load transaction history page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async (format: 'csv' | 'json') => {
    try {
      const transactions = await historyService.getTransactions();
      
      if (format === 'csv') {
        const csvHeaders = [
          'ID', 'Type', 'Status', 'Timestamp', 'Chain', 'Token', 'Amount', 
          'USD Value', 'Creator ID', 'Transaction Hash', 'Description'
        ];
        
        const csvRows = transactions.map(tx => [
          tx.id,
          tx.type,
          tx.status,
          new Date(tx.timestamp).toISOString(),
          tx.sourceChainId.toString(),
          tx.tokenSymbol,
          tx.amount,
          tx.estimatedUsdValue || '',
          tx.creatorId?.toString() || '',
          tx.sourceTransactionHash || '',
          tx.description.replace(/,/g, ';') // Escape commas in description
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tippingchain-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const jsonContent = JSON.stringify(transactions, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tippingchain-transactions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export transactions:', error);
      alert('Failed to export transaction history. Please try again.');
    }
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return '$0.00';
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <History className="w-10 h-10 text-blue-600" />
            Transaction History
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800">
            🕒 Complete transaction tracking and analytics
          </div>
        </div>

        {/* Wallet Connection Alert */}
        {!account && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Connect Your Wallet:</strong> To track your transactions, please connect your wallet first.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Transaction history is stored locally and tied to your wallet address.
                  </p>
                </div>
              </div>
              <ConnectButton client={client} theme="light" />
            </div>
          </div>
        )}

        {/* Connected Wallet Info */}
        {account && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Wallet Connected:</strong> Tracking transactions for {account.address?.slice(0, 8)}...{account.address?.slice(-6)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Transaction history is automatically saved as you use TippingChain
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Overview */}
        {stats && stats.totalTransactions > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalVolumeUsd)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  Across {stats.totalTransactions} transactions
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTransactions > 0 
                      ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)
                      : 0}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {stats.successfulTransactions} of {stats.totalTransactions} successful
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Creators Supported</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueCreatorsTipped}</p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  Unique creators tipped
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalFeesUsd)}</p>
                </div>
                <div className="text-2xl">💳</div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  Total fees contributed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Export Section */}
        {stats && stats.totalTransactions > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => exportTransactions('csv')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </button>
              
              <button
                onClick={() => exportTransactions('json')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Export Information:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• CSV format is ideal for Excel and spreadsheet applications</li>
                <li>• JSON format preserves all technical details and metadata</li>
                <li>• Exports include transaction hashes, timestamps, and USD values</li>
                <li>• All data is exported from your local transaction history</li>
              </ul>
            </div>
          </div>
        )}

        {/* Main Transaction History Component */}
        <TransactionHistory
          showStats={false} // We show stats above instead
          showFilters={true}
          maxHeight="max-h-screen" // Allow full height since this is a dedicated page
          walletAddress={account?.address}
          className="min-h-96"
          storageService={historyService}
        />

        {/* Recent Activity Summary */}
        {recentTransactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{
                      tx.type === 'tip' ? '💰' : 
                      tx.type === 'approval' ? '✅' : 
                      tx.type === 'creator_registration' ? '👤' : '🎁'
                    }</span>
                    <div>
                      <div className="font-medium text-gray-900">{tx.title}</div>
                      <div className="text-sm text-gray-600">
                        {tx.amount} {tx.tokenSymbol} • {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {tx.estimatedUsdValue && (
                      <span className="text-sm font-medium text-green-600">
                        ${parseFloat(tx.estimatedUsdValue).toFixed(2)}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tx.status === 'success' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for New Users */}
        {stats && stats.totalTransactions === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transaction History Yet</h3>
            <p className="text-gray-600 mb-6">
              Your transaction history will appear here once you start using TippingChain.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Send tips to creators across multiple blockchain networks</p>
              <p>• Approve tokens for seamless future transactions</p>
              <p>• Register as a creator to receive tips</p>
              <p>• All your activities will be tracked and displayed here</p>
            </div>
            <div className="mt-8">
              <a
                href="/examples/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Tipping Now
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionHistoryPage;