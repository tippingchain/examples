// examples/demo-app/src/App.tsx
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApeChainTippingSDK } from '@tippingchain/sdk';
import { Navigation } from './components/Navigation';
import { TippingPage } from './pages/TippingPage';
import { AdminPage } from './pages/AdminPage';
import { ViewerRewardsPage } from './pages/ViewerRewardsPage';
import { ThirdwebDemoPage } from './pages/ThirdwebDemoPage';

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'df6b18c1d07bf0cc9287b48180157b10'
});

const sdk = new ApeChainTippingSDK({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'df6b18c1d07bf0cc9287b48180157b10',
  environment: 'production',
  useTestnet: import.meta.env.VITE_APP_NETWORK === 'testnet' || false
});

function App() {
  return (
    <ThirdwebProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation client={client} />
          
          <Routes>
            <Route 
              path="/" 
              element={<TippingPage client={client} sdk={sdk} />} 
            />
            <Route 
              path="/admin" 
              element={<AdminPage sdk={sdk} />} 
            />
            <Route 
              path="/viewer-rewards" 
              element={<ViewerRewardsPage sdkConfig={{ client, sdk }} />} 
            />
            <Route 
              path="/thirdweb-demo" 
              element={<ThirdwebDemoPage sdk={sdk} />} 
            />
          </Routes>
        </div>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;