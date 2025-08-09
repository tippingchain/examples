// src/components/MultiTokenTippingInterface.tsx
import React, { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { 
  Coins, 
  ArrowRight, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Wallet,
  ExternalLink
} from 'lucide-react';
import { 
  getAllTokensForChain, 
  formatTokenAmount, 
  isNativeToken,
  TokenConfig 
} from '../data/tokenConfig';
import type { ApeChainTippingSDK, TipParams, TipResult } from '@tippingchain/sdk';

interface MultiTokenTippingInterfaceProps {
  creatorId: number;
  client: any;
  sdk: ApeChainTippingSDK;
  onTipSuccess?: (result: TipResult) => void;
  onTipError?: (error: string) => void;
}

enum ApprovalState {
  NONE = 'none',
  NEEDED = 'needed',
  PENDING = 'pending',
  APPROVED = 'approved'
}

export const MultiTokenTippingInterface: React.FC<MultiTokenTippingInterfaceProps> = ({
  creatorId,
  client,
  sdk,
  onTipSuccess,
  onTipError
}) => {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.NONE);
  const [conversionQuote, setConversionQuote] = useState<any>(null);
  const [balanceWarning, setBalanceWarning] = useState<string>('');
  
  const chainTokens = activeChain ? getAllTokensForChain(activeChain.id) : [];
  const userBalance = '0'; // Real token balance would come from SDK/contract query

  // Set default token (native) when chain changes
  useEffect(() => {
    if (chainTokens.length > 0 && !selectedToken) {
      setSelectedToken(chainTokens[0]); // First token is always native
    }
  }, [chainTokens, selectedToken]);

  // Check balance and approval when token/amount changes
  useEffect(() => {
    if (!selectedToken || !amount || !account) {
      setBalanceWarning('');
      setApprovalState(ApprovalState.NONE);
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(userBalance);
    
    // Check balance
    if (amountNum > balanceNum) {
      setBalanceWarning(`Insufficient ${selectedToken.symbol} balance. You have ${formatTokenAmount(userBalance, selectedToken.decimals)}`);
    } else {
      setBalanceWarning('');
    }

    // Check if approval is needed for ERC20 tokens
    if (selectedToken.address) { // ERC20 token
      // Mock approval check - in real app this would check allowance
      setApprovalState(ApprovalState.NEEDED);
    } else { // Native token
      setApprovalState(ApprovalState.NONE);
    }
  }, [selectedToken, amount, userBalance, account]);

  // Get conversion quote
  useEffect(() => {
    if (!amount || !selectedToken || !activeChain) {
      setConversionQuote(null);
      return;
    }

    const getQuote = async () => {
      try {
        // Mock conversion calculation
        const amountNum = parseFloat(amount);
        let usdValue = amountNum;
        
        // Mock USD conversion rates
        const rates: Record<string, number> = {
          'ETH': 2400,
          'MATIC': 0.85,
          'BNB': 320,
          'AVAX': 35,
          'APE': 1.2,
          'USDC': 1,
          'USDT': 1,
          'DAI': 1,
          'BUSD': 1
        };
        
        const rate = rates[selectedToken.symbol] || 1;
        usdValue = amountNum * rate;
        
        const platformFee = usdValue * 0.05; // 5%
        const afterPlatformFee = usdValue - platformFee;
        
        // Mock tier-based split (assuming Tier 1: 60/40)
        const creatorShare = afterPlatformFee * 0.6;
        const businessShare = afterPlatformFee * 0.4;
        
        setConversionQuote({
          inputAmount: amountNum,
          inputToken: selectedToken.symbol,
          usdValue: usdValue,
          platformFee: platformFee,
          creatorShare: creatorShare,
          businessShare: businessShare,
          estimatedUsdc: usdValue * 0.98, // Mock relay fee
          relayFee: usdValue * 0.02
        });
      } catch (error) {
        console.error('Quote calculation failed:', error);
        setConversionQuote(null);
      }
    };

    const debounceTimer = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, selectedToken, activeChain]);

  const handleApprove = async () => {
    if (!selectedToken?.address || !amount) return;
    
    setApprovalState(ApprovalState.PENDING);
    setIsLoading(true);
    
    try {
      // Mock approval transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setApprovalState(ApprovalState.APPROVED);
      
      // In real implementation:
      // const tx = await sdk.approveToken(selectedToken.address, amount);
      // await tx.wait();
      
    } catch (error) {
      console.error('Approval failed:', error);
      setApprovalState(ApprovalState.NEEDED);
      onTipError?.('Token approval failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTip = async () => {
    if (!selectedToken || !amount || !account || !activeChain) return;
    
    setIsLoading(true);
    
    try {
      // Prepare tip parameters
      const tipParams: TipParams = {
        sourceChainId: activeChain.id,
        creatorId: creatorId,
        token: selectedToken.address || 'native', // 'native' for ETH/native tokens
        amount: amount // Amount in token units (e.g., "1.5" for 1.5 ETH)
      };
      
      // Send the tip via SDK
      const result = await sdk.sendTip(tipParams);
      
      if (result.success) {
        onTipSuccess?.(result);
        
        // Reset form
        setAmount('');
        setConversionQuote(null);
        setApprovalState(ApprovalState.NONE);
      } else {
        throw new Error(result.error || 'Tip transaction failed');
      }
      
    } catch (error) {
      console.error('Tip failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed or was rejected';
      onTipError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canTip = selectedToken && 
    amount && 
    !balanceWarning && 
    !isLoading &&
    (approvalState === ApprovalState.NONE || approvalState === ApprovalState.APPROVED);

  if (!chainTokens.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Unsupported chain. Please switch to a supported network.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Target className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Multi-Token Tip → ApeChain
        </h3>
      </div>

      {/* Creator Info */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="text-sm text-gray-600">Tipping Creator</div>
        <div className="font-medium text-gray-800">ID #{creatorId}</div>
        <div className="text-xs text-gray-500">Wallet recovery supported</div>
      </div>

      {/* Token Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Token
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {chainTokens.map((token) => {
              const balance = '0'; // Real balance would come from SDK/contract query
              const isSelected = selectedToken?.symbol === token.symbol;
              
              return (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{token.icon}</span>
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                      <div className="text-xs text-gray-500">{token.name}</div>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <Wallet className="w-3 h-3 inline mr-1" />
                    {formatTokenAmount(balance, token.decimals)}
                  </div>
                  {token.isStable && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Stablecoin
                    </div>
                  )}
                  {token.popular && (
                    <div className="text-xs text-orange-600 font-medium mt-1">
                      Popular
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        {selectedToken && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to tip
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  balanceWarning ? 'border-red-300' : 'border-gray-300'
                }`}
                step={selectedToken.decimals === 6 ? '0.01' : '0.001'}
              />
              <div className="absolute right-3 top-2 text-sm text-gray-500">
                {selectedToken.symbol}
              </div>
            </div>
            
            {/* Balance Display */}
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-600">
                Balance: {formatTokenAmount(userBalance, selectedToken.decimals)} {selectedToken.symbol}
              </span>
              <button 
                onClick={() => setAmount((parseFloat(userBalance) * 0.95).toString())}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Max
              </button>
            </div>
            
            {/* Balance Warning */}
            {balanceWarning && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {balanceWarning}
              </div>
            )}
          </div>
        )}

        {/* Conversion Preview */}
        {amount && conversionQuote && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Coins className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-800">
                Auto-conversion to USDC on ApeChain
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>You send:</span>
                <span className="font-medium">
                  {conversionQuote.inputAmount} {conversionQuote.inputToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>USD Value:</span>
                <span className="font-medium">
                  ${conversionQuote.usdValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-center text-blue-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex justify-between text-red-600">
                <span>Platform fee (5%):</span>
                <span className="font-medium">
                  -${conversionQuote.platformFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-green-600">
                  <span>Creator gets (60%):</span>
                  <span className="font-medium">
                    ~${conversionQuote.creatorShare.toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Business gets (40%):</span>
                  <span className="font-medium">
                    ~${conversionQuote.businessShare.toFixed(2)} USDC
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                * Final amounts may vary due to market conditions and relay fees
              </div>
            </div>
          </div>
        )}

        {/* Approval Step */}
        {approvalState !== ApprovalState.NONE && (
          <div className="space-y-2">
            {approvalState === ApprovalState.NEEDED && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-yellow-800">
                      Token approval required
                    </div>
                    <div className="text-xs text-yellow-600">
                      Allow TippingChain to spend your {selectedToken?.symbol}
                    </div>
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Approve'
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {approvalState === ApprovalState.PENDING && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                  <span className="text-sm text-blue-700">
                    Approval transaction pending...
                  </span>
                </div>
              </div>
            )}
            
            {approvalState === ApprovalState.APPROVED && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-700">
                    Token approved! You can now send the tip.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tip Button */}
        <button 
          onClick={handleTip}
          disabled={!canTip}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            canTip
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            `Send ${selectedToken?.symbol || ''} Tip → ApeChain`
          )}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <div className="font-medium mb-1">💡 How it works:</div>
          <ul className="space-y-1">
            <li>• Your {selectedToken?.symbol} is automatically bridged via Relay.link</li>
            <li>• Converted to stable USDC on ApeChain</li>
            <li>• Creator receives funds in their wallet</li>
            <li>• {selectedToken?.address ? 'Token approval required first' : 'Native token - no approval needed'}</li>
          </ul>
          <div className="mt-2 pt-2 border-t">
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Learn more about cross-chain tipping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};