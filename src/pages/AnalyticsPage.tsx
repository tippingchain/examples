// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { 
  CreatorAnalyticsDashboard,
  ChainSelector,
  type CreatorAnalyticsData,
  type PlatformAnalyticsData
} from '@tippingchain/ui-react';
import type { ApeChainTippingSDK, Creator, PlatformStats, ViewerRewardsPlatformStats } from '@tippingchain/sdk';
import { SUPPORTED_CHAINS, getContractAddress, isContractDeployed } from '@tippingchain/sdk';
import { 
  BarChart3, 
  TrendingUp, 
  Globe,
  AlertCircle,
  CheckCircle,
  Settings,
  Download,
  Calendar,
  Clock,
  Loader2,
  Users,
  RefreshCw
} from 'lucide-react';

interface AnalyticsPageProps {
  client: any;
  sdk: ApeChainTippingSDK;
}

interface ExtendedChainAnalytics {
  chainId: number;
  chainName: string;
  creators: CreatorAnalyticsData[];
  platformStats: PlatformAnalyticsData | null;
  viewerRewardsStats: ViewerRewardsPlatformStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
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

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ client, sdk }) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [selectedChainId, setSelectedChainId] = useState<number>(8453); // Base default
  const [chainAnalytics, setChainAnalytics] = useState<Record<number, ExtendedChainAnalytics>>({});
  const [globalLoading, setGlobalLoading] = useState(false);

  // Initialize chain analytics structure
  useEffect(() => {
    const supportedChainIds = Object.values(SUPPORTED_CHAINS).filter(id => typeof id === 'number') as number[];
    const initialAnalytics: Record<number, ExtendedChainAnalytics> = {};
    
    supportedChainIds.forEach(chainId => {
      if (isContractDeployed(chainId)) {
        initialAnalytics[chainId] = {
          chainId,
          chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
          creators: [],
          platformStats: null,
          viewerRewardsStats: null,
          loading: false,
          error: null,
          lastUpdated: null
        };
      }
    });
    
    setChainAnalytics(initialAnalytics);
  }, []);

  // Enhanced creator data mapping
  const mapCreatorToAnalytics = useCallback((creator: Creator): CreatorAnalyticsData => {
    const avgTip = creator.tipCount > 0 ? parseFloat(creator.totalTips) / creator.tipCount : 0;
    
    return {
      id: creator.id,
      wallet: creator.wallet,
      tier: creator.tier,
      active: creator.active,
      totalTips: creator.totalTips,
      tipCount: creator.tipCount,
      // Enhanced analytics (would come from expanded SDK methods in real implementation)
      averageTipAmount: (avgTip * 1e18).toString(),
      lastTipTimestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Mock: within last 30 days
      topSupporterAddress: '0x' + Math.random().toString(16).substr(2, 40),
      topSupporterAmount: (Math.random() * 5 * 1e18).toString(),
      monthlyTips: (parseFloat(creator.totalTips) * 0.3).toString(), // Mock: 30% of total
      weeklyTips: (parseFloat(creator.totalTips) * 0.1).toString(), // Mock: 10% of total
      dailyTips: (parseFloat(creator.totalTips) * 0.02).toString(), // Mock: 2% of total
      tierUpgradeDate: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000, // Mock: within last 90 days
      viewerRewardsSent: creator.active ? (Math.random() * 2 * 1e18).toString() : '0',
      viewerRewardCount: creator.active ? Math.floor(Math.random() * 50) : 0
    };
  }, []);

  // Enhanced platform stats mapping
  const mapPlatformToAnalytics = useCallback((
    stats: PlatformStats, 
    viewerRewardsStats: ViewerRewardsPlatformStats | null,
    creators: Creator[]
  ): PlatformAnalyticsData => {
    const totalTips = parseFloat(stats.totalTips);
    const avgTipAmount = stats.totalCount > 0 ? totalTips / stats.totalCount : 0;
    
    return {
      totalTips: stats.totalTips,
      totalCount: stats.totalCount,
      totalRelayed: stats.totalRelayed,
      activeCreators: stats.activeCreators,
      autoRelayEnabled: stats.autoRelayEnabled,
      // Enhanced analytics (would come from expanded SDK methods in real implementation)
      avgTipAmount: (avgTipAmount * 1e18).toString(),
      topPerformerIds: creators
        .sort((a, b) => parseFloat(b.totalTips) - parseFloat(a.totalTips))
        .slice(0, 5)
        .map(c => c.id),
      growthRate: Math.random() * 50 + 10, // Mock: 10-60% growth
      viewerRewardsTotal: viewerRewardsStats?.totalRewards || '0',
      platformFeesCollected: (totalTips * 0.05).toString() // 5% platform fee
    };
  }, []);

  // Load analytics for a specific chain
  const loadChainAnalytics = async (chainId: number) => {
    if (!chainAnalytics[chainId]) return;

    setChainAnalytics(prev => ({
      ...prev,
      [chainId]: { ...prev[chainId], loading: true, error: null }
    }));

    try {
      // Load all data in parallel
      const [platformStats, creators, viewerRewardsStats] = await Promise.all([
        sdk.getPlatformStats(chainId).catch(() => null),
        sdk.getTopCreators(50, chainId).catch(() => []),
        sdk.getViewerRewardsPlatformStats(chainId).catch(() => null)
      ]);

      // Map to enhanced analytics format
      const enhancedCreators = creators.map(mapCreatorToAnalytics);
      const enhancedPlatformStats = platformStats ? 
        mapPlatformToAnalytics(platformStats, viewerRewardsStats, creators) : null;

      setChainAnalytics(prev => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          creators: enhancedCreators,
          platformStats: enhancedPlatformStats,
          viewerRewardsStats,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }
      }));

    } catch (error) {
      console.error(`Failed to load analytics for chain ${chainId}:`, error);
      setChainAnalytics(prev => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load analytics'
        }
      }));
    }
  };

  // Load all chains
  const loadAllAnalytics = async () => {
    setGlobalLoading(true);
    const chainIds = Object.keys(chainAnalytics).map(Number);
    
    await Promise.all(chainIds.map(chainId => loadChainAnalytics(chainId)));
    
    setGlobalLoading(false);
  };

  // Load selected chain on mount and when selection changes
  useEffect(() => {
    if (chainAnalytics[selectedChainId] && chainAnalytics[selectedChainId].creators.length === 0) {
      loadChainAnalytics(selectedChainId);
    }
  }, [selectedChainId, chainAnalytics]);

  // Export analytics data
  const handleExportAnalytics = useCallback(() => {
    const currentData = chainAnalytics[selectedChainId];
    if (!currentData) return;

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      chainId: selectedChainId,
      chainName: currentData.chainName,
      analytics: {
        creators: currentData.creators,
        platformStats: currentData.platformStats,
        viewerRewardsStats: currentData.viewerRewardsStats
      },
      metadata: {
        totalCreators: currentData.creators.length,
        activeCreators: currentData.creators.filter(c => c.active).length,
        lastUpdated: currentData.lastUpdated?.toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tippingchain-analytics-${currentData.chainName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedChainId, chainAnalytics]);

  // Handle creator selection (navigate to creator detail)
  const handleCreatorSelect = useCallback((creatorId: number) => {
    // In a real implementation, this would navigate to a creator detail page
    console.log(`Selected creator #${creatorId} for detailed analytics`);
    // For now, we could show an alert with creator info
    const creator = chainAnalytics[selectedChainId]?.creators.find(c => c.id === creatorId);
    if (creator) {
      alert(`Creator #${creatorId} Analytics:\n\nTotal Tips: ${parseFloat(creator.totalTips) / 1e18} ETH\nTransactions: ${creator.tipCount}\nStatus: ${creator.active ? 'Active' : 'Inactive'}\nTier: ${creator.tier}\n\nClick to view detailed analytics (feature coming soon)`);
    }
  }, [selectedChainId, chainAnalytics]);

  const currentChainData = chainAnalytics[selectedChainId];
  const deployedChains = Object.values(chainAnalytics);

  // Calculate global metrics across all chains
  const globalMetrics = React.useMemo(() => {
    const chains = Object.values(chainAnalytics);
    return chains.reduce((totals, chain) => {
      if (chain.platformStats) {
        totals.totalTips += parseFloat(chain.platformStats.totalTips);
        totals.totalTransactions += chain.platformStats.totalCount;
        totals.totalCreators += chain.creators.length;
        totals.activeCreators += chain.creators.filter(c => c.active).length;
        totals.totalRelayed += parseFloat(chain.platformStats.totalRelayed);
      }
      return totals;
    }, {
      totalTips: 0,
      totalTransactions: 0,
      totalCreators: 0,
      activeCreators: 0,
      totalRelayed: 0,
      chainsWithData: chains.filter(c => c.platformStats).length
    });
  }, [chainAnalytics]);

  const formatAmount = (amount: string | number) => {
    try {
      const eth = parseFloat(amount.toString()) / 1e18;
      return eth.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } catch {
      return '0.0000';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            Advanced Creator Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive insights and performance metrics for TippingChain creators
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={loadAllAnalytics}
              disabled={globalLoading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {globalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              {globalLoading ? 'Loading Analytics...' : 'Refresh All Analytics'}
            </button>
            
            {currentChainData && (
              <button
                onClick={handleExportAnalytics}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            )}

            {!account && (
              <ConnectButton client={client} theme="light" />
            )}
          </div>
        </div>

        {/* Global Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Platform Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(globalMetrics.totalTips)} ETH
                </p>
                <p className="text-sm text-gray-500">Across {globalMetrics.chainsWithData} chains</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Creators</p>
                <p className="text-2xl font-bold text-gray-900">{globalMetrics.totalCreators.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{globalMetrics.activeCreators} active</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{globalMetrics.totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-gray-500">All tip transactions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relayed Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(globalMetrics.totalRelayed)} USDC
                </p>
                <p className="text-sm text-gray-500">Cross-chain bridged</p>
              </div>
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activity Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalMetrics.totalCreators > 0 ? Math.round((globalMetrics.activeCreators / globalMetrics.totalCreators) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">Creator engagement</p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Chain Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Chain-Specific Analytics
          </h2>
          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <ChainSelector
                value={selectedChainId}
                onChange={setSelectedChainId}
                label="Select Chain for Detailed Analytics"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                Choose a blockchain to view detailed creator performance metrics
              </p>
            </div>
            {currentChainData?.lastUpdated && (
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {currentChainData.lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Creator Analytics Dashboard */}
        {currentChainData && (
          <CreatorAnalyticsDashboard
            creators={currentChainData.creators}
            platformStats={currentChainData.platformStats}
            chainId={selectedChainId}
            chainName={currentChainData.chainName}
            loading={currentChainData.loading}
            error={currentChainData.error}
            onRefresh={() => loadChainAnalytics(selectedChainId)}
            onCreatorSelect={handleCreatorSelect}
            onExportData={handleExportAnalytics}
            showPlatformStats={true}
            showCreatorRankings={true}
            showTrendAnalysis={true}
            showViewerRewards={true}
            maxCreatorsShown={25}
            className="w-full"
          />
        )}

        {/* Multi-Chain Comparison Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Multi-Chain Performance Comparison
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployedChains.map((chain) => {
              const totalTips = chain.platformStats ? parseFloat(chain.platformStats.totalTips) : 0;
              const activeCreators = chain.creators.filter(c => c.active).length;
              
              return (
                <div
                  key={chain.chainId}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    chain.chainId === selectedChainId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedChainId(chain.chainId)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{chain.chainName}</h3>
                    {chain.loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                    {chain.chainId === selectedChainId && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </div>
                  
                  {chain.error ? (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>Error loading data</span>
                    </div>
                  ) : chain.platformStats ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-medium">{formatAmount(totalTips)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Creators:</span>
                        <span className="font-medium">{activeCreators}/{chain.creators.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-medium">{chain.platformStats.totalCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Tip:</span>
                        <span className="font-medium">
                          {chain.platformStats.totalCount > 0 
                            ? formatAmount((totalTips / chain.platformStats.totalCount).toString()) 
                            : '0'} ETH
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Click to load analytics</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <BarChart3 className="w-6 h-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Advanced Analytics Features</h3>
              <p className="text-blue-800 text-sm mb-3">
                This advanced analytics dashboard provides comprehensive insights into creator performance, 
                platform metrics, and cross-chain activity patterns. All components are available in the 
                @tippingchain/ui-react package for integration into your own applications.
              </p>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Creator performance rankings
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Multi-chain comparison views
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Tier distribution analysis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Viewer rewards tracking
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Data export capabilities
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Real-time metric updates
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};