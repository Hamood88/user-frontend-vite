import { useState } from 'react';
import { AuthPanel } from './AuthPanel';
import { Users, Store } from 'lucide-react';

type AuthMode = 'login' | 'register';
type ActiveSide = 'user' | 'shop' | null;

export function SplitAuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [activeSide, setActiveSide] = useState<ActiveSide>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Brand Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SocialCommerce</h1>
              <p className="text-xs text-slate-500">Join our community marketplace</p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Split Panels */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* User Panel */}
        <AuthPanel
          type="user"
          mode={mode}
          isActive={activeSide === 'user'}
          onFocus={() => setActiveSide('user')}
          icon={Users}
          title="Join as User"
          hint="Shop, earn rewards, and build your network"
        />

        {/* Divider */}
        <div className="lg:w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden lg:block" />
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:hidden" />

        {/* Shop Panel */}
        <AuthPanel
          type="shop"
          mode={mode}
          isActive={activeSide === 'shop'}
          onFocus={() => setActiveSide('shop')}
          icon={Store}
          title="Join as Shop"
          hint="Sell products and grow your business"
        />
      </div>
    </div>
  );
}
