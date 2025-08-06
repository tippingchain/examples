// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { Plus, Edit, Users, BarChart3, Wallet, CheckCircle, XCircle, Award, Gift, Star } from 'lucide-react';
import type { ApeChainTippingSDK } from '@tippingchain/sdk';
import { INITIAL_CREATORS, getInitialCreatorByWallet } from '../data/initialCreators';

interface AdminPageProps {
  sdk: ApeChainTippingSDK;
}

interface Creator {
  id: number;
  wallet: string;
  active: boolean;
  totalTips: string;
  tipCount: number;
}

interface PlatformStats {
  totalTips: string;
  totalCount: number;
  totalRelayed: string;
  activeCreators: number;
  autoRelayEnabled: boolean;
}

interface ViewerRewardStats {
  totalRewards: string;
  rewardsEnabled: boolean;
  platformFeeRate: string;
}

interface OwnerInfo {
  owner: string;
  businessOwner: string;
  isUserOwner: boolean;
}

export const AdminPage: React.FC<AdminPageProps> = ({ sdk }) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [viewerRewardStats, setViewerRewardStats] = useState<ViewerRewardStats | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCreatorWallet, setNewCreatorWallet] = useState('');
  const [editingCreator, setEditingCreator] = useState<{ id: number; wallet: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const chainId = activeChain?.id || 8453; // Default to Base mainnet

  // Load creators and stats
  useEffect(() => {
    if (activeChain) {
      loadData();
    }
  }, [activeChain, sdk]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load top creators (this will get all active creators)
      const topCreators = await sdk.getTopCreators(50, chainId);
      setCreators(topCreators);

      // Load platform stats
      const platformStats = await sdk.getPlatformStats(chainId);
      setStats(platformStats);
      
      // Load viewer reward stats
      try {
        const viewerStats = await sdk.getViewerRewardsPlatformStats(chainId);
        setViewerRewardStats(viewerStats);
      } catch (error) {
        console.error('Failed to load viewer reward stats:', error);
      }

      // Load owner information
      try {
        const [owner, businessOwner] = await Promise.all([
          sdk.getOwner(chainId),
          sdk.getBusinessOwner(chainId)
        ]);
        const isUserOwner = account?.address ? 
          await sdk.isOwner(chainId, account.address) : false;
        
        setOwnerInfo({
          owner,
          businessOwner,
          isUserOwner
        });
      } catch (error) {
        console.error('Failed to load owner info:', error);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddCreator = async () => {
    if (!newCreatorWallet.trim()) {
      showMessage('error', 'Please enter a valid wallet address');
      return;
    }

    if (!account) {
      showMessage('error', 'Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const creatorId = await sdk.addCreator({
        creatorWallet: newCreatorWallet.trim(),
        tier: 0, // Default to Tier 1 (60/40 split)
        chainId
      });
      
      showMessage('success', `Creator added successfully with ID: ${creatorId} (Tier 1: 60/40 split)`);
      setNewCreatorWallet('');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to add creator:', error);
      showMessage('error', 'Failed to add creator. Make sure you have owner permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreatorWallet = async () => {
    if (!editingCreator) return;

    try {
      setLoading(true);
      const success = await sdk.updateCreatorWallet(
        editingCreator.id,
        editingCreator.wallet,
        chainId
      );

      if (success) {
        showMessage('success', 'Creator wallet updated successfully');
        setEditingCreator(null);
        await loadData(); // Refresh data
      } else {
        showMessage('error', 'Failed to update creator wallet');
      }
    } catch (error) {
      console.error('Failed to update creator wallet:', error);
      showMessage('error', 'Failed to update creator wallet');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    try {
      const eth = parseFloat(amount) / 1e18;
      return eth.toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Connect Wallet Required
            </h2>
            <p className="text-gray-600">
              Please connect your wallet to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Panel v2.0
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Manage creators, view stats, and monitor integrated Relay.link system
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 mb-4">
            ✨ New: Dynamic tier fees, simplified architecture, enhanced analytics
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Current Network: <span className="font-medium">{activeChain?.name || 'Unknown'}</span> (Chain ID: {chainId})
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Creator management applies to the selected network
            </p>
          </div>
        </div>

        {/* Owner Permissions Section */}
        {ownerInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Wallet className="w-6 h-6 mr-2" />
                Contract Ownership & Permissions
              </h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                ownerInfo.isUserOwner 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {ownerInfo.isUserOwner ? '✓ Admin Access' : '✗ Read Only'}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Contract Owner</h3>
                <p className="text-sm font-mono bg-gray-50 p-3 rounded-lg break-all">
                  {ownerInfo.owner}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Can add creators, update contract settings
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Business Owner</h3>
                <p className="text-sm font-mono bg-gray-50 p-3 rounded-lg break-all">
                  {ownerInfo.businessOwner}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Receives business share from creator tips
                </p>
              </div>
            </div>

            {!ownerInfo.isUserOwner && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <XCircle className="w-5 h-5 mr-2" />
                  <p className="text-sm">
                    <strong>Limited Access:</strong> You are not the contract owner. 
                    Creator management functions are disabled. Connect with the owner wallet to add creators.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Platform Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tips</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(stats.totalTips)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tip Count</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCount}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Relayed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(stats.totalRelayed)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Creators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeCreators}
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Viewer Rewards Statistics */}
        {viewerRewardStats && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Viewer Rewards Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Viewer Rewards</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatAmount(viewerRewardStats.totalRewards)}
                    </p>
                  </div>
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Platform Fee Rate</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(parseInt(viewerRewardStats.platformFeeRate) / 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-blue-600 mt-1">vs 5% for tips</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Status</p>
                    <p className="text-2xl font-bold text-green-900">
                      {viewerRewardStats.rewardsEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {viewerRewardStats.rewardsEnabled ? 'Accepting rewards' : 'Temporarily paused'}
                    </p>
                  </div>
                  {viewerRewardStats.rewardsEnabled ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Viewer Rewards</strong> allow creators to tip their audience members directly. 
                The reduced platform fee of {(parseInt(viewerRewardStats.platformFeeRate) / 100).toFixed(1)}% 
                (compared to 5% for creator tips) encourages community engagement. All rewards are 
                automatically converted to USDC on ApeChain for stable payouts.
              </p>
            </div>
          </div>
        )}

        {/* Initial Creator Setup */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-orange-600" />
            Initial Demo Creator
          </h2>
          
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Recommended Initial Creator</h3>
                <p className="text-sm text-gray-600">Pre-configured for demo purposes</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Tier 1 (60/40)
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Wallet Address:</span>
                <p className="font-mono text-gray-900 break-all mt-1">{INITIAL_CREATORS[0].wallet}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue Split: 60% creator / 40% business</span>
                <button
                  onClick={() => setNewCreatorWallet(INITIAL_CREATORS[0].wallet)}
                  disabled={ownerInfo && !ownerInfo.isUserOwner}
                  className="text-orange-600 hover:text-orange-700 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use This Address →
                </button>
              </div>
            </div>
            
            {ownerInfo && !ownerInfo.isUserOwner && (
              <div className="mt-3 p-3 bg-gray-50 rounded border text-xs text-gray-600">
                💡 Only the contract owner can add creators. This address is recommended for initial setup.
              </div>
            )}
          </div>
        </div>

        {/* Add Creator */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Creator
            {ownerInfo && !ownerInfo.isUserOwner && (
              <span className="ml-2 text-sm text-red-600">(Owner Only)</span>
            )}
          </h2>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Creator wallet address (0x...)"
              value={newCreatorWallet}
              onChange={(e) => setNewCreatorWallet(e.target.value)}
              disabled={ownerInfo && !ownerInfo.isUserOwner}
              className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                ownerInfo && !ownerInfo.isUserOwner ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={handleAddCreator}
              disabled={loading || (ownerInfo && !ownerInfo.isUserOwner)}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Creator</span>
            </button>
          </div>
          
          {ownerInfo && !ownerInfo.isUserOwner && (
            <div className="mt-3 text-sm text-gray-600">
              💡 Only the contract owner can add new creators. Current owner: {ownerInfo.owner.slice(0, 8)}...
            </div>
          )}
        </div>

        {/* Creator List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Creator Management
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading creators...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Wallet</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Tips</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tip Count</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => (
                    <tr key={creator.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{creator.id}</td>
                      <td className="py-3 px-4">
                        {editingCreator?.id === creator.id ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editingCreator.wallet}
                              onChange={(e) => setEditingCreator({
                                ...editingCreator,
                                wallet: e.target.value
                              })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={handleUpdateCreatorWallet}
                              className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCreator(null)}
                              className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-sm">
                            {`${creator.wallet.slice(0, 6)}...${creator.wallet.slice(-4)}`}
                          </span>
                        )}
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
                      <td className="py-3 px-4 font-mono text-sm">
                        {formatAmount(creator.totalTips)}
                      </td>
                      <td className="py-3 px-4">{creator.tipCount}</td>
                      <td className="py-3 px-4">
                        {editingCreator?.id !== creator.id && (
                          <button
                            onClick={() => setEditingCreator({
                              id: creator.id,
                              wallet: creator.wallet
                            })}
                            className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-800"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {creators.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-600">
                  No creators found. Add your first creator above.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};