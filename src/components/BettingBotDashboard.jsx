import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/bettingBot.css';

export default function BettingBotDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('opportunities'); // opportunities, history, settings, performance
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionName: '',
    initialBankroll: 1000,
    strategy: 'value',
    profitTarget: 0.10,
    lossLimit: 0.20,
    maxRiskPerBet: 0.05
  });

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    if (activeSession) {
      loadOpportunities();
      loadBetHistory();
    }
  }, [activeSession]);

  async function loadSessions() {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
      if (data.sessions && data.sessions.length > 0 && !activeSession) {
        setActiveSession(data.sessions[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setLoading(false);
  }

  async function loadOpportunities() {
    if (!activeSession) return;

    try {
      // Mock opportunities for demo - in production, fetch from sports API
      const mockOpportunities = [
        {
          event_id: 'nfl_1',
          event_name: 'Kansas City Chiefs vs Buffalo Bills',
          odds: 1.95,
          probability: 0.54,
          sport: 'nfl',
          bet_type: 'moneyline',
          team_or_player: 'Chiefs',
          event_date: new Date(Date.now() + 86400000).toISOString()
        },
        {
          event_id: 'nba_1',
          event_name: 'Boston Celtics vs Miami Heat',
          odds: 2.10,
          probability: 0.48,
          sport: 'nba',
          bet_type: 'moneyline',
          team_or_player: 'Celtics',
          event_date: new Date(Date.now() + 86400000).toISOString()
        },
        {
          event_id: 'nfl_2',
          event_name: 'Dallas Cowboys vs Philadelphia Eagles',
          odds: 1.85,
          probability: 0.56,
          sport: 'nfl',
          bet_type: 'moneyline',
          team_or_player: 'Cowboys',
          event_date: new Date(Date.now() + 172800000).toISOString()
        }
      ];

      // Analyze opportunities with bot
      const response = await fetch('/api/bets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession,
          opportunities: mockOpportunities
        })
      });

      const data = await response.json();
      setOpportunities(data.topRecommendations || data.opportunities || []);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    }
  }

  async function loadBetHistory() {
    if (!activeSession) return;

    try {
      const response = await fetch(`/api/bets/history?sessionId=${activeSession}&limit=20`);
      const data = await response.json();
      setBetHistory(data.bets || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  async function placeBet(opportunity) {
    if (!activeSession) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession,
          opportunityId: opportunity.opportunity_id,
          eventId: opportunity.opportunity_id,
          eventName: opportunity.event_name,
          sport: opportunity.sport,
          betType: opportunity.bet_type,
          teamOrPlayer: opportunity.team_or_player,
          odds: opportunity.odds,
          probability: opportunity.probability,
          betAmount: opportunity.suggested_bet_amount,
          strategyUsed: activeSession?.strategy,
          confidence: opportunity.confidence,
          expectedValue: opportunity.expected_value
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        loadOpportunities();
        loadBetHistory();
        // Refresh sessions to update bankroll
        loadSessions();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to place bet:', error);
      alert('Failed to place bet');
    }
    setLoading(false);
  }

  async function createNewSession() {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm)
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowNewSessionModal(false);
        setSessionForm({
          sessionName: '',
          initialBankroll: 1000,
          strategy: 'value',
          profitTarget: 0.10,
          lossLimit: 0.20,
          maxRiskPerBet: 0.05
        });
        loadSessions();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    }
    setLoading(false);
  }

  const currentSession = sessions.find(s => s.id === activeSession);

  return (
    <div className="betting-bot-dashboard">
      <div className="dashboard-header">
        <h1>🤖 Betting Bot Dashboard</h1>
        <div className="header-controls">
          <button
            className="btn-primary"
            onClick={() => setShowNewSessionModal(true)}
          >
            + New Session
          </button>
        </div>
      </div>

      {/* Session Selector */}
      <div className="session-selector">
        <div className="sessions-list">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-card ${activeSession === session.id ? 'active' : ''}`}
              onClick={() => setActiveSession(session.id)}
            >
              <div className="session-name">{session.sessionName}</div>
              <div className="session-stats">
                <span className="stat">${session.currentBankroll.toFixed(2)}</span>
                <span className="stat strategy-badge">{session.strategy.toUpperCase()}</span>
              </div>
              <div className="session-performance">
                <span className="win-rate">{(session.winRate * 100).toFixed(1)}% WR</span>
                <span className="roi">{(session.roi * 100).toFixed(2)}% ROI</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard */}
      {currentSession && (
        <div className="dashboard-main">
          {/* Dashboard Stats */}
          <div className="dashboard-stats">
            <div className="stat-box">
              <div className="stat-label">Current Bankroll</div>
              <div className="stat-value">${currentSession.currentBankroll.toFixed(2)}</div>
              <div className="stat-change">
                Started: ${currentSession.initialBankroll.toFixed(2)}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value ${currentSession.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                ${currentSession.totalProfit.toFixed(2)}
              </div>
              <div className="stat-change">
                ROI: {(currentSession.roi * 100).toFixed(2)}%
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Record</div>
              <div className="stat-value">
                {currentSession.winBets}W - {currentSession.loseBets}L
              </div>
              <div className="stat-change">
                {(currentSession.winRate * 100).toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Strategy</div>
              <div className="stat-value">{currentSession.strategy.toUpperCase()}</div>
              <div className="stat-change">
                Risk: {(currentSession.maxRiskPerBet * 100).toFixed(1)}% per bet
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab ${view === 'opportunities' ? 'active' : ''}`}
              onClick={() => setView('opportunities')}
            >
              💡 Opportunities
            </button>
            <button
              className={`tab ${view === 'history' ? 'active' : ''}`}
              onClick={() => setView('history')}
            >
              📊 History
            </button>
            <button
              className={`tab ${view === 'performance' ? 'active' : ''}`}
              onClick={() => setView('performance')}
            >
              📈 Performance
            </button>
            <button
              className={`tab ${view === 'settings' ? 'active' : ''}`}
              onClick={() => setView('settings')}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Opportunities View */}
          {view === 'opportunities' && (
            <div className="view-content">
              <h2>Betting Opportunities</h2>
              <div className="opportunities-list">
                {opportunities.length === 0 ? (
                  <div className="empty-state">No opportunities analyzed</div>
                ) : (
                  opportunities.map((opp, idx) => (
                    <div key={idx} className="opportunity-card">
                      <div className="opp-header">
                        <div className="opp-title">
                          <h3>{opp.event_name}</h3>
                          <span className="sport-badge">{opp.sport.toUpperCase()}</span>
                        </div>
                        <div className={`recommendation ${opp.bot_recommendation.toLowerCase()}`}>
                          {opp.bot_recommendation}
                        </div>
                      </div>

                      <div className="opp-details">
                        <div className="detail">
                          <span className="label">Team/Player:</span>
                          <span className="value">{opp.team_or_player}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Odds:</span>
                          <span className="value">{opp.odds.toFixed(2)}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Probability:</span>
                          <span className="value">{(opp.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="detail">
                          <span className="label">Expected Value:</span>
                          <span className={`value ${opp.expected_value > 0 ? 'positive' : 'negative'}`}>
                            {(opp.expected_value * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="opp-confidence">
                        <div className="confidence-label">
                          Confidence: {opp.confidence}%
                        </div>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${opp.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div className="opp-bet-suggestion">
                        <div className="suggested-amount">
                          Suggested Bet: ${opp.suggested_bet_amount.toFixed(2)}
                        </div>
                        <div className="potential-return">
                          Potential Win: ${opp.potential_win.toFixed(2)}
                        </div>
                      </div>

                      <div className="opp-action">
                        {opp.bot_recommendation === 'BET' ? (
                          <button
                            className="btn-place-bet"
                            onClick={() => placeBet(opp)}
                            disabled={loading}
                          >
                            {loading ? 'Placing...' : '🎯 Place Bet'}
                          </button>
                        ) : (
                          <button className="btn-skip" disabled>
                            ⏭️ Skip
                          </button>
                        )}
                      </div>

                      <div className="opp-reason">
                        <small>{opp.reason}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* History View */}
          {view === 'history' && (
            <div className="view-content">
              <h2>Bet History</h2>
              <div className="bets-table">
                {betHistory.length === 0 ? (
                  <div className="empty-state">No bets placed yet</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Odds</th>
                        <th>Bet Amount</th>
                        <th>Potential</th>
                        <th>Status</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {betHistory.map(bet => (
                        <tr key={bet.id} className={`status-${bet.status}`}>
                          <td>{bet.eventName}</td>
                          <td>{bet.sport}</td>
                          <td>{bet.odds.toFixed(2)}</td>
                          <td>${bet.betAmount.toFixed(2)}</td>
                          <td>${bet.potentialWin.toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${bet.status}`}>
                              {bet.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{bet.roi || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Performance View */}
          {view === 'performance' && (
            <div className="view-content">
              <h2>Performance Analytics</h2>
              <div className="performance-stats">
                <div className="perf-card">
                  <h3>Overall Stats</h3>
                  <div className="perf-data">
                    <div className="data-row">
                      <span>Total Bets:</span>
                      <strong>{currentSession.totalBets}</strong>
                    </div>
                    <div className="data-row">
                      <span>Wins:</span>
                      <strong className="positive">{currentSession.winBets}</strong>
                    </div>
                    <div className="data-row">
                      <span>Losses:</span>
                      <strong className="negative">{currentSession.loseBets}</strong>
                    </div>
                    <div className="data-row">
                      <span>Win Rate:</span>
                      <strong>{(currentSession.winRate * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="data-row">
                      <span>ROI:</span>
                      <strong className={currentSession.roi >= 0 ? 'positive' : 'negative'}>
                        {(currentSession.roi * 100).toFixed(2)}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="perf-card">
                  <h3>Bankroll Progress</h3>
                  <div className="perf-data">
                    <div className="data-row">
                      <span>Starting:</span>
                      <strong>${currentSession.initialBankroll.toFixed(2)}</strong>
                    </div>
                    <div className="data-row">
                      <span>Current:</span>
                      <strong>${currentSession.currentBankroll.toFixed(2)}</strong>
                    </div>
                    <div className="data-row">
                      <span>Change:</span>
                      <strong className={currentSession.totalProfit >= 0 ? 'positive' : 'negative'}>
                        ${currentSession.totalProfit.toFixed(2)}
                      </strong>
                    </div>
                    <div className="data-row">
                      <span>Profit Target:</span>
                      <strong>${(currentSession.initialBankroll * currentSession.profitTarget).toFixed(2)}</strong>
                    </div>
                    <div className="data-row">
                      <span>Loss Limit:</span>
                      <strong>${(currentSession.initialBankroll * (1 - currentSession.lossLimit)).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {view === 'settings' && (
            <div className="view-content">
              <h2>Session Settings</h2>
              <div className="settings-panel">
                <div className="setting">
                  <label>Strategy</label>
                  <div className="strategy-info">
                    Current: <strong>{currentSession.strategy.toUpperCase()}</strong>
                  </div>
                  <small>Strategies: kelly (aggressive), value (balanced), aggressive (max risk), conservative (safe)</small>
                </div>

                <div className="setting">
                  <label>Max Risk Per Bet</label>
                  <div className="setting-value">{(currentSession.maxRiskPerBet * 100).toFixed(1)}%</div>
                </div>

                <div className="setting">
                  <label>Profit Target</label>
                  <div className="setting-value">
                    ${(currentSession.initialBankroll * currentSession.profitTarget).toFixed(2)}
                    ({(currentSession.profitTarget * 100).toFixed(1)}%)
                  </div>
                </div>

                <div className="setting">
                  <label>Loss Limit</label>
                  <div className="setting-value">
                    ${(currentSession.initialBankroll * (1 - currentSession.lossLimit)).toFixed(2)}
                    ({(currentSession.lossLimit * 100).toFixed(1)}%)
                  </div>
                </div>

                <div className="settings-note">
                  <strong>Note:</strong> Settings are read-only in this view. Create a new session to use different settings.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Betting Session</h2>
              <button className="modal-close" onClick={() => setShowNewSessionModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Session Name</label>
                <input
                  type="text"
                  value={sessionForm.sessionName}
                  onChange={(e) => setSessionForm({...sessionForm, sessionName: e.target.value})}
                  placeholder="e.g., NFL Week 1 Session"
                />
              </div>

              <div className="form-group">
                <label>Initial Bankroll ($)</label>
                <input
                  type="number"
                  value={sessionForm.initialBankroll}
                  onChange={(e) => setSessionForm({...sessionForm, initialBankroll: parseFloat(e.target.value)})}
                  min="100"
                />
              </div>

              <div className="form-group">
                <label>Strategy</label>
                <select
                  value={sessionForm.strategy}
                  onChange={(e) => setSessionForm({...sessionForm, strategy: e.target.value})}
                >
                  <option value="kelly">Kelly Criterion (Aggressive)</option>
                  <option value="value">Value-Based (Balanced)</option>
                  <option value="aggressive">Aggressive (High Risk)</option>
                  <option value="conservative">Conservative (Safe)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Risk Per Bet (%)</label>
                <input
                  type="number"
                  value={sessionForm.maxRiskPerBet * 100}
                  onChange={(e) => setSessionForm({...sessionForm, maxRiskPerBet: e.target.value / 100})}
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Profit Target (%)</label>
                <input
                  type="number"
                  value={sessionForm.profitTarget * 100}
                  onChange={(e) => setSessionForm({...sessionForm, profitTarget: e.target.value / 100})}
                  min="1"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label>Loss Limit (%)</label>
                <input
                  type="number"
                  value={sessionForm.lossLimit * 100}
                  onChange={(e) => setSessionForm({...sessionForm, lossLimit: e.target.value / 100})}
                  min="10"
                  max="50"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNewSessionModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={createNewSession}
                disabled={loading || !sessionForm.sessionName}
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
