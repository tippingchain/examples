// src/pages/PlatformStatsPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Trophy,
  Zap,
  Globe,
  Target,
  PieChart,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ChainSelector } from '@tippingchain/ui-react';
import type { 
  ApeChainTippingSDK, 
  PlatformStats, 
  Creator,
  ViewerRewardsPlatformStats 
} from '@tippingchain/sdk';
import { SUPPORTED_CHAINS, getContractAddress, isContractDeployed } from '@tippingchain/contracts-interface';

interface PlatformStatsPageProps {
  client: any;
  sdk: ApeChainTippingSDK;
}

interface ChainStats {
  chainId: number;
  chainName: string;
  stats: PlatformStats | null;
  viewerRewardsStats: ViewerRewardsPlatformStats | null;
  topCreators: Creator[];
  loading: boolean;
  error: string | null;
}

const CHAIN_NAMES: Record<number, string> = {
  [SUPPORTED_CHAINS.ETHEREUM]: 'Ethereum',
  [SUPPORTED_CHAINS.POLYGON]: 'Polygon',
  [SUPPORTED_CHAINS.OPTIMISM]: 'Optimism', 
  [SUPPORTED_CHAINS.BSC]: 'BSC',
  [SUPPORTED_CHAINS.AVALANCHE]: 'Avalanche',
  [SUPPORTED_CHAINS.BASE]: 'Base',
  [SUPPORTED_CHAINS.ARBITRUM]: 'Arbitrum',
  [SUPPORTED_CHAINS.TAIKO]: 'Taiko',
  [SUPPORTED_CHAINS.ABSTRACT]: 'Abstract',
  [SUPPORTED_CHAINS.APECHAIN]: 'ApeChain'
};

export const PlatformStatsPage: React.FC<PlatformStatsPageProps> = ({ client, sdk }) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [selectedChainId, setSelectedChainId] = useState<number>(8453); // Base default
  const [chainStats, setChainStats] = useState<Record<number, ChainStats>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize chain stats structure
  useEffect(() => {
    const supportedChainIds = Object.values(SUPPORTED_CHAINS).filter(id => typeof id === 'number') as number[];
    const initialStats: Record<number, ChainStats> = {};
    
    supportedChainIds.forEach(chainId => {
      if (isContractDeployed(chainId)) {
        initialStats[chainId] = {
          chainId,
          chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
          stats: null,
          viewerRewardsStats: null,
          topCreators: [],
          loading: false,
          error: null
        };
      }
    });
    
    setChainStats(initialStats);
  }, []);

  const loadChainStats = async (chainId: number) => {
    if (!chainStats[chainId]) return;

    setChainStats(prev => ({
      ...prev,
      [chainId]: { ...prev[chainId], loading: true, error: null }
    }));

    try {
      // Load platform stats, top creators, and viewer rewards in parallel
      const [platformStats, topCreators, viewerRewardsStats] = await Promise.all([
        sdk.getPlatformStats(chainId).catch(() => null),
        sdk.getTopCreators(10, chainId).catch(() => []),
        sdk.getViewerRewardsPlatformStats(chainId).catch(() => null)
      ]);

      setChainStats(prev => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          stats: platformStats,
          topCreators: topCreators || [],
          viewerRewardsStats,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error(`Failed to load stats for chain ${chainId}:`, error);
      setChainStats(prev => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load stats'
        }
      }));
    }
  };

  const loadAllStats = async () => {
    setGlobalLoading(true);
    const chainIds = Object.keys(chainStats).map(Number);
    
    await Promise.all(chainIds.map(chainId => loadChainStats(chainId)));
    
    setLastUpdated(new Date());
    setGlobalLoading(false);
  };

  // Load selected chain stats on mount and when selection changes
  useEffect(() => {
    if (chainStats[selectedChainId] && !chainStats[selectedChainId].stats) {
      loadChainStats(selectedChainId);
    }
  }, [selectedChainId, chainStats]);

  const currentChainStats = chainStats[selectedChainId];
  const deployedChains = Object.values(chainStats);
  
  // Calculate global totals
  const globalTotals = deployedChains.reduce((totals, chain) => {
    if (chain.stats) {
      totals.totalTips += parseFloat(chain.stats.totalTips);
      totals.totalTransactions += chain.stats.totalCount;
      totals.activeCreators += chain.stats.activeCreators;
      totals.totalRelayed += parseFloat(chain.stats.totalRelayed);
    }
    return totals;
  }, { totalTips: 0, totalTransactions: 0, activeCreators: 0, totalRelayed: 0 });

  const formatAmount = (amount: string | number) => {
    try {
      const eth = parseFloat(amount.toString()) / 1e18;
      return eth.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } catch {
      return '0.0000';
    }
  };

  const formatCurrency = (amount: string | number) => {
    try {
      const eth = parseFloat(amount.toString()) / 1e18;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(eth * 2000); // Rough ETH to USD conversion for display
    } catch {
      return '$0.00';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            Platform Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Real-time statistics from TippingChain contracts across 9 blockchains
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={loadAllStats}
              disabled={globalLoading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {globalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              {globalLoading ? 'Loading All Chains...' : 'Refresh All Stats'}
            </button>
            
            {!account && (
              <ConnectButton client={client} theme="light" />
            )}
          </div>

          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Global Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tips (All Chains)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(globalTotals.totalTips)} ETH
                </p>
                <p className="text-sm text-gray-500">≈ {formatCurrency(globalTotals.totalTips)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Creators</p>
                <p className="text-2xl font-bold text-gray-900">{globalTotals.activeCreators.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Across {deployedChains.length} chains</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{globalTotals.totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-gray-500">All tip transactions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relayed to ApeChain</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(globalTotals.totalRelayed)} USDC
                </p>
                <p className="text-sm text-gray-500">Cross-chain bridged</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Chain Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Chain-Specific Analytics
          </h2>
          <div className="max-w-md">
            <ChainSelector
              value={selectedChainId}
              onChange={setSelectedChainId}
              label="Select Chain"
              className="w-full"
            />
          </div>
        </div>

        {/* Selected Chain Stats */}
        {currentChainStats && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  {currentChainStats.chainName} Statistics
                </h2>
                <button
                  onClick={() => loadChainStats(selectedChainId)}
                  disabled={currentChainStats.loading}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {currentChainStats.loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </button>
              </div>

              {currentChainStats.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-gray-600">Loading {currentChainStats.chainName} stats...</span>
                </div>
              ) : currentChainStats.error ? (
                <div className="flex items-center justify-center py-12">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load stats</p>
                    <p className="text-red-500 text-sm">{currentChainStats.error}</p>
                  </div>
                </div>
              ) : currentChainStats.stats ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-blue-700">Tips Volume</h3>
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-blue-900">
                      {formatAmount(currentChainStats.stats.totalTips)}
                    </p>
                    <p className="text-xs text-blue-600">ETH equivalent</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-green-700">Active Creators</h3>
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-900">
                      {currentChainStats.stats.activeCreators}
                    </p>
                    <p className="text-xs text-green-600">Currently active</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-purple-700">Transactions</h3>
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xl font-bold text-purple-900">
                      {currentChainStats.stats.totalCount}
                    </p>
                    <p className="text-xs text-purple-600">Total tips sent</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-orange-700">Relayed</h3>
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-xl font-bold text-orange-900">
                      {formatAmount(currentChainStats.stats.totalRelayed)}
                    </p>
                    <p className="text-xs text-orange-600">
                      Auto Relay: {currentChainStats.stats.autoRelayEnabled ? (
                        <CheckCircle className="w-3 h-3 inline text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 inline text-red-500" />
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No stats available for this chain</p>
                  <p className="text-sm">Contract may not be deployed or active</p>
                </div>
              )}
            </div>

            {/* Top Creators for Selected Chain */}
            {currentChainStats?.topCreators?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Creators - {currentChainStats.chainName}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Creator ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Wallet</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentChainStats.topCreators.map((creator, index) => (
                        <tr key={creator.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  index === 1 ? 'bg-gray-100 text-gray-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {index + 1}
                                </div>
                              ) : (
                                <span className="text-gray-500 ml-2">#{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-blue-600 font-semibold">#{creator.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">
                              {`${creator.wallet.slice(0, 6)}...${creator.wallet.slice(-4)}`}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              creator.tier === 0 ? 'bg-gray-100 text-gray-800' :
                              creator.tier === 1 ? 'bg-blue-100 text-blue-800' :
                              creator.tier === 2 ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              Tier {creator.tier + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              creator.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {creator.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Chains Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            All Supported Chains
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployedChains.map((chain) => (
              <div
                key={chain.chainId}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  chain.chainId === selectedChainId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setSelectedChainId(chain.chainId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{chain.chainName}</h3>
                  {chain.loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                  {chain.chainId === selectedChainId && <ArrowUpRight className="w-4 h-4 text-blue-600" />}
                </div>
                
                {chain.stats ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tips:</span>
                      <span className="font-medium">{formatAmount(chain.stats.totalTips)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creators:</span>
                      <span className="font-medium">{chain.stats.activeCreators}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transactions:</span>
                      <span className="font-medium">{chain.stats.totalCount}</span>
                    </div>
                  </div>
                ) : chain.error ? (
                  <p className="text-red-500 text-sm">Error loading stats</p>
                ) : (
                  <p className="text-gray-400 text-sm">Click to load stats</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};