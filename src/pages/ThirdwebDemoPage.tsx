// src/pages/ThirdwebDemoPage.tsx
import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Key, UserPlus, Send, RefreshCw, Info } from 'lucide-react';
import type { ApeChainTippingSDK } from '@tippingchain/sdk';

interface ThirdwebDemoPageProps {
  sdk: ApeChainTippingSDK;
}

export const ThirdwebDemoPage: React.FC<ThirdwebDemoPageProps> = ({ sdk }) => {
  const account = useActiveAccount();
  const [activeDemo, setActiveDemo] = useState<'creator' | 'viewer' | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  
  // Demo states
  const [creatorWallet, setCreatorWallet] = useState('');
  const [creatorThirdwebId, setCreatorThirdwebId] = useState('');
  const [viewerWallet, setViewerWallet] = useState('');
  const [viewerThirdwebId, setViewerThirdwebId] = useState('');
  const [searchThirdwebId, setSearchThirdwebId] = useState('');
  const [tipAmount, setTipAmount] = useState('0.1');

  const chainId = 137; // Default to Polygon for demos

  // Demo 1: Register creator with thirdweb ID
  const handleRegisterCreatorWithThirdweb = async () => {
    if (!creatorWallet || !creatorThirdwebId) {
      setResult('❌ Please enter both wallet address and thirdweb ID');
      return;
    }

    setLoading(true);
    try {
      const creatorId = await sdk.addCreator({
        creatorWallet,
        tier: 0, // TIER_1
        thirdwebId: creatorThirdwebId,
        chainId
      });
      
      setResult(`✅ Creator registered successfully!
Creator ID: ${creatorId}
Wallet: ${creatorWallet}
Thirdweb ID: ${creatorThirdwebId}
Chain: Polygon

This creator can now:
• Receive tips using their ID (#${creatorId})
• Be found by their thirdweb ID
• Send rewards to viewers
• Update their wallet if needed`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Demo 2: Find creator by thirdweb ID
  const handleFindCreatorByThirdweb = async () => {
    if (!searchThirdwebId) {
      setResult('❌ Please enter a thirdweb ID to search');
      return;
    }

    setLoading(true);
    try {
      const creatorId = await sdk.getCreatorByThirdwebId(searchThirdwebId, chainId);
      
      if (creatorId && creatorId > 0) {
        const creatorInfo = await sdk.getCreator(creatorId, chainId);
        setResult(`✅ Creator found!
Creator ID: ${creatorId}
Wallet: ${creatorInfo.wallet}
Total Tips: ${(parseFloat(creatorInfo.totalTips) / 1e18).toFixed(4)} MATIC
Tip Count: ${creatorInfo.tipCount}
Active: ${creatorInfo.active ? 'Yes' : 'No'}

You can tip this creator using:
• Creator ID: ${creatorId}
• Thirdweb ID: ${searchThirdwebId}
• Wallet: ${creatorInfo.wallet}`);
      } else {
        setResult('❌ No creator found with this thirdweb ID');
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Demo 3: Register viewer with thirdweb ID
  const handleRegisterViewerWithThirdweb = async () => {
    if (!viewerWallet || !viewerThirdwebId) {
      setResult('❌ Please enter both wallet address and thirdweb ID');
      return;
    }

    setLoading(true);
    try {
      const viewerId = await sdk.registerViewer(viewerWallet, viewerThirdwebId, chainId);
      
      setResult(`✅ Viewer registered successfully!
Viewer ID: ${viewerId}
Wallet: ${viewerWallet}
Thirdweb ID: ${viewerThirdwebId}
Chain: Polygon

This viewer can now:
• Receive rewards using their ID (#${viewerId})
• Be found by their thirdweb ID
• Track their total rewards received
• Update their wallet if needed`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Demo 4: Send reward to viewer using thirdweb ID
  const handleRewardViewerByThirdweb = async () => {
    if (!viewerThirdwebId || !tipAmount) {
      setResult('❌ Please enter viewer thirdweb ID and amount');
      return;
    }

    if (!account) {
      setResult('❌ Please connect your wallet to send rewards');
      return;
    }

    setLoading(true);
    try {
      const result = await sdk.rewardViewer({
        thirdwebId: viewerThirdwebId,
        amount: (parseFloat(tipAmount) * 1e18).toString(),
        reason: 'Demo reward via thirdweb ID',
        chainId
      });

      if (result.success) {
        setResult(`✅ Reward sent successfully!
Transaction: ${result.transactionHash}
Viewer thirdweb ID: ${viewerThirdwebId}
Amount: ${tipAmount} MATIC
Platform Fee (1%): ${(parseFloat(tipAmount) * 0.01).toFixed(6)} MATIC
Viewer Receives: ${(parseFloat(tipAmount) * 0.99).toFixed(6)} MATIC

The reward will be:
• Automatically converted to USDC
• Sent to ApeChain
• Available for withdrawal by the viewer`);
      } else {
        setResult(`❌ Failed to send reward: ${result.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
          <Key className="w-8 h-8 text-orange-600" />
          Thirdweb Integration Demos
        </h1>
        <p className="text-gray-600">
          Explore how TippingChain integrates with thirdweb account IDs for seamless Web3 identity management.
        </p>
      </div>

      {/* Demo Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveDemo('creator')}
          className={`p-6 rounded-lg border-2 transition-all ${
            activeDemo === 'creator'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <UserPlus className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Creator Demos</h3>
          <p className="text-sm text-gray-600">
            Register creators with thirdweb IDs and search by ID
          </p>
        </button>

        <button
          onClick={() => setActiveDemo('viewer')}
          className={`p-6 rounded-lg border-2 transition-all ${
            activeDemo === 'viewer'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Send className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Viewer Demos</h3>
          <p className="text-sm text-gray-600">
            Register viewers and send rewards using thirdweb IDs
          </p>
        </button>
      </div>

      {/* Creator Demos */}
      {activeDemo === 'creator' && (
        <div className="space-y-6">
          {/* Demo 1: Register Creator */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Demo 1: Register Creator with Thirdweb ID</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creator Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={creatorWallet}
                  onChange={(e) => setCreatorWallet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thirdweb Account ID
                </label>
                <input
                  type="text"
                  placeholder="user_abcdef123456"
                  value={creatorThirdwebId}
                  onChange={(e) => setCreatorThirdwebId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleRegisterCreatorWithThirdweb}
                disabled={loading}
                className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Creator'}
              </button>
            </div>
          </div>

          {/* Demo 2: Find Creator */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Demo 2: Find Creator by Thirdweb ID</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Thirdweb ID
                </label>
                <input
                  type="text"
                  placeholder="user_abcdef123456"
                  value={searchThirdwebId}
                  onChange={(e) => setSearchThirdwebId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleFindCreatorByThirdweb}
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Creator'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewer Demos */}
      {activeDemo === 'viewer' && (
        <div className="space-y-6">
          {/* Demo 3: Register Viewer */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Demo 3: Register Viewer with Thirdweb ID</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Viewer Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={viewerWallet}
                  onChange={(e) => setViewerWallet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thirdweb Account ID
                </label>
                <input
                  type="text"
                  placeholder="user_xyz789"
                  value={viewerThirdwebId}
                  onChange={(e) => setViewerThirdwebId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleRegisterViewerWithThirdweb}
                disabled={loading}
                className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Viewer'}
              </button>
            </div>
          </div>

          {/* Demo 4: Reward Viewer */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Demo 4: Send Reward Using Thirdweb ID</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                You must be a registered creator to send viewer rewards
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Viewer Thirdweb ID
                </label>
                <input
                  type="text"
                  placeholder="user_xyz789"
                  value={viewerThirdwebId}
                  onChange={(e) => setViewerThirdwebId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Amount (MATIC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleRewardViewerByThirdweb}
                disabled={loading || !account}
                className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reward'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About Thirdweb Integration
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Thirdweb IDs provide a consistent identity across different wallets</li>
          <li>• Users can update their wallet addresses without losing their history</li>
          <li>• The SDK supports finding users by ID, wallet address, or thirdweb ID</li>
          <li>• All thirdweb accounts automatically get USDC payouts on ApeChain</li>
          <li>• Smart accounts are fully supported for gasless transactions</li>
        </ul>
      </div>
    </div>
  );
};