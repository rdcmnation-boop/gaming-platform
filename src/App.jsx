import React, { useState } from 'react';
import './App.css';
import './styles/nexus3036.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Marketplace from './components/Marketplace';
import AILeaderboard from './components/AILeaderboard';
import PokerGame from './components/PokerGame';
import { TeachingModule } from './components/TeachingModule';
import BettingBotDashboard from './components/BettingBotDashboard';
import CryptoMining from './components/CryptoMining';
import Blackjack from './components/Blackjack';
import Slots from './components/Slots';
import Dice from './components/Dice';
import Crash from './components/Crash';
import NexusArena from './components/NexusArena';
import AuthModal from './components/AuthModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('mining');
  const [userBalance, setUserBalance] = useState(5000);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎮 RDCM NATION</h1>
          <p>Nexus Gaming Hub 3036</p>
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
          className={`nav-btn ${activeTab === 'mining' ? 'active' : ''}`}
          onClick={() => setActiveTab('mining')}
        >
          ⛏️ Mining
        </button>
        <button
          className={`nav-btn ${activeTab === 'blackjack' ? 'active' : ''}`}
          onClick={() => setActiveTab('blackjack')}
        >
          ♠️ Blackjack
        </button>
        <button
          className={`nav-btn ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          🎰 Slots
        </button>
        <button
          className={`nav-btn ${activeTab === 'dice' ? 'active' : ''}`}
          onClick={() => setActiveTab('dice')}
        >
          🎲 Dice
        </button>
        <button
          className={`nav-btn ${activeTab === 'crash' ? 'active' : ''}`}
          onClick={() => setActiveTab('crash')}
        >
          📈 Crash
        </button>
        <button
          className={`nav-btn ${activeTab === 'arena' ? 'active' : ''}`}
          onClick={() => setActiveTab('arena')}
        >
          ⚔️ Arena
        </button>
        <button
          className={`nav-btn ${activeTab === 'poker' ? 'active' : ''}`}
          onClick={() => setActiveTab('poker')}
        >
          🃏 Poker
        </button>
        <button
          className={`nav-btn ${activeTab === 'betting' ? 'active' : ''}`}
          onClick={() => setActiveTab('betting')}
        >
          🤖 Betting Bot
        </button>
        <button
          className={`nav-btn ${activeTab === 'teaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('teaching')}
        >
          🎓 Academy
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
        {activeTab === 'mining' && <CryptoMining />}
        {activeTab === 'blackjack' && <Blackjack />}
        {activeTab === 'slots' && <Slots />}
        {activeTab === 'dice' && <Dice />}
        {activeTab === 'crash' && <Crash />}
        {activeTab === 'arena' && <NexusArena />}
        {activeTab === 'poker' && <PokerGame />}
        {activeTab === 'betting' && <BettingBotDashboard />}
        {activeTab === 'teaching' && <TeachingModule />}
        {activeTab === 'marketplace' && (
          <Marketplace
            userBalance={userBalance}
            onPurchase={(newBalance) => setUserBalance(newBalance)}
          />
        )}
        {activeTab === 'leaderboard' && <AILeaderboard />}
      </main>

      <footer className="app-footer">
        <p>© 2026 RDCM NATION | Nexus Gaming Hub | Powered by Claude AI + Supabase</p>
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
