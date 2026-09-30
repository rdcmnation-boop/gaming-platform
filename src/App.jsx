import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Marketplace from './components/Marketplace';
import AILeaderboard from './components/AILeaderboard';
import PokerGame from './components/PokerGame';
import { TeachingModule } from './components/TeachingModule';
import BettingBotDashboard from './components/BettingBotDashboard';
import AuthModal from './components/AuthModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('poker');
  const [userBalance, setUserBalance] = useState(5000);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎮 RDCM Nation Platform</h1>
          <p>AI Poker & Trading</p>
        </div>
        <div className="header-auth">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button onClick={() => signOut()} className="btn-signout">Sign Out</button>
            </>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="btn-signin">Sign In</button>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'poker' ? 'active' : ''}`}
          onClick={() => setActiveTab('poker')}
        >
          🃏 Poker
        </button>
        <button
          className={`nav-btn ${activeTab === 'teaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('teaching')}
        >
          🎓 Academy
        </button>
        <button
          className={`nav-btn ${activeTab === 'betting' ? 'active' : ''}`}
          onClick={() => setActiveTab('betting')}
        >
          🤖 Betting Bot
        </button>
        <button
          className={`nav-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          🏪 Marketplace
        </button>
        <button
          className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          📊 Leaderboard
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'poker' && <PokerGame />}
        {activeTab === 'teaching' && <TeachingModule />}
        {activeTab === 'betting' && <BettingBotDashboard />}
        {activeTab === 'marketplace' && (
          <Marketplace
            userBalance={userBalance}
            onPurchase={(newBalance) => setUserBalance(newBalance)}
          />
        )}
        {activeTab === 'leaderboard' && <AILeaderboard />}
      </main>

      <footer className="app-footer">
        <p>© 2026 RDCM Nation. All rights reserved. | Free Supabase Backend</p>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
