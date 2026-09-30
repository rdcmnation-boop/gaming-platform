import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import '../styles/tournament.css';

export function TournamentMode() {
  const { user, playerData } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [createMode, setCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    buy_in: 100,
    max_players: 8,
    prize_pool_percent: [50, 30, 20] // Top 3 payouts
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, [user]);

  async function fetchTournaments() {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);

      // Fetch user's tournaments
      if (user) {
        const { data: userTourneys } = await supabase
          .from('tournament_players')
          .select('tournament_id, status, placement, winnings')
          .eq('user_id', user.id);

        setMyTournaments(userTourneys || []);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTournament(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          host_id: user.id,
          buy_in: formData.buy_in,
          max_players: formData.max_players,
          status: 'pending',
          prize_structure: formData.prize_pool_percent,
          current_players: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first player
      await supabase.from('tournament_players').insert({
        tournament_id: data.id,
        user_id: user.id,
        buy_in: formData.buy_in,
        status: 'active'
      });

      // Deduct buy-in from user balance
      const newBalance = playerData.balance - formData.buy_in;
      await supabase
        .from('players')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      fetchTournaments();
      setCreateMode(false);
      setFormData({ name: '', buy_in: 100, max_players: 8, prize_pool_percent: [50, 30, 20] });
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  }

  async function handleJoinTournament(tournamentId, buyIn) {
    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (existing && existing.length > 0) {
        alert('You already joined this tournament');
        return;
      }

      // Check balance
      if (playerData.balance < buyIn) {
        alert('Insufficient balance');
        return;
      }

      // Join tournament
      await supabase.from('tournament_players').insert({
        tournament_id: tournamentId,
        user_id: user.id,
        buy_in: buyIn,
        status: 'active'
      });

      // Update tournament player count
      const tournament = tournaments.find(t => t.id === tournamentId);
      await supabase
        .from('tournaments')
        .update({ current_players: tournament.current_players + 1 })
        .eq('id', tournamentId);

      // Deduct buy-in
      const newBalance = playerData.balance - buyIn;
      await supabase
        .from('players')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      fetchTournaments();
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'K';
    return '$' + amount;
  };

  const calculatePrizePool = (players, buyIn) => {
    return players * buyIn;
  };

  return (
    <div className="tournament-container">
      <div className="tournament-header">
        <h2>🏅 Tournament Mode</h2>
        <p>Compete for prizes in structured poker tournaments</p>
        {!createMode && (
          <button
            className="btn-create-tournament"
            onClick={() => setCreateMode(true)}
          >
            Create Tournament
          </button>
        )}
      </div>

      {createMode && (
        <div className="tournament-create-form">
          <h3>Create New Tournament</h3>
          <form onSubmit={handleCreateTournament}>
            <div className="form-group">
              <label>Tournament Name</label>
              <input
                type="text"
                placeholder="e.g., Friday Night Poker"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Buy-In Amount</label>
                <input
                  type="number"
                  min="10"
                  value={formData.buy_in}
                  onChange={(e) => setFormData({...formData, buy_in: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>Max Players</label>
                <input
                  type="number"
                  min="2"
                  max="16"
                  value={formData.max_players}
                  onChange={(e) => setFormData({...formData, max_players: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-create">Create</button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setCreateMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tournament-grid">
        {loading ? (
          <div className="loading">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="empty">No tournaments available. Create one to get started!</div>
        ) : (
          tournaments.map((tournament) => {
            const isJoined = myTournaments.some(t => t.tournament_id === tournament.id);
            const isFull = tournament.current_players >= tournament.max_players;
            const prizePool = calculatePrizePool(tournament.current_players, tournament.buy_in);

            return (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-card-header">
                  <h3>{tournament.name}</h3>
                  <span className={`status-badge status-${tournament.status}`}>
                    {tournament.status.toUpperCase()}
                  </span>
                </div>

                <div className="tournament-card-body">
                  <div className="tournament-stat">
                    <span className="stat-label">Buy-In</span>
                    <span className="stat-value">${tournament.buy_in}</span>
                  </div>

                  <div className="tournament-stat">
                    <span className="stat-label">Players</span>
                    <span className="stat-value">
                      {tournament.current_players}/{tournament.max_players}
                    </span>
                  </div>

                  <div className="tournament-stat">
                    <span className="stat-label">Prize Pool</span>
                    <span className="stat-value">${prizePool}</span>
                  </div>

                  <div className="tournament-stat">
                    <span className="stat-label">Progress</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{width: `${(tournament.current_players / tournament.max_players) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="tournament-card-footer">
                  {isJoined ? (
                    <span className="btn-joined">✓ Joined</span>
                  ) : (
                    <button
                      className="btn-join"
                      onClick={() => handleJoinTournament(tournament.id, tournament.buy_in)}
                      disabled={isFull || playerData.balance < tournament.buy_in}
                    >
                      {isFull ? 'Full' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
