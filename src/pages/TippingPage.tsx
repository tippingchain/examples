// src/pages/TippingPage.tsx
import React, { useState } from 'react';
import { ApeChainTippingInterface, ChainSelector } from '@tippingchain/ui-react';
import { SUPPORTED_CHAINS, SUPPORTED_TESTNETS } from '@tippingchain/sdk';
import { useActiveWalletChain } from 'thirdweb/react';
import { INITIAL_CREATORS } from '../data/initialCreators';

interface TippingPageProps {
  client: any;
  sdk: any;
}

export const TippingPage: React.FC<TippingPageProps> = ({ client, sdk }) => {
  const activeChain = useActiveWalletChain();
  const defaultChainId = parseInt(import.meta.env.VITE_APP_DEFAULT_CHAIN_ID || '8453');
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(defaultChainId);

  React.useEffect(() => {
    if (activeChain && !selectedChainId) {
      setSelectedChainId(activeChain.id);
    }
  }, [activeChain, selectedChainId]);

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Send Tips to Creators
          </h1>
          <p className="text-xl text-gray-600">
            TippingChain v2.0 - Integrated Relay.link → USDC payouts on ApeChain
          </p>
          <div className="mt-4 space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 mr-2">
              ✨ New: Dynamic tier fees, testnet support (Holesky/Amoy)
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              🎯 Try with Creator #1: {INITIAL_CREATORS[0].wallet.slice(0, 8)}...
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tipping Interface */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Send Tip</h2>
            
            {/* Chain Selection */}
            <div className="mb-4">
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

            <ApeChainTippingInterface
              creatorId={1} // Use creator ID from registry (creator must be registered first)
              streamId="demo-stream"
              sdkConfig={{
                client,
                sdk
              }}
            />
          </div>

          {/* Info Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Choose Your Chain</h3>
                  <p className="text-gray-600 text-sm">
                    Tip with any token on Ethereum, Polygon, Optimism, BSC, Abstract, Avalanche, Base, Arbitrum, or Taiko
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-2 mt-1">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Integrated Auto Relay</h3>
                  <p className="text-gray-600 text-sm">
                    Contract directly bridges via Relay.link and converts to USDC (no separate bridge contracts)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 rounded-full p-2 mt-1">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Dynamic Tier Payouts</h3>
                  <p className="text-gray-600 text-sm">
                    Creator gets USDC on ApeChain: 5% platform fee, then split by tier (60/40, 70/30, 80/20, 90/10)
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">v2.0 Demo Features</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Creator ID: 1 (must be registered by admin first)</p>
                <p>• Dynamic fees: 5% platform + tier-based creator/business split</p>
                <p>• Testnet support: Holesky (ETH), Amoy (Polygon), Curtis (ApeChain)</p>
                <p>• Integrated Relay.link: No separate bridge contracts needed</p>
                <p>• Stable payouts: All tips → USDC on ApeChain</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Supported Chains</h3>
              <div className="text-sm text-gray-600 grid grid-cols-2 gap-1">
                <p>• Ethereum</p>
                <p>• Polygon</p>
                <p>• Optimism</p>
                <p>• BSC</p>
                <p>• Abstract</p>
                <p>• Avalanche</p>
                <p>• Base</p>
                <p>• Arbitrum</p>
                <p>• Taiko</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};