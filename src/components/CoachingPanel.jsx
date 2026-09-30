import React, { useState, useEffect } from 'react';
import { CoachingBot } from '../utils/BotSystem';
import '../styles/coaching.css';

export function CoachingPanel({
  currentHand,
  pot,
  position,
  opponents,
  chipStack,
  gamePhase,
  playerDecision,
  lastResult,
  showCoaching = true
}) {
  const [advice, setAdvice] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [replayFeedback, setReplayFeedback] = useState(null);
  const [expandedAdvice, setExpandedAdvice] = useState(false);

  useEffect(() => {
    if (!showCoaching) return;

    // Get real-time coaching advice
    const coachAdvice = CoachingBot.getCoachingAdvice(
      currentHand,
      playerDecision,
      pot,
      position,
      opponents,
      gamePhase
    );
    setAdvice(coachAdvice);

    // Get next move suggestion
    if (gamePhase === 'betting' && currentHand) {
      const nextMove = CoachingBot.suggestNextMove(
        currentHand,
        pot,
        chipStack,
        opponents
      );
      setSuggestion(nextMove);
    }

    // Analyze last result if available
    if (lastResult && playerDecision) {
      const analysis = CoachingBot.replayAnalysis(
        currentHand,
        playerDecision,
        lastResult
      );
      setReplayFeedback(analysis);
    }
  }, [currentHand, pot, position, opponents, gamePhase, playerDecision, lastResult, showCoaching]);

  if (!showCoaching) {
    return null;
  }

  return (
    <div className="coaching-panel">
      <div className="coaching-header">
        <h3>🎓 Coach Advice</h3>
        <button
          className="expand-btn"
          onClick={() => setExpandedAdvice(!expandedAdvice)}
        >
          {expandedAdvice ? '−' : '+'}
        </button>
      </div>

      <div className={`coaching-content ${expandedAdvice ? 'expanded' : ''}`}>
        {/* Hand Strength Indicator */}
        {currentHand && (
          <div className="hand-strength-section">
            <div className="strength-label">Hand Strength</div>
            <div className="strength-bar">
              <div
                className="strength-fill"
                style={{
                  width: `${(currentHand.rank / 10) * 100}%`,
                  backgroundColor: getStrengthColor(currentHand.rank)
                }}
              />
            </div>
            <div className="strength-text">
              {currentHand.name}
            </div>
          </div>
        )}

        {/* Real-time Advice */}
        {advice.length > 0 && (
          <div className="advice-section">
            <div className="section-label">💡 Live Tips</div>
            <div className="advice-list">
              {advice.map((tip, idx) => (
                <div key={idx} className="advice-item">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Move Suggestion */}
        {suggestion && (
          <div className="suggestion-section">
            <div className="section-label">🎯 Recommended Action</div>
            <div className="suggestion-box">
              {suggestion}
            </div>
          </div>
        )}

        {/* Game Analysis */}
        {replayFeedback && (
          <div className="feedback-section">
            <div className="section-label">📊 Hand Analysis</div>
            <div className="feedback-card">
              <div className="feedback-hand">
                <strong>{replayFeedback.handStrength.name}</strong>
                <p>{replayFeedback.handStrength.description}</p>
              </div>
              <div className="feedback-message">
                {replayFeedback.feedback}
              </div>
              <div className="feedback-strategy">
                <strong>Strategy tip:</strong>
                <p>{replayFeedback.handStrength.strategy}</p>
              </div>
            </div>
          </div>
        )}

        {/* Position Info */}
        {position && (
          <div className="position-info">
            <div className="section-label">📍 Position Info</div>
            <div className="position-details">
              <strong>{getPositionName(position)}</strong>
              <p>{getPositionAdvice(position)}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {pot && chipStack && (
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Pot Size</span>
              <span className="stat-value">${pot}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Your Stack</span>
              <span className="stat-value">${chipStack}</span>
            </div>
            {opponents && (
              <div className="stat-item">
                <span className="stat-label">Opponents</span>
                <span className="stat-value">{opponents.length}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStrengthColor(rank) {
  if (rank >= 9) return '#00ff88'; // Green - Royal/Straight Flush
  if (rank >= 7) return '#FFD700'; // Gold - Full House/Quads
  if (rank >= 5) return '#FF6B9D'; // Pink - Straight/Flush
  if (rank >= 3) return '#FF8C42'; // Orange - Two Pair/Three of a Kind
  if (rank >= 1) return '#888'; // Gray - Weak
  return '#666';
}

function getPositionName(position) {
  const names = {
    earlyPosition: 'Early Position',
    middlePosition: 'Middle Position',
    latePosition: 'Late Position',
    button: 'Button (Best Position)'
  };
  return names[position] || position;
}

function getPositionAdvice(position) {
  const advice = {
    earlyPosition:
      'Limited information. Play only premium hands (AA, KK, QQ, AK).',
    middlePosition:
      'Moderate flexibility. Include medium pairs and suited connectors.',
    latePosition:
      'Best position! Play wider range and use information advantage.',
    button:
      'You act last pre-flop and post-flop. Maximum positional advantage.'
  };
  return advice[position] || 'Standard position strategy applies.';
}

export default CoachingPanel;
