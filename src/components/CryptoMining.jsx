import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CryptoMining() {
  const { user } = useAuth();
  const [miningStats, setMiningStats] = useState({
    totalMined: 0,
    miningRate: 0.5, // coins per second
    minerCount: 1,
    level: 1,
    nextLevelCost: 1000
  });
  const [activeMining, setActiveMining] = useState(false);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    if (!activeMining) return;

    const interval = setInterval(() => {
      const earnedPerTick = miningStats.miningRate * miningStats.minerCount * 0.1;
      setEarned(prev => prev + earnedPerTick);
      setMiningStats(prev => ({
        ...prev,
        totalMined: prev.totalMined + earnedPerTick
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [activeMining, miningStats.miningRate, miningStats.minerCount]);

  const upgradeMiner = () => {
    if (miningStats.totalMined >= miningStats.nextLevelCost) {
      setMiningStats(prev => ({
        ...prev,
        totalMined: prev.totalMined - prev.nextLevelCost,
        level: prev.level + 1,
        minerCount: prev.minerCount + 1,
        miningRate: prev.miningRate * 1.5,
        nextLevelCost: Math.floor(prev.nextLevelCost * 1.3)
      }));
    }
  };

  const claimRewards = () => {
    if (earned > 0) {
      // In production, send to backend to update user balance
      fetch('/api/balance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: earned })
      }).catch(err => console.error(err));

      setMiningStats(prev => ({
        ...prev,
        totalMined: prev.totalMined - earned
      }));
      setEarned(0);
    }
  };

  return (
    <div className="crypto-mining">
      <div className="mining-container">
        <div className="mining-header">
          <h1>⛏️ QUANTUM MINING 3036</h1>
          <p>Autonomous AI-powered cryptocurrency extraction</p>
        </div>

        <div className="mining-display">
          <div className="mine-animation">
            <div className={`mining-core ${activeMining ? 'active' : ''}`}>
              <div className="energy-pulse"></div>
              <div className="energy-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="energy-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>

          <div className="mining-stats">
            <div className="stat-block">
              <div className="stat-label">TOTAL MINED</div>
              <div className="stat-value">{miningStats.totalMined.toFixed(2)}</div>
              <div className="stat-unit">NEXUS COINS</div>
            </div>

            <div className="stat-block">
              <div className="stat-label">MINING RATE</div>
              <div className="stat-value">{(miningStats.miningRate * miningStats.minerCount).toFixed(2)}</div>
              <div className="stat-unit">COINS/SEC</div>
            </div>

            <div className="stat-block">
              <div className="stat-label">CURRENT LEVEL</div>
              <div className="stat-value">{miningStats.level}</div>
              <div className="stat-unit">TIER {Math.floor(miningStats.level / 5) + 1}</div>
            </div>

            <div className="stat-block">
              <div className="stat-label">ACTIVE MINERS</div>
              <div className="stat-value">{miningStats.minerCount}</div>
              <div className="stat-unit">QUANTUM CORES</div>
            </div>
          </div>

          <div className="earnings-display">
            <div className="pending-earnings">
              <h3>PENDING REWARDS</h3>
              <div className="earnings-amount">${earned.toFixed(2)}</div>
              <button
                className="btn-claim"
                onClick={claimRewards}
                disabled={earned === 0}
              >
                💎 CLAIM REWARDS
              </button>
            </div>
          </div>
        </div>

        <div className="mining-controls">
          <button
            className={`btn-mine ${activeMining ? 'active' : ''}`}
            onClick={() => setActiveMining(!activeMining)}
          >
            {activeMining ? '⏹️ STOP MINING' : '▶️ START MINING'}
          </button>

          <button
            className="btn-upgrade"
            onClick={upgradeMiner}
            disabled={miningStats.totalMined < miningStats.nextLevelCost}
          >
            🚀 UPGRADE MINER
            <br />
            <small>Cost: {miningStats.nextLevelCost.toFixed(0)} coins</small>
          </button>
        </div>

        <div className="mining-info">
          <div className="info-card">
            <h4>⚡ QUANTUM EXTRACTION</h4>
            <p>AI harnesses quantum computing to extract NEXUS coins from the blockchain. Each upgrade increases your mining efficiency exponentially.</p>
          </div>

          <div className="info-card">
            <h4>🔐 SECURE VAULT</h4>
            <p>All mined coins are instantly stored in your secure vault with military-grade encryption. Claim anytime to add to your account balance.</p>
          </div>

          <div className="info-card">
            <h4>📈 PASSIVE INCOME</h4>
            <p>Mining runs 24/7. Earn coins even when you're offline. The more you upgrade, the faster you earn. Exponential growth potential.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
