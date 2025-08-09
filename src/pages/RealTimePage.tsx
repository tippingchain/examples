// src/pages/RealTimePage.tsx
import React, { useState } from 'react';
import { 
  RelayStatusBadge,
  NotificationProvider,
  useNotifications
} from '@tippingchain/ui-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { Play, Zap, Activity, RefreshCw, TrendingUp } from 'lucide-react';

interface RealTimePageProps {
  client: any;
  sdk: any;
}

// Mock Live Balance Display Component
const MockLiveBalanceDisplay: React.FC<{ address: string }> = ({ address }) => {
  const [balance, setBalance] = useState('1.2847');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addNotification } = useNotifications();

  const refreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newBalance = (parseFloat(balance) + (Math.random() - 0.5) * 0.01).toFixed(4);
      setBalance(newBalance);
      setIsRefreshing(false);
      
      addNotification({
        type: 'info',
        title: 'Balance Updated',
        message: `ETH balance refreshed: ${newBalance}`,
        duration: 3000
      });
    }, 1500);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">ETH Balance:</span>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-gray-900">{balance}</span>
            <span className="text-sm text-gray-500">ETH</span>
            <TrendingUp className="text-green-500" size={16} />
          </div>
        </div>
        <button
          onClick={refreshBalance}
          disabled={isRefreshing}
          className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Live</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// Mock Relay Progress Component  
const MockRelayProgress: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState<'pending' | 'relaying' | 'completed'>('pending');
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setStatus('completed');
          clearInterval(interval);
          addNotification({
            type: 'success',
            title: 'Relay Complete! ✅',
            message: 'Funds successfully bridged to ApeChain',
            duration: 6000
          });
          setTimeout(onComplete, 2000);
          return 100;
        }
        
        if (prev >= 50 && status === 'pending') {
          setStatus('relaying');
          addNotification({
            type: 'pending',
            title: 'Relaying Across Chains 🌉',
            message: 'Bridging funds to ApeChain...',
            duration: 0
          });
        }
        
        return prev + Math.random() * 15;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, addNotification, onComplete]);

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'relaying': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Cross-chain Relay</h3>
        <div className="flex items-center space-x-1 text-xs text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="text-sm text-gray-600 text-center mb-4">
        <span className="font-medium">Base</span>
        <span className="mx-2">→</span>
        <span className="font-medium">ApeChain</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{status === 'completed' ? 'Completed' : status === 'relaying' ? 'Relaying' : 'Pending'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center">
        {status === 'completed' ? 'Relay successful!' : 
         status === 'relaying' ? 'Bridging funds to ApeChain' :
         'Waiting for source transaction confirmation'}
      </p>
    </div>
  );
};

export const RealTimePage: React.FC<RealTimePageProps> = ({ client, sdk }) => {
  const account = useActiveAccount();
  const [simulationRunning, setSimulationRunning] = useState(false);

  const startSimulation = () => {
    setSimulationRunning(true);
    
    // Stop simulation after 30 seconds
    setTimeout(() => {
      setSimulationRunning(false);
    }, 30000);
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Activity className="text-blue-600" size={40} />
              Real-time Features Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience live transaction monitoring, balance updates, and cross-chain relay tracking 
              with TippingChain's real-time components.
            </p>
          </div>

          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Wallet Connection
                </h2>
                {account ? (
                  <p className="text-green-600 font-medium">
                    ✅ Connected: {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Connect your wallet to see live balance updates
                  </p>
                )}
              </div>
              <ConnectButton client={client} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Live Balance Display Demo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500" size={24} />
                Live Balance Monitoring
              </h3>
              
              {account ? (
                <MockLiveBalanceDisplay address={account.address} />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-center">
                    Connect wallet to see live balance updates
                  </p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Auto-refresh every 10 seconds</li>
                  <li>• Manual refresh button</li>
                  <li>• Trend indicators (↑ ↓)</li>
                  <li>• Real-time notifications</li>
                  <li>• Multi-token support</li>
                </ul>
              </div>
            </div>

            {/* Relay Progress Demo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="text-green-500" size={24} />
                Cross-chain Relay Tracking
              </h3>

              {!simulationRunning ? (
                <div className="text-center py-8">
                  <button
                    onClick={startSimulation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Start Relay Demo
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Simulates a cross-chain transaction relay
                  </p>
                </div>
              ) : (
                <MockRelayProgress onComplete={() => setSimulationRunning(false)} />
              )}

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Features:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Real-time progress updates</li>
                  <li>• Estimated completion time</li>
                  <li>• Transaction link integration</li>
                  <li>• Status notifications</li>
                  <li>• Chain route visualization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Examples */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Relay Status Examples
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <RelayStatusBadge status="initiated" progress={5} />
              <RelayStatusBadge status="pending" progress={25} />
              <RelayStatusBadge status="relaying" progress={75} />
              <RelayStatusBadge status="completed" progress={100} />
              <RelayStatusBadge status="failed" progress={50} />
            </div>
          </div>

          {/* Implementation Guide */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Implementation Guide
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Live Balance Display</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<LiveBalanceDisplay
  address={userAddress}
  chainId={chainId}
  sdk={sdk}
  tokenSymbol="ETH"
  enableNotifications={true}
  showTrend={true}
/>`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Relay Progress Indicator</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<RelayProgressIndicator
  relayId={relayId}
  sourceChainId={sourceChain}
  destinationChainId={destChain}
  sourceTransactionHash={txHash}
  sdk={sdk}
  showTimeEstimate={true}
/>`}
                </pre>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Real-time Hooks Available:</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <div>• <code>useTransactionMonitor</code> - Monitor transaction status</div>
                <div>• <code>useBalanceWatcher</code> - Watch balance changes</div>
                <div>• <code>useRelayProgress</code> - Track relay progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};