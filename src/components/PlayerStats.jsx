import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import '../styles/stats.css';

export function PlayerStats() {
  const { user, playerData } = useAuth();
  const [stats, setStats] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchGameHistory();
    }
  }, [user, timeframe]);

  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Calculate additional stats
      const enhancedStats = {
        ...data,
        win_rate: data.total_hands > 0 ? ((data.total_wins / data.total_hands) * 100).toFixed(2) : 0,
        avg_profit_per_hand: data.total_hands > 0 ? (data.total_profit / data.total_hands).toFixed(2) : 0,
        roi: data.total_profit > 0 ? ((data.total_profit / Math.max(1, data.balance - data.total_profit)) * 100).toFixed(2) : 0
      };

      setStats(enhancedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGameHistory() {
    try {
      let query = supabase
        .from('game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setGameHistory(data || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'K';
    return '$' + amount;
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'win': return '#00ff88';
      case 'loss': return '#ff4444';
      case 'break_even': return '#d4af37';
      default: return '#888';
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="empty">No statistics available yet</div>;
  }

  return (
    <div className="player-stats-container">
      <div className="stats-header">
        <h2>📊 Your Statistics</h2>
        <p>Player: <strong>{stats.username}</strong></p>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">{formatCurrency(stats.balance)}</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Total Profit</div>
            <div className="stat-value" style={{color: stats.total_profit > 0 ? '#00ff88' : '#ff4444'}}>
              {formatCurrency(stats.total_profit)}
            </div>
          </div>
        </div>

        <div className="stat-card tertiary">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-label">Total Wins</div>
            <div className="stat-value">{stats.total_wins}</div>
          </div>
        </div>

        <div className="stat-card quaternary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Hands Played</div>
            <div className="stat-value">{stats.total_hands}</div>
          </div>
        </div>
      </div>

      <div className="stats-detailed">
        <div className="detailed-card">
          <h3>Win Rate</h3>
          <div className="detailed-value">{stats.win_rate}%</div>
          <div className="detailed-subtext">{stats.total_wins} wins in {stats.total_hands} hands</div>
        </div>

        <div className="detailed-card">
          <h3>Avg Profit/Hand</h3>
          <div className="detailed-value">${stats.avg_profit_per_hand}</div>
          <div className="detailed-subtext">Average earnings per hand</div>
        </div>

        <div className="detailed-card">
          <h3>ROI</h3>
          <div className="detailed-value">{stats.roi}%</div>
          <div className="detailed-subtext">Return on investment</div>
        </div>

        <div className="detailed-card">
          <h3>Member Since</h3>
          <div className="detailed-value">
            {new Date(stats.created_at).toLocaleDateString()}
          </div>
          <div className="detailed-subtext">Account creation date</div>
        </div>
      </div>

      <div className="game-history">
        <h3>Recent Game History</h3>

        {gameHistory.length === 0 ? (
          <div className="empty">No game history yet. Play some games to see your history!</div>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <div className="col-date">Date</div>
              <div className="col-hand">Hand</div>
              <div className="col-result">Result</div>
              <div className="col-amount">Amount</div>
            </div>
            {gameHistory.map((game, idx) => (
              <div key={idx} className="history-row">
                <div className="col-date">
                  {new Date(game.played_at).toLocaleDateString()}
                </div>
                <div className="col-hand">{game.hand_rank}</div>
                <div className="col-result">
                  <span
                    className="result-badge"
                    style={{color: getResultColor(game.result)}}
                  >
                    {game.result.toUpperCase()}
                  </span>
                </div>
                <div className="col-amount">
                  {game.result === 'win' ? (
                    <span style={{color: '#00ff88'}}>+${game.amount_won}</span>
                  ) : (
                    <span style={{color: '#ff4444'}}>-${game.amount_lost}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
