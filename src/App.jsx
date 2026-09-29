import React, { useState } from 'react';
import './App.css';
import Marketplace from './components/Marketplace';
import AILeaderboard from './components/AILeaderboard';

function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [userBalance, setUserBalance] = useState(5000);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎮 RDCM Nation Marketplace</h1>
          <p>AI-Powered Trading Platform</p>
        </div>
      </header>

      <nav className="app-nav">
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
          🤖 Leaderboard
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'marketplace' && (
          <Marketplace
            userBalance={userBalance}
            onPurchase={(newBalance) => setUserBalance(newBalance)}
          />
        )}
        {activeTab === 'leaderboard' && <AILeaderboard />}
      </main>

      <footer className="app-footer">
        <p>© 2026 RDCM Nation. All rights reserved. | 15% Platform Rake</p>
      </footer>
    </div>
  );
}

export default App;
