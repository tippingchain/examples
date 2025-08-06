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
  clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID!
});

const sdk = new ApeChainTippingSDK({
  clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID!,
  environment: 'production',
  useTestnet: false, // Use mainnet (Base -> ApeChain)
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