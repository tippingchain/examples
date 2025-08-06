// src/components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from 'thirdweb/react';

interface NavigationProps {
  client: any;
}

export const Navigation: React.FC<NavigationProps> = ({ client }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐒</span>
            <h1 className="text-xl font-bold text-gray-900">
              TippingChain Demo
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isActive('/')
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tipping
            </Link>
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Admin Panel
            </Link>
            <Link
              to="/viewer-rewards"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isActive('/viewer-rewards')
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Viewer Rewards
            </Link>
            
            {/* Wallet Connection */}
            <ConnectButton client={client} theme="light" />
          </div>
        </div>
      </div>
    </nav>
  );
};