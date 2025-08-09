// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { Plus, Edit, Users, BarChart3, Wallet, CheckCircle, XCircle, Award, Gift, Star, Settings, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { ChainSelector } from '@tippingchain/ui-react';
import type { ApeChainTippingSDK, CreatorRegistration, PlatformStats, MembershipTier } from '@tippingchain/sdk';
import { getContractAddress, isContractDeployed } from '@tippingchain/contracts-interface';
import { getTokensForChain } from '../data/tokenConfig';
import { useTransactionNotifications } from '@tippingchain/ui-react';

interface AdminPageProps {
  client: any;
  sdk: ApeChainTippingSDK;
}

interface Creator {
  id: number;
  wallet: string;
  tier: number;
  active: boolean;
  totalTips: string;
  tipCount: number;
}

const TIER_INFO = {
  1: { name: 'Tier 1', split: '60/40', description: '60% Creator / 40% Business' },
  2: { name: 'Tier 2', split: '70/30', description: '70% Creator / 30% Business' },
  3: { name: 'Tier 3', split: '80/20', description: '80% Creator / 20% Business' },
  4: { name: 'Tier 4', split: '90/10', description: '90% Creator / 10% Business' },
};

export const AdminPage: React.FC<AdminPageProps> = ({ client, sdk }) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedChainId, setSelectedChainId] = useState<number>(8453); // Base default
  const [loading, setLoading] = useState(false);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [newCreatorWallet, setNewCreatorWallet] = useState('');
  const [newCreatorTier, setNewCreatorTier] = useState(1);
  const [editingCreator, setEditingCreator] = useState<{ id: number; wallet: string; tier: number } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(false);

  // Notification hooks
  const { notifyCreatorAdded, notifyCreatorError } = useTransactionNotifications();

  const isContractAvailable = isContractDeployed(selectedChainId);
  const contractAddress = getContractAddress(selectedChainId);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const checkContractPermissions = async () => {
    if (!isContractAvailable || !account) {
      setContractOwner(null);
      return;
    }

    try {
      setCheckingPermission(true);
      const owner = await sdk.getOwner(selectedChainId);
      setContractOwner(owner);
    } catch (error) {
      console.error('Failed to check contract ownership:', error);
      setContractOwner(null);
    } finally {
      setCheckingPermission(false);
    }
  };

  const loadCreators = async () => {
    if (!isContractAvailable) {
      setCreators([]);
      showMessage('error', `Contract not deployed on selected chain (${selectedChainId}). Only Base (8453) is currently supported.`);
      return;
    }

    try {
      setLoadingCreators(true);
      
      // Use fixed SDK method to get creators
      const creatorList = await sdk.getTopCreators(100, selectedChainId);
      
      // Convert to expected Creator type with MembershipTier
      const formattedCreators = creatorList.map(creator => ({
        ...creator,
        tier: (creator.tier || 1) as MembershipTier
      }));
      
      setCreators(formattedCreators);
      showMessage('success', `✅ Loaded ${formattedCreators.length} creators successfully using fixed SDK`);
      
    } catch (error) {
      console.error('Failed to load creators:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Could not resolve method')) {
        showMessage('error', `Contract method not found. The deployed contract may not support creator listing methods.`);
      } else if (errorMessage.includes('call reverted') || errorMessage.includes('execution reverted')) {
        showMessage('error', `Contract call failed. The contract may not be properly deployed or accessible.`);
      } else {
        showMessage('error', `Failed to load creators using SDK: ${errorMessage}`);
      }
      
      setCreators([]);
    } finally {
      setLoadingCreators(false);
    }
  };

  useEffect(() => {
    loadCreators();
    checkContractPermissions();
  }, [selectedChainId, sdk, account]);

  const handleAddCreator = async () => {
    if (!newCreatorWallet.trim()) {
      notifyCreatorError('Please enter a valid wallet address');
      return;
    }

    // Basic wallet address validation
    if (!newCreatorWallet.startsWith('0x') || newCreatorWallet.length !== 42) {
      notifyCreatorError('Please enter a valid Ethereum wallet address (0x...)');
      return;
    }

    // Predict creator ID for the notification (we'll get it from loading after transaction)
    const nextCreatorId = creators.length > 0 ? Math.max(...creators.map(c => c.id)) + 1 : 1;

    try {
      setLoading(true);
      
      // Check if creator already exists in our loaded list
      const existingCreator = creators.find(c => c.wallet.toLowerCase() === newCreatorWallet.toLowerCase());
      if (existingCreator) {
        notifyCreatorError(`Creator with this wallet already exists (ID: ${existingCreator.id})`);
        return;
      }

      if (!isContractAvailable) {
        notifyCreatorError(`Contract not deployed on selected chain (${selectedChainId}). Only Base (8453) is currently supported.`);
        return;
      }
      
      if (selectedChainId !== 8453) {
        notifyCreatorError('Direct creator addition is only supported on Base (8453) currently. Please switch to Base chain.');
        return;
      }

      // Use SDK to prepare the transaction
      const { sendTransaction } = await import('thirdweb');
      
      const preparedTransaction = await sdk.prepareAddCreatorTransaction({
        creatorWallet: newCreatorWallet.trim(),
        tier: (newCreatorTier - 1) as any, // SDK expects 0-based tier
        chainId: selectedChainId
      });
      
      // Send transaction using thirdweb
      const result = await sendTransaction({
        transaction: preparedTransaction.transaction,
        account: account!
      });
      
      // Show success notification with transaction hash
      await notifyCreatorAdded(
        nextCreatorId, 
        newCreatorWallet.trim(), 
        newCreatorTier,
        selectedChainId,
        result.transactionHash
      );
      
      // Also show traditional message for backward compatibility
      showMessage('success', `Creator added successfully! Transaction: ${result.transactionHash.slice(0, 10)}...`);
      
      setNewCreatorWallet('');
      setNewCreatorTier(1);
      
      // Wait a bit for transaction to be mined, then reload creators
      setTimeout(() => {
        loadCreators();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add creator:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('OwnableUnauthorizedAccount')) {
        notifyCreatorError(`Access Denied: Your wallet (${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}) does not have permission to add creators. Only the contract owner can add creators to this contract.`);
      } else if (errorMessage.includes('Could not resolve method')) {
        notifyCreatorError(`SDK-Contract Version Mismatch: The SDK is trying to call methods that don't exist in the deployed contract version.`);
      } else if (errorMessage.includes('call reverted') || errorMessage.includes('execution reverted')) {
        notifyCreatorError(`Transaction failed. Check that you have permission to add creators and sufficient gas.`);
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        notifyCreatorError('Transaction was cancelled by user');
      } else {
        notifyCreatorError(`Failed to add creator: ${errorMessage}`);
      }
      
      // Keep traditional message for backward compatibility  
      if (errorMessage.includes('OwnableUnauthorizedAccount')) {
        showMessage('error', `❌ Access Denied: Your wallet (${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}) does not have permission to add creators. Only the contract owner can add creators to this contract.`);
      } else if (errorMessage.includes('Could not resolve method')) {
        showMessage('error', `SDK-Contract Version Mismatch: The SDK is trying to call methods that don't exist in the deployed contract version.`);
      } else if (errorMessage.includes('call reverted') || errorMessage.includes('execution reverted')) {
        showMessage('error', `Transaction failed. Check that you have permission to add creators and sufficient gas.`);
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        showMessage('error', 'Transaction was cancelled by user');
      } else {
        showMessage('error', `Failed to add creator: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreator = async () => {
    if (!editingCreator || !account) return;

    try {
      setLoading(true);
      
      if (!isContractAvailable) {
        showMessage('error', 'Contract not deployed on selected chain');
        return;
      }
      
      const originalCreator = creators.find(c => c.id === editingCreator.id);
      if (!originalCreator) {
        showMessage('error', 'Creator not found');
        return;
      }
      
      // Update wallet if changed
      if (originalCreator.wallet !== editingCreator.wallet) {
        const success = await sdk.updateCreatorWallet(
          editingCreator.id, 
          editingCreator.wallet, 
          selectedChainId
        );
        if (!success) {
          showMessage('error', 'Failed to update creator wallet');
          return;
        }
      }
      
      // Update tier if changed (SDK uses 0-based tiers)
      if (originalCreator.tier !== editingCreator.tier) {
        const success = await sdk.updateCreatorTier(
          editingCreator.id, 
          (editingCreator.tier - 1) as MembershipTier, 
          selectedChainId
        );
        if (!success) {
          showMessage('error', 'Failed to update creator tier');
          return;
        }
      }
      
      showMessage('success', `Creator ${editingCreator.id} updated successfully`);
      setEditingCreator(null);
      
      // Reload creators to get updated data
      await loadCreators();
    } catch (error) {
      console.error('Failed to update creator:', error);
      showMessage('error', 'Failed to update creator');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreatorStatus = async (creatorId: number) => {
    if (!account) {
      showMessage('error', 'Please connect your wallet first');
      return;
    }

    if (!isContractAvailable) {
      showMessage('error', 'Contract not deployed on selected chain');
      return;
    }

    try {
      setLoading(true);
      
      const creator = creators.find(c => c.id === creatorId);
      if (!creator) {
        showMessage('error', 'Creator not found');
        return;
      }
      
      // Note: The current SDK doesn't have setCreatorStatus method
      // This would require a contract method that doesn't exist in current interface
      // For now, we'll show a message that this feature isn't implemented
      showMessage('error', 'Creator status toggle is not yet implemented in the current contract version');
    } catch (error) {
      console.error('Failed to toggle creator status:', error);
      showMessage('error', 'Transaction failed or was rejected');
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

  const getTierBadgeColor = (tier: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800', 
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-gold-100 text-gold-800'
    };
    return colors[tier as keyof typeof colors] || colors[1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            Creator Management
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 mb-4">
            ✨ Demo: with tier management and status controls
          </div>
        </div>

        {/* Wallet Connection Alerts */}
        {!account && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Wallet Connection Required:</strong> Connect your wallet to manage creators on this network
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Select a network with deployed contract to begin
                  </p>
                </div>
              </div>
              <ConnectButton client={client} theme="light" />
            </div>
          </div>
        )}

        {/* Wallet Connected */}
        {account && isContractAvailable && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Wallet Connected!</strong> Connected to {account.address}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Contract: {contractAddress}
                </p>
                {checkingPermission ? (
                  <p className="text-xs text-blue-600 mt-1">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    Checking permissions...
                  </p>
                ) : contractOwner ? (
                  <p className="text-xs mt-1">
                    {contractOwner.toLowerCase() === account.address?.toLowerCase() ? (
                      <span className="text-green-600 font-medium">✅ You are the contract owner - can add creators</span>
                    ) : (
                      <span className="text-red-600 font-medium">❌ Not owner - cannot add creators (Owner: {contractOwner.slice(0, 6)}...{contractOwner.slice(-4)})</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-600 mt-1">⚠️ Permission check failed</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chain Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Network Configuration
          </h2>
          
          {/* Current deployment status */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Limited Deployment Status</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Currently, TippingChain contracts are only deployed on <strong>Base (8453)</strong>. 
                  Other networks will show contract method errors until deployment is completed.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  ✅ Base (8453) - Contract deployed and fully functional<br/>
                  ❌ Other networks - Coming soon
                </p>
              </div>
            </div>
          </div>
          
          <div className="max-w-md">
            <ChainSelector
              value={selectedChainId}
              onChange={setSelectedChainId}
              label="Select Chain"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              Creator management applies to the selected network
            </p>
            {!isContractAvailable && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠️ Contract not deployed on selected chain
              </p>
            )}
            {isContractAvailable && (
              <p className="text-sm text-green-600 mt-1 font-medium">
                ✅ Contract available: {contractAddress?.slice(0, 10)}...
              </p>
            )}
          </div>
        </div>

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

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Creators</p>
                <p className="text-2xl font-bold text-gray-900">{creators.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Creators</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creators.filter(c => c.active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(creators.reduce((sum, c) => sum + parseFloat(c.totalTips), 0).toString())}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creators.reduce((sum, c) => sum + c.tipCount, 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Add Creator */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Creator
            {(!account || !isContractAvailable) && <span className="ml-2 text-sm text-red-600">(Wallet & Contract Required)</span>}
          </h2>
          
          {/* SDK Integration Notice */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <strong>SDK Integration:</strong> Using official TippingChain SDK prepareAddCreatorTransaction() method.
                This provides proper contract interaction with wallet integration for secure creator management.
              </div>
            </div>
          </div>

          {/* Permission Notice */}
          {contractOwner && account && contractOwner.toLowerCase() !== account?.address?.toLowerCase() && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <strong>Access Denied:</strong> Only the contract owner can add creators. 
                  Current owner: <code className="bg-red-100 px-1 rounded text-xs">{contractOwner.slice(0, 10)}...{contractOwner.slice(-6)}</code>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creator Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={newCreatorWallet}
                onChange={(e) => setNewCreatorWallet(e.target.value)}
                disabled={!account || !isContractAvailable}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membership Tier
              </label>
              <select
                value={newCreatorTier}
                onChange={(e) => setNewCreatorTier(Number(e.target.value))}
                disabled={!account || !isContractAvailable}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                {Object.entries(TIER_INFO).map(([tier, info]) => (
                  <option key={tier} value={tier}>
                    {info.name} - {info.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleAddCreator}
                disabled={loading || !account || !isContractAvailable || !newCreatorWallet.trim() || (contractOwner && contractOwner.toLowerCase() !== account?.address?.toLowerCase())}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Creator</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tier Revenue Splits:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(TIER_INFO).map(([tier, info]) => (
                <div key={tier} className="text-blue-700">
                  <span className="font-medium">{info.name}:</span> {info.split}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              All splits are after 5% platform fee is deducted
            </p>
          </div>
        </div>

        {/* Creator List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Creator Management ({creators.length} creators)
            </h2>
            <button
              onClick={() => loadCreators()}
              disabled={loadingCreators}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingCreators ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loadingCreators ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Wallet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Tips</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Transactions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr key={creator.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-mono text-lg font-semibold text-blue-600">#{creator.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      {editingCreator?.id === creator.id ? (
                        <input
                          type="text"
                          value={editingCreator.wallet}
                          onChange={(e) => setEditingCreator({
                            ...editingCreator,
                            wallet: e.target.value
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                        />
                      ) : (
                        <span className="font-mono text-sm">
                          {`${creator.wallet.slice(0, 6)}...${creator.wallet.slice(-4)}`}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingCreator?.id === creator.id ? (
                        <select
                          value={editingCreator.tier}
                          onChange={(e) => setEditingCreator({
                            ...editingCreator,
                            tier: Number(e.target.value)
                          })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {Object.entries(TIER_INFO).map(([tier, info]) => (
                            <option key={tier} value={tier}>
                              {info.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(creator.tier)}`}>
                            {TIER_INFO[creator.tier as keyof typeof TIER_INFO]?.name || 'Unknown'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {TIER_INFO[creator.tier as keyof typeof TIER_INFO]?.split}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleCreatorStatus(creator.id)}
                        disabled={!account || !isContractAvailable || loading}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          creator.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${(!account || !isContractAvailable || loading) ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {creator.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{formatAmount(creator.totalTips)} ETH</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{creator.tipCount}</span>
                    </td>
                    <td className="py-4 px-4">
                      {editingCreator?.id === creator.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateCreator}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCreator(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCreator({
                            id: creator.id,
                            wallet: creator.wallet,
                            tier: creator.tier
                          })}
                          disabled={!account || !isContractAvailable || loading}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Loading State */}
            {loadingCreators && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading creators from contract...</p>
                <p className="text-xs text-gray-500 mt-1">Using direct contract calls</p>
              </div>
            )}

            {/* Empty State */}
            {creators.length === 0 && !loadingCreators && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No creators found on this network.</p>
                {isContractAvailable ? (
                  <p className="text-sm mt-2">Add your first creator above to get started.</p>
                ) : (
                  <p className="text-sm mt-2">Please select a network with a deployed contract.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Supported Tokens Management */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Supported Tokens Configuration
            </h3>
            {account && isContractAvailable && (
              <button
                onClick={() => {/* Add new token functionality */}}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </button>
            )}
          </div>

          {/* Chain selector for token management */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Chain to Configure Tokens
            </label>
            <div className="w-64">
              <ChainSelector
                value={selectedChainId}
                onChange={(chainId) => setSelectedChainId(chainId)}
                label=""
                className="w-full"
              />
            </div>
          </div>

          {/* Token configuration table */}
          <div className="overflow-x-auto">
            {(() => {
              const chainTokens = getTokensForChain(selectedChainId);
              if (!chainTokens) {
                return (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No token configuration found for selected chain.</p>
                  </div>
                );
              }
              
              const allTokens = [chainTokens.native, ...chainTokens.tokens];
              
              return (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Token</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Address</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Decimals</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allTokens.map((token, index) => (
                      <tr key={index}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{token.icon}</span>
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-sm text-gray-500">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-xs">
                            {token.address ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}` : 'Native Token'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm">{token.decimals}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            !token.address 
                              ? 'bg-blue-100 text-blue-800' 
                              : token.isStable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {!token.address ? 'Native' : token.isStable ? 'Stablecoin' : 'ERC20'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            token.popular || token.isStable || !token.address
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {token.popular || token.isStable || !token.address ? 'Active' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>

          {/* Token management info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Token Configuration Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Native tokens are automatically supported on each chain</li>
              <li>• Popular tokens (USDC, USDT, DAI) are pre-configured and prioritized</li>
              <li>• All tokens automatically bridge to USDC on ApeChain via Relay.link</li>
              <li>• Token selection is managed through the main tipping interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};