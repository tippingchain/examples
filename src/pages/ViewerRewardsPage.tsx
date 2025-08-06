// src/pages/ViewerRewardsPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { 
  ViewerRewardInterface, 
  BatchViewerReward,
  ViewerSelector,
  RewardPoolInterface 
} from '@tippingchain/ui-react';
import { Award, Users, DollarSign, TrendingUp } from 'lucide-react';
import { SUPPORTED_CHAINS, SUPPORTED_TESTNETS } from '@tippingchain/sdk';

interface ViewerRewardsPageProps {
  sdkConfig: {
    client: any;
    sdk: any;
  };
}

const getChainName = (chainId: number): string => {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon', 
    10: 'Optimism',
    56: 'BSC',
    2741: 'Abstract',
    43114: 'Avalanche',
    8453: 'Base',
    42161: 'Arbitrum',
    167000: 'Taiko',
    33139: 'ApeChain',
    17000: 'Ethereum Holesky',
    80002: 'Polygon Amoy',
    33111: 'ApeChain Curtis'
  };
  return chainNames[chainId] || `Chain ${chainId}`;
};

export const ViewerRewardsPage: React.FC<ViewerRewardsPageProps> = ({ sdkConfig }) => {
  const account = useActiveAccount();
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [creatorChainId, setCreatorChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewardStats, setRewardStats] = useState({
    totalRewardsGiven: '0',
    rewardCount: 0
  });
  const [platformStats, setPlatformStats] = useState({
    totalRewards: '0',
    rewardsEnabled: true,
    platformFeeRate: '100'
  });
  const [selectedViewer, setSelectedViewer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'pool' | 'stats'>('single');

  // Check if the connected wallet is a creator
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Try to find creator on all supported chains (v2.0)
        const chains = [
          SUPPORTED_CHAINS.ETHEREUM, SUPPORTED_CHAINS.POLYGON, SUPPORTED_CHAINS.OPTIMISM,
          SUPPORTED_CHAINS.BSC, SUPPORTED_CHAINS.ABSTRACT, SUPPORTED_CHAINS.AVALANCHE,
          SUPPORTED_CHAINS.BASE, SUPPORTED_CHAINS.ARBITRUM, SUPPORTED_CHAINS.TAIKO,
          // Include testnets
          SUPPORTED_TESTNETS.HOLESKY, SUPPORTED_TESTNETS.AMOY
        ];
        
        for (const chainId of chains) {
          try {
            const creator = await sdkConfig.sdk.getCreatorByWallet(account.address, chainId);
            if (creator && creator.id > 0) {
              setCreatorId(creator.id);
              setCreatorChainId(chainId);
              
              // Fetch reward stats
              const stats = await sdkConfig.sdk.getViewerRewardStats(account.address, chainId);
              setRewardStats({
                totalRewardsGiven: stats.totalRewardsGiven,
                rewardCount: stats.rewardCount
              });
              
              console.log(`Creator found on chain ${chainId}`);
              break;
            }
          } catch (err) {
            // Continue checking other chains
          }
        }
        
        // Fetch platform stats
        const pStats = await sdkConfig.sdk.getViewerRewardsPlatformStats(137); // Default to Polygon
        setPlatformStats(pStats);
        
      } catch (err) {
        console.error('Error checking creator status:', err);
        setError('Failed to verify creator status');
      } finally {
        setLoading(false);
      }
    };

    checkCreatorStatus();
  }, [account, sdkConfig.sdk]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to access viewer rewards features.
          </p>
        </div>
      </div>
    );
  }

  if (!creatorId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Creator Access Required</h2>
          <p className="text-gray-600 mb-4">
            Only registered creators can send viewer rewards.
          </p>
          <p className="text-sm text-gray-500">
            Connected wallet: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  if (!platformStats.rewardsEnabled) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Viewer Rewards Temporarily Disabled</h2>
          <p className="text-gray-600">
            The platform administrator has temporarily disabled viewer rewards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-orange-600" />
              Viewer Rewards
            </h1>
            <p className="text-gray-600 mt-2">
              Reward your audience with crypto tokens. Platform fee: {(parseInt(platformStats.platformFeeRate) / 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Creator ID</p>
            <p className="text-2xl font-bold text-orange-600">#{creatorId}</p>
            {creatorChainId && (
              <p className="text-xs text-gray-500 mt-1">
                Registered on {getChainName(creatorChainId)}
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rewards Sent</p>
                <p className="text-2xl font-bold">
                  {(parseFloat(rewardStats.totalRewardsGiven) / 1e18).toFixed(4)} MATIC
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Viewers Rewarded</p>
                <p className="text-2xl font-bold">{rewardStats.rewardCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Total</p>
                <p className="text-2xl font-bold">
                  {(parseFloat(platformStats.totalRewards) / 1e18).toFixed(2)} MATIC
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Single Reward
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'batch'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Batch Rewards
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pool'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reward Pool
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'single' && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Viewer</h2>
              <ViewerSelector
                sdkConfig={sdkConfig}
                onViewerSelect={setSelectedViewer}
                selectedViewerId={selectedViewer?.id}
                allowUnregistered={true}
                className="mb-4"
              />
              {selectedViewer && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    Selected: {selectedViewer.address 
                      ? `${selectedViewer.address.slice(0, 6)}...${selectedViewer.address.slice(-4)}`
                      : `Viewer #${selectedViewer.id}`
                    }
                  </p>
                </div>
              )}
            </div>
            
            <ViewerRewardInterface
              sdkConfig={sdkConfig}
              creatorId={creatorId}
              onRewardSent={(result) => {
                alert(`Reward sent successfully! TX: ${result.transactionHash}`);
                // Refresh stats
                sdkConfig.sdk.getViewerRewardStats(account!.address, 137).then(stats => {
                  setRewardStats({
                    totalRewardsGiven: stats.totalRewardsGiven,
                    rewardCount: stats.rewardCount
                  });
                });
              }}
            />
          </>
        )}

        {activeTab === 'batch' && (
          <div className="lg:col-span-2">
            <BatchViewerReward
              sdkConfig={sdkConfig}
              onBatchSent={(result) => {
                alert(`Batch rewards sent successfully! TX: ${result.transactionHash}`);
                // Refresh stats
                sdkConfig.sdk.getViewerRewardStats(account!.address, 137).then(stats => {
                  setRewardStats({
                    totalRewardsGiven: stats.totalRewardsGiven,
                    rewardCount: stats.rewardCount
                  });
                });
              }}
            />
          </div>
        )}

        {activeTab === 'pool' && (
          <div className="lg:col-span-2">
            <RewardPoolInterface
              sdk={sdkConfig.sdk}
              onSuccess={(result) => {
                alert(`Reward pool distributed successfully! ${result.viewerCount} viewers each received ${(parseFloat(result.perViewerAmount) / 1e18).toFixed(6)} tokens.`);
                // Refresh stats
                sdkConfig.sdk.getViewerRewardStats(account!.address, 137).then(stats => {
                  setRewardStats({
                    totalRewardsGiven: stats.totalRewardsGiven,
                    rewardCount: stats.rewardCount
                  });
                });
              }}
              onError={(error) => {
                console.error('Reward pool error:', error);
                alert(`Failed to create reward pool: ${error.message}`);
              }}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Reward Statistics</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Creator Stats</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rewards Given</span>
                      <span className="font-medium">
                        {(parseFloat(rewardStats.totalRewardsGiven) / 1e18).toFixed(6)} MATIC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Rewards</span>
                      <span className="font-medium">{rewardStats.rewardCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Reward Size</span>
                      <span className="font-medium">
                        {rewardStats.rewardCount > 0 
                          ? (parseFloat(rewardStats.totalRewardsGiven) / 1e18 / rewardStats.rewardCount).toFixed(6)
                          : '0'
                        } MATIC
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Platform Overview</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Platform Rewards</span>
                      <span className="font-medium">
                        {(parseFloat(platformStats.totalRewards) / 1e18).toFixed(4)} MATIC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee Rate</span>
                      <span className="font-medium">
                        {(parseInt(platformStats.platformFeeRate) / 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rewards Status</span>
                      <span className={`font-medium ${platformStats.rewardsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                        {platformStats.rewardsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All viewer rewards are automatically converted to USDC and sent to ApeChain for stable payouts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">How Viewer Rewards Work</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Creators can reward viewers with crypto tokens for engagement</li>
          <li>• Platform fee is only {(parseInt(platformStats.platformFeeRate) / 100).toFixed(1)}% (vs 5% for creator tips)</li>
          <li>• Viewers can be rewarded by ID, wallet address, or Thirdweb ID</li>
          <li>• All rewards are automatically converted to USDC on ApeChain</li>
          <li>• Batch rewards support up to 50 viewers at once</li>
          <li>• Reward pools distribute funds equally among multiple viewers</li>
        </ul>
      </div>
    </div>
  );
};