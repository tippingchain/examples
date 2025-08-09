// src/pages/TippingPage.tsx
import React, { useState, useEffect } from 'react';
import { ChainSelector } from '@tippingchain/ui-react';
import { useActiveWalletChain, useActiveAccount, ConnectButton } from 'thirdweb/react';
import { Play, Pause, Users, Eye, Heart, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { MultiTokenTippingInterface } from '../components/MultiTokenTippingInterface';
import type { ApeChainTippingSDK, TipResult } from '@tippingchain/sdk';

interface TippingPageProps {
  client: any;
  sdk: ApeChainTippingSDK;
}

const DEMO_CREATOR_WALLET = '0x479945d7931baC3343967bD0f839f8691E54a66e';
const DEMO_TIPPER_WALLET = '0x65dF34504D2a5D96f4478544D5279B12b3fbEA87';

export const TippingPage: React.FC<TippingPageProps> = ({ client, sdk }) => {
  const activeChain = useActiveWalletChain();
  const account = useActiveAccount();
  const defaultChainId = parseInt(import.meta.env.VITE_APP_DEFAULT_CHAIN_ID || '8453');
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(defaultChainId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);
  const [tipMessage, setTipMessage] = useState<{ type: 'success' | 'error'; text: string; result?: TipResult } | null>(null);

  React.useEffect(() => {
    if (activeChain && !selectedChainId) {
      setSelectedChainId(activeChain.id);
    }
  }, [activeChain, selectedChainId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const isCorrectTipper = account?.address?.toLowerCase() === DEMO_TIPPER_WALLET.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔴 Live Stream - Creator Tip Demo
          </h1>
          <p className="text-xl text-gray-300">
            Watch and tip your favorite creator with TippingChain v2.0
          </p>
        </div>

        {/* Wallet Connection Alert */}
        {!account && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Demo Mode:</strong> Connect with the tipper wallet to test tipping functionality
                  </p>
                  <p className="text-xs text-yellow-600 mt-1 font-mono">
                    Tipper: {DEMO_TIPPER_WALLET}
                  </p>
                </div>
              </div>
              <ConnectButton client={client} theme="light" />
            </div>
          </div>
        )}

        {/* Wrong Wallet Alert */}
        {account && !isCorrectTipper && (
          <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Wrong Wallet:</strong> Please connect with the demo tipper wallet to test the tipping flow
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Expected: <span className="font-mono">{DEMO_TIPPER_WALLET}</span>
                </p>
                <p className="text-xs text-orange-600">
                  Connected: <span className="font-mono">{account.address}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Correct Wallet Alert */}
        {isCorrectTipper && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Ready to Tip!</strong> You're connected with the demo tipper wallet
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Stream Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              {/* Video Player */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                
                {/* Mock Video Content */}
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">TC</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">TippingChain Creator</h3>
                  <p className="text-gray-300 mb-4">Building the future of creator monetization</p>
                  
                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlayPause}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all duration-200"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Live Badge */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE
                </div>

                {/* Viewer Count */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {viewerCount.toLocaleString()}
                </div>
              </div>

              {/* Stream Info Bar */}
              <div className="bg-gray-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white">TC</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">TippingChain Creator</h4>
                        <p className="text-xs text-gray-400 font-mono">{DEMO_CREATOR_WALLET.slice(0, 8)}...{DEMO_CREATOR_WALLET.slice(-6)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-red-500">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-sm">234</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{viewerCount}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">🚀 Live demo of TippingChain v2.0 - Multi-chain tipping with USDC payouts on ApeChain</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tipping Interface */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">💰 Send Tip to Creator</h2>
            
            {/* Creator Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Target Creator</h3>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">Creator ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">#1</span></p>
                <p className="text-gray-600">Wallet:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{DEMO_CREATOR_WALLET}</p>
                <p className="text-green-600 text-xs">✓ Registered & Active</p>
              </div>
            </div>
            
            {/* Chain Selection */}
            <div className="mb-6">
              <ChainSelector
                value={selectedChainId}
                onChange={(chainId) => setSelectedChainId(chainId)}
                label="Select Source Chain"
                className="w-full"
              />
              {selectedChainId && (
                <p className="text-sm text-gray-500 mt-2">
                  Connected to: {activeChain?.name || 'Not connected'}
                </p>
              )}
            </div>

            {/* Multi-Token Tipping Component */}
            {isCorrectTipper ? (
              <MultiTokenTippingInterface
                creatorId={1} // Use creator ID from registry
                client={client}
                sdk={sdk}
                onTipSuccess={(result) => {
                  console.log('Tip successful:', result);
                  setTipMessage({ 
                    type: 'success', 
                    text: `Tip sent successfully! Transaction: ${result.sourceTransactionHash?.slice(0, 10)}...`, 
                    result 
                  });
                  // Clear message after 5 seconds
                  setTimeout(() => setTipMessage(null), 5000);
                }}
                onTipError={(error) => {
                  console.error('Tip failed:', error);
                  setTipMessage({ 
                    type: 'error', 
                    text: `Tip failed: ${error}` 
                  });
                  // Clear message after 5 seconds  
                  setTimeout(() => setTipMessage(null), 5000);
                }}
              />
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">Multi-Token Tipping Interface Locked</p>
                <p className="text-sm text-gray-500">Connect with the demo tipper wallet to unlock multi-token tipping functionality</p>
              </div>
            )}

            {/* Tip Success/Error Message */}
            {tipMessage && (
              <div className={`mt-6 p-4 rounded-lg border flex items-center space-x-3 ${
                tipMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {tipMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{tipMessage.text}</p>
                  {tipMessage.result && tipMessage.result.estimatedUsdcAmount && (
                    <p className="text-sm mt-1">
                      Estimated USDC value: ~${tipMessage.result.estimatedUsdcAmount} 
                      {tipMessage.result.relayId && ` • Relay ID: ${tipMessage.result.relayId}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setTipMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How TippingChain Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Token</h3>
              <p className="text-gray-600">
                Tip with native tokens or ERC20s (USDC, DAI, WETH) on 9 supported blockchains - see real-time balances and token info
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Cross-Chain Bridge</h3>
              <p className="text-gray-600">
                Integrated Relay.link automatically bridges your tip and converts it to stable USDC - no extra steps needed
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Creator Gets Paid</h3>
              <p className="text-gray-600">
                Creator receives stable USDC on ApeChain after 5% platform fee and tier-based revenue sharing
              </p>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Demo Configuration</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Demo Creator:</span>
                <span className="font-mono text-gray-900">{DEMO_CREATOR_WALLET.slice(0, 10)}...{DEMO_CREATOR_WALLET.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Demo Tipper:</span>
                <span className="font-mono text-gray-900">{DEMO_TIPPER_WALLET.slice(0, 10)}...{DEMO_TIPPER_WALLET.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creator ID:</span>
                <span className="font-mono text-gray-900">#1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Split:</span>
                <span className="text-gray-900">60% Creator / 40% Business (Tier 1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};