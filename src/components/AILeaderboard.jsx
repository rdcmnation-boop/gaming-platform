import React, { useState, useEffect } from 'react';
import './AILeaderboard.css';

const AILeaderboard = () => {
  const [sortBy, setSortBy] = useState('profit');
  const [agents, setAgents] = useState([
    { botId: 'AI-Agent-1', difficulty: 'beginner', totalProfit: 2450, percentageReturn: 24.5, winRate: 62, totalTrades: 145, rakePaid: 2175, averageProfitPerTrade: 16.90 },
    { botId: 'AI-Agent-2', difficulty: 'beginner', totalProfit: 2100, percentageReturn: 21.0, winRate: 59, totalTrades: 140, rakePaid: 2100, averageProfitPerTrade: 15.00 },
    { botId: 'AI-Agent-3', difficulty: 'beginner', totalProfit: 1850, percentageReturn: 18.5, winRate: 55, totalTrades: 130, rakePaid: 1950, averageProfitPerTrade: 14.23 },
    { botId: 'AI-Agent-4', difficulty: 'beginner', totalProfit: 2200, percentageReturn: 22.0, winRate: 61, totalTrades: 142, rakePaid: 2130, averageProfitPerTrade: 15.49 },
    { botId: 'AI-Agent-5', difficulty: 'beginner', totalProfit: 2350, percentageReturn: 23.5, winRate: 60, totalTrades: 148, rakePaid: 2220, averageProfitPerTrade: 15.88 },
    { botId: 'AI-Agent-6', difficulty: 'intermediate', totalProfit: 3250, percentageReturn: 32.5, winRate: 68, totalTrades: 180, rakePaid: 2700, averageProfitPerTrade: 18.06 },
    { botId: 'AI-Agent-7', difficulty: 'intermediate', totalProfit: 3100, percentageReturn: 31.0, winRate: 66, totalTrades: 175, rakePaid: 2625, averageProfitPerTrade: 17.71 },
    { botId: 'AI-Agent-8', difficulty: 'intermediate', totalProfit: 3450, percentageReturn: 34.5, winRate: 69, totalTrades: 185, rakePaid: 2775, averageProfitPerTrade: 18.65 },
    { botId: 'AI-Agent-9', difficulty: 'intermediate', totalProfit: 2950, percentageReturn: 29.5, winRate: 65, totalTrades: 170, rakePaid: 2550, averageProfitPerTrade: 17.35 },
    { botId: 'AI-Agent-10', difficulty: 'intermediate', totalProfit: 3300, percentageReturn: 33.0, winRate: 67, totalTrades: 182, rakePaid: 2730, averageProfitPerTrade: 18.13 },
    { botId: 'AI-Agent-11', difficulty: 'advanced', totalProfit: 4850, percentageReturn: 48.5, winRate: 75, totalTrades: 220, rakePaid: 3300, averageProfitPerTrade: 22.05 },
    { botId: 'AI-Agent-12', difficulty: 'advanced', totalProfit: 5100, percentageReturn: 51.0, winRate: 76, totalTrades: 225, rakePaid: 3375, averageProfitPerTrade: 22.67 },
    { botId: 'AI-Agent-13', difficulty: 'advanced', totalProfit: 4650, percentageReturn: 46.5, winRate: 74, totalTrades: 215, rakePaid: 3225, averageProfitPerTrade: 21.63 },
    { botId: 'AI-Agent-14', difficulty: 'advanced', totalProfit: 5300, percentageReturn: 53.0, winRate: 77, totalTrades: 230, rakePaid: 3450, averageProfitPerTrade: 23.04 },
    { botId: 'AI-Agent-15', difficulty: 'advanced', totalProfit: 4950, percentageReturn: 49.5, winRate: 75, totalTrades: 222, rakePaid: 3330, averageProfitPerTrade: 22.30 },
    { botId: 'AI-Agent-16', difficulty: 'expert', totalProfit: 8250, percentageReturn: 82.5, winRate: 85, totalTrades: 280, rakePaid: 4200, averageProfitPerTrade: 29.46 },
    { botId: 'AI-Agent-17', difficulty: 'expert', totalProfit: 8750, percentageReturn: 87.5, winRate: 87, totalTrades: 290, rakePaid: 4350, averageProfitPerTrade: 30.17 },
    { botId: 'AI-Agent-18', difficulty: 'expert', totalProfit: 8100, percentageReturn: 81.0, winRate: 84, totalTrades: 275, rakePaid: 4125, averageProfitPerTrade: 29.45 },
    { botId: 'AI-Agent-19', difficulty: 'expert', totalProfit: 9200, percentageReturn: 92.0, winRate: 88, totalTrades: 300, rakePaid: 4500, averageProfitPerTrade: 30.67 },
    { botId: 'AI-Agent-20', difficulty: 'expert', totalProfit: 8500, percentageReturn: 85.0, winRate: 86, totalTrades: 285, rakePaid: 4275, averageProfitPerTrade: 29.82 },
    { botId: 'AI-Agent-21', difficulty: 'expert', totalProfit: 8900, percentageReturn: 89.0, winRate: 87, totalTrades: 295, rakePaid: 4425, averageProfitPerTrade: 30.17 }
  ]);

  const [platformStats] = useState({
    totalVolume: 5200000,
    activeAgents: 21,
    platformRake: 780000,
    averageWinRate: 72.5
  });

  const getSortedAgents = () => {
    const sorted = [...agents];
    switch (sortBy) {
      case 'profit':
        return sorted.sort((a, b) => b.totalProfit - a.totalProfit);
      case 'winRate':
        return sorted.sort((a, b) => b.winRate - a.winRate);
      case 'volume':
        return sorted.sort((a, b) => b.totalTrades - a.totalTrades);
      case 'rake':
        return sorted.sort((a, b) => b.rakePaid - a.rakePaid);
      default:
        return sorted;
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#FFB84D',
      intermediate: '#4ECDC4',
      advanced: '#FF6B9D',
      expert: '#9B59B6'
    };
    return colors[difficulty] || '#999';
  };

  const sortedAgents = getSortedAgents();
  const topThree = sortedAgents.slice(0, 3);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🤖 AI Agent Leaderboard</h2>
      </div>

      {/* Platform Stats */}
      <div className="platform-stats">
        <div className="stat-card">
          <div className="stat-label">Daily Volume</div>
          <div className="stat-value">${(platformStats.totalVolume / 1000000).toFixed(1)}M</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value">{platformStats.activeAgents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Rake</div>
          <div className="stat-value">${(platformStats.platformRake / 1000).toFixed(0)}K</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Win Rate</div>
          <div className="stat-value">{platformStats.averageWinRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Top 3 Agents */}
      <div className="top-agents">
        <h3>🏆 Top Performers</h3>
        <div className="top-agents-grid">
          {topThree.map((agent, index) => (
            <div key={agent.botId} className={`top-agent-card rank-${index + 1}`}>
              <div className="rank-badge">{index + 1}</div>
              <div className="agent-name">{agent.botId}</div>
              <div className="agent-difficulty" style={{ background: getDifficultyColor(agent.difficulty) }}>
                {agent.difficulty.toUpperCase()}
              </div>
              <div className="agent-profit">${agent.totalProfit.toFixed(2)}</div>
              <div className="agent-return">{agent.percentageReturn.toFixed(1)}% ROI</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="sort-options">
        <button
          className={`sort-btn ${sortBy === 'profit' ? 'active' : ''}`}
          onClick={() => setSortBy('profit')}
        >
          💰 By Profit
        </button>
        <button
          className={`sort-btn ${sortBy === 'winRate' ? 'active' : ''}`}
          onClick={() => setSortBy('winRate')}
        >
          ✓ By Win Rate
        </button>
        <button
          className={`sort-btn ${sortBy === 'volume' ? 'active' : ''}`}
          onClick={() => setSortBy('volume')}
        >
          📊 By Volume
        </button>
        <button
          className={`sort-btn ${sortBy === 'rake' ? 'active' : ''}`}
          onClick={() => setSortBy('rake')}
        >
          🎰 By Rake Paid
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="col-rank">Rank</div>
          <div className="col-agent">Agent</div>
          <div className="col-difficulty">Difficulty</div>
          <div className="col-profit">Profit</div>
          <div className="col-return">ROI %</div>
          <div className="col-winrate">Win Rate</div>
          <div className="col-trades">Trades</div>
          <div className="col-rake">Rake Paid</div>
          <div className="col-avg-profit">Avg Profit</div>
        </div>

        {sortedAgents.map((agent, index) => (
          <div key={agent.botId} className="table-row">
            <div className="col-rank">
              <span className="rank">{index + 1}</span>
            </div>
            <div className="col-agent">{agent.botId}</div>
            <div className="col-difficulty">
              <span className="difficulty-badge" style={{ background: getDifficultyColor(agent.difficulty) }}>
                {agent.difficulty}
              </span>
            </div>
            <div className="col-profit profit-highlight">${agent.totalProfit.toFixed(2)}</div>
            <div className="col-return">{agent.percentageReturn.toFixed(1)}%</div>
            <div className="col-winrate">
              <div className="winrate-bar">
                <div className="winrate-fill" style={{ width: `${agent.winRate}%` }}></div>
                <span className="winrate-text">{agent.winRate}%</span>
              </div>
            </div>
            <div className="col-trades">{agent.totalTrades}</div>
            <div className="col-rake">${agent.rakePaid.toFixed(2)}</div>
            <div className="col-avg-profit">${agent.averageProfitPerTrade.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AILeaderboard;
