import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import '../styles/leaderboard.css';

export function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('total_profit');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
    // Set up real-time subscription
    const subscription = supabase
      .channel('players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sortBy, timeframe]);

  async function fetchLeaderboard() {
    try {
      let query = supabase
        .from('players')
        .select('*');

      // Apply sorting
      switch (sortBy) {
        case 'total_profit':
          query = query.order('total_profit', { ascending: false });
          break;
        case 'balance':
          query = query.order('balance', { ascending: false });
          break;
        case 'total_wins':
          query = query.order('total_wins', { ascending: false });
          break;
        case 'win_rate':
          query = query.order('total_wins', { ascending: false });
          break;
        default:
          query = query.order('total_profit', { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Calculate win rate and rank
      const rankedPlayers = data.map((player, index) => ({
        ...player,
        rank: index + 1,
        win_rate: player.total_hands > 0
          ? ((player.total_wins / player.total_hands) * 100).toFixed(2)
          : 0
      }));

      setPlayers(rankedPlayers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'K';
    return '$' + amount.toLocaleString();
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Global Leaderboard</h2>
        <p>Top poker players - updated in real-time</p>
      </div>

      <div className="leaderboard-controls">
        <div className="control-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="total_profit">Total Profit</option>
            <option value="balance">Current Balance</option>
            <option value="total_wins">Total Wins</option>
            <option value="win_rate">Win Rate</option>
          </select>
        </div>

        <div className="control-group">
          <label>Timeframe:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="control-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="leaderboard-table">
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : players.length === 0 ? (
          <div className="empty">No players yet. Be the first!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Balance</th>
                <th>Profit</th>
                <th>Wins</th>
                <th>Win Rate</th>
                <th>Hands Played</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className={`rank-${player.rank}`}>
                  <td className="rank-cell">
                    {getMedalIcon(player.rank)}
                    <span className="rank-number">#{player.rank}</span>
                  </td>
                  <td className="player-name-cell">
                    <div className="player-info">
                      <div className="player-avatar">{player.username.charAt(0).toUpperCase()}</div>
                      <span>{player.username}</span>
                    </div>
                  </td>
                  <td className="balance-cell">
                    {formatCurrency(player.balance)}
                  </td>
                  <td className={`profit-cell ${player.total_profit > 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(player.total_profit)}
                  </td>
                  <td className="wins-cell">{player.total_wins}</td>
                  <td className="winrate-cell">{player.win_rate}%</td>
                  <td className="hands-cell">{player.total_hands}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
