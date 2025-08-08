// src/pages/ViewerRewardsPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { 
  BatchViewerReward,
  ViewerSelector,
  ChainSelector
} from '@tippingchain/ui-react';
import { Award, Users, DollarSign, TrendingUp, Gift, Eye, CheckCircle, Clock, X } from 'lucide-react';

interface ViewerRewardsPageProps {
  client: any;
  sdkConfig: {
    client: any;
    sdk: any;
  };
}

const DEMO_CREATOR_WALLET = '0x479945d7931baC3343967bD0f839f8691E54a66e';
const DEMO_ALLOCATION_AMOUNT = 100; // $100 USD

// Mock viewer data for demo
const MOCK_VIEWERS = [
  { id: 1, username: 'CryptoFan123', wallet: '0x1234567890123456789012345678901234567890', status: 'eligible' },
  { id: 2, username: 'BlockchainBob', wallet: '0x2345678901234567890123456789012345678901', status: 'eligible' },
  { id: 3, username: 'DefiDave', wallet: '0x3456789012345678901234567890123456789012', status: 'claimed' },
  { id: 4, username: 'NFTNinja', wallet: '0x4567890123456789012345678901234567890123', status: 'eligible' },
  { id: 5, username: 'Web3Warrior', wallet: '0x5678901234567890123456789012345678901234', status: 'eligible' },
  { id: 6, username: 'TokenTiger', wallet: '0x6789012345678901234567890123456789012345', status: 'claimed' },
  { id: 7, username: 'MetaverseMax', wallet: '0x7890123456789012345678901234567890123456', status: 'pending' },
  { id: 8, username: 'SmartContractSam', wallet: '0x8901234567890123456789012345678901234567', status: 'eligible' }
];

export const ViewerRewardsPage: React.FC<ViewerRewardsPageProps> = ({ client, sdkConfig }) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [selectedChainId, setSelectedChainId] = useState<number>(8453); // Base default
  const [viewers, setViewers] = useState(MOCK_VIEWERS);
  const [selectedViewers, setSelectedViewers] = useState<number[]>([]);
  const [allocationAmount, setAllocationAmount] = useState(DEMO_ALLOCATION_AMOUNT);
  const [rewardPerViewer, setRewardPerViewer] = useState(0);
  const [activeTab, setActiveTab] = useState<'allocate' | 'claim'>('allocate');

  const isCreatorWallet = account?.address?.toLowerCase() === DEMO_CREATOR_WALLET.toLowerCase();
  const eligibleViewers = viewers.filter(v => v.status === 'eligible');
  const userViewer = viewers.find(v => v.wallet?.toLowerCase() === account?.address?.toLowerCase());

  useEffect(() => {
    if (selectedViewers.length > 0) {
      setRewardPerViewer(allocationAmount / selectedViewers.length);
    } else {
      setRewardPerViewer(0);
    }
  }, [selectedViewers, allocationAmount]);

  const handleViewerToggle = (viewerId: number) => {
    setSelectedViewers(prev => {
      if (prev.includes(viewerId)) {
        return prev.filter(id => id !== viewerId);
      } else {
        return [...prev, viewerId];
      }
    });
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = eligibleViewers.map(v => v.id);
    setSelectedViewers(eligibleIds);
  };

  const handleClearSelection = () => {
    setSelectedViewers([]);
  };

  const handleBatchReward = async () => {
    if (selectedViewers.length === 0) {
      alert('Please select at least one viewer to reward');
      return;
    }

    try {
      // Mock batch reward execution
      const rewardAmount = (allocationAmount / selectedViewers.length).toFixed(2);
      
      // Update viewer statuses to 'pending'
      setViewers(prev => prev.map(viewer => 
        selectedViewers.includes(viewer.id) 
          ? { ...viewer, status: 'pending' }
          : viewer
      ));

      alert(`Batch reward sent! ${selectedViewers.length} viewers will each receive $${rewardAmount} in USDC on ApeChain.`);
      
      // Reset selection
      setSelectedViewers([]);

      // Simulate processing time - after 3 seconds, mark as eligible for claiming
      setTimeout(() => {
        setViewers(prev => prev.map(viewer => 
          selectedViewers.includes(viewer.id) 
            ? { ...viewer, status: 'eligible' }
            : viewer
        ));
      }, 3000);

    } catch (error) {
      console.error('Batch reward error:', error);
      alert('Failed to send batch rewards');
    }
  };

  const handleClaimReward = async (viewerId: number) => {
    try {
      // Mock claim execution
      setViewers(prev => prev.map(viewer => 
        viewer.id === viewerId 
          ? { ...viewer, status: 'claimed' }
          : viewer
      ));

      const viewer = viewers.find(v => v.id === viewerId);
      alert(`Reward claimed! ${viewer?.username} received their USDC on ApeChain.`);
    } catch (error) {
      console.error('Claim error:', error);
      alert('Failed to claim reward');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Award className="w-10 h-10 text-purple-600" />
            Viewer Rewards Demo
          </h1>
          <p className="text-xl text-gray-600">
            Creators allocate funds to reward their audience - viewers can claim eligible rewards
          </p>
        </div>

        {/* Wallet Connection Alerts */}
        {!account && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Demo Mode:</strong> Connect as creator to allocate rewards, or as viewer to claim
                  </p>
                  <p className="text-xs text-yellow-600 mt-1 font-mono">
                    Creator: {DEMO_CREATOR_WALLET}
                  </p>
                </div>
              </div>
              <ConnectButton client={client} theme="light" />
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8">
              <button
                onClick={() => setActiveTab('allocate')}
                className={`py-4 px-6 border-b-2 font-medium text-lg ${
                  activeTab === 'allocate'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Gift className="w-5 h-5 inline mr-2" />
                Batch Reward Allocation
              </button>
              <button
                onClick={() => setActiveTab('claim')}
                className={`py-4 px-6 border-b-2 font-medium text-lg ${
                  activeTab === 'claim'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Claim Rewards
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'allocate' && (
          <div className="space-y-8">
            {/* Creator Access Check */}
            {account && !isCreatorWallet && (
              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      <strong>Creator Access Required:</strong> Only the demo creator can allocate rewards
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Expected: <span className="font-mono">{DEMO_CREATOR_WALLET}</span>
                    </p>
                    <p className="text-xs text-orange-600">
                      Connected: <span className="font-mono">{account.address}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Creator Interface */}
            {isCreatorWallet && (
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>Creator Access Verified!</strong> You can allocate rewards to viewers
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Allocation Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                    Reward Allocation
                  </h2>

                  <div className="space-y-6">
                    {/* Allocation Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Allocation (USD)
                      </label>
                      <input
                        type="number"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(Number(e.target.value))}
                        disabled={!isCreatorWallet}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                        placeholder="100"
                      />
                    </div>

                    {/* Chain Selection */}
                    <div>
                      <ChainSelector
                        value={selectedChainId}
                        onChange={setSelectedChainId}
                        label="Source Chain"
                        className="w-full"
                      />
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Selected Viewers:</span>
                        <span className="font-medium">{selectedViewers.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reward per Viewer:</span>
                        <span className="font-medium">${rewardPerViewer.toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee (1%):</span>
                        <span className="font-medium">${(allocationAmount * 0.01).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t pt-2">
                        <span>Total Cost:</span>
                        <span>${allocationAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleSelectAllEligible}
                        disabled={!isCreatorWallet}
                        className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select All Eligible ({eligibleViewers.length})
                      </button>
                      
                      <button
                        onClick={handleClearSelection}
                        disabled={!isCreatorWallet}
                        className="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear Selection
                      </button>

                      <button
                        onClick={handleBatchReward}
                        disabled={!isCreatorWallet || selectedViewers.length === 0}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Send Batch Rewards
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Viewer Selection */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-blue-600" />
                    Select Viewers to Reward
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {viewers.map((viewer) => (
                      <div
                        key={viewer.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedViewers.includes(viewer.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${viewer.status !== 'eligible' ? 'opacity-60' : ''}`}
                        onClick={() => isCreatorWallet && viewer.status === 'eligible' && handleViewerToggle(viewer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {viewer.username?.charAt(0) || 'V'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{viewer.username}</p>
                              <p className="text-xs text-gray-500 font-mono">
                                {viewer.wallet?.slice(0, 6)}...{viewer.wallet?.slice(-4)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              viewer.status === 'eligible' ? 'bg-green-100 text-green-800' :
                              viewer.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                              viewer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {viewer.status}
                            </div>
                            {selectedViewers.includes(viewer.id) && (
                              <CheckCircle className="w-5 h-5 text-purple-600 mt-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center flex items-center justify-center">
                <Gift className="w-6 h-6 mr-2 text-green-600" />
                Claim Your Rewards
              </h2>

              {!account ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Connect your wallet to check for available rewards</p>
                  <ConnectButton client={client} theme="light" />
                </div>
              ) : userViewer ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {userViewer.username?.charAt(0) || 'V'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome, {userViewer.username}!</h3>
                  
                  {userViewer.status === 'eligible' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
                      <div className="flex items-center justify-center mb-4">
                        <Gift className="w-8 h-8 text-green-600 mr-2" />
                        <span className="text-lg font-semibold text-green-800">Reward Available!</span>
                      </div>
                      <p className="text-green-700 mb-4">
                        You have an unclaimed reward waiting for you
                      </p>
                      <button
                        onClick={() => handleClaimReward(userViewer.id)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Claim Reward
                      </button>
                    </div>
                  )}
                  
                  {userViewer.status === 'claimed' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="w-8 h-8 text-blue-600 mr-2" />
                        <span className="text-lg font-semibold text-blue-800">Already Claimed</span>
                      </div>
                      <p className="text-blue-700">
                        You have successfully claimed your reward. USDC has been sent to your wallet on ApeChain.
                      </p>
                    </div>
                  )}
                  
                  {userViewer.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-8 h-8 text-yellow-600 mr-2" />
                        <span className="text-lg font-semibold text-yellow-800">Processing</span>
                      </div>
                      <p className="text-yellow-700">
                        Your reward is being processed. Please check back soon.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Your wallet is not registered as a viewer in this demo.
                  </p>
                  <p className="text-sm text-gray-500 mt-2 font-mono">
                    Connected: {account.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">How Viewer Rewards Work</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-2 text-purple-600">For Creators:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Allocate a total reward amount (e.g., $100)</li>
                <li>• Select eligible viewers from your audience</li>
                <li>• Funds are split equally among selected viewers</li>
                <li>• Only 1% platform fee (vs 5% for regular tips)</li>
                <li>• All rewards auto-convert to USDC on ApeChain</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">For Viewers:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Check if you have eligible rewards to claim</li>
                <li>• Click "Claim Reward" to receive your USDC</li>
                <li>• Funds are sent directly to your wallet on ApeChain</li>
                <li>• No gas fees for claiming rewards</li>
                <li>• Stable USDC payouts for price protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};