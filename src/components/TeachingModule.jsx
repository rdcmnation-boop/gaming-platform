import React, { useState } from 'react';
import { TeachingBot } from '../utils/BotSystem';
import '../styles/teaching.css';

export function TeachingModule() {
  const [activeTab, setActiveTab] = useState('rankings');
  const [selectedHand, setSelectedHand] = useState(10);
  const [selectedConcept, setSelectedConcept] = useState('position');

  const concepts = [
    { key: 'position', name: '📍 Position Strategy' },
    { key: 'potOdds', name: '🎲 Pot Odds' },
    { key: 'bankroll', name: '💰 Bankroll Management' },
    { key: 'handSelection', name: '🃏 Hand Selection' },
    { key: 'readingOpponents', name: '👥 Reading Opponents' },
    { key: 'ranges', name: '📊 Hand Ranges' }
  ];

  const handRankings = Object.entries(TeachingBot.handRankings).sort(
    (a, b) => b[0] - a[0]
  );

  return (
    <div className="teaching-module">
      <div className="teaching-header">
        <h2>🎓 Poker Academy</h2>
        <p>Learn poker strategy from TeachingBot</p>
      </div>

      <div className="teaching-tabs">
        <button
          className={`tab-button ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          Hand Rankings
        </button>
        <button
          className={`tab-button ${activeTab === 'concepts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concepts')}
        >
          Poker Concepts
        </button>
        <button
          className={`tab-button ${activeTab === 'strategies' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategies')}
        >
          Advanced Strategies
        </button>
      </div>

      <div className="teaching-content">
        {activeTab === 'rankings' && (
          <div className="rankings-section">
            <div className="ranking-selector">
              <h3>Hand Ranking Chart</h3>
              <div className="ranking-buttons">
                {handRankings.map(([rank, hand]) => (
                  <button
                    key={rank}
                    className={`ranking-button ${
                      selectedHand == rank ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedHand(rank)}
                    title={hand.name}
                  >
                    {hand.name.substring(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            <div className="ranking-details">
              {selectedHand && TeachingBot.handRankings[selectedHand] && (
                <div className="hand-detail-card">
                  <div className="detail-header">
                    <h4>{TeachingBot.handRankings[selectedHand].name}</h4>
                    <span className="detail-rank">Rank #{11 - selectedHand}</span>
                  </div>

                  <div className="detail-section">
                    <h5>Description</h5>
                    <p>{TeachingBot.handRankings[selectedHand].description}</p>
                  </div>

                  <div className="detail-section">
                    <h5>Probability</h5>
                    <p>{TeachingBot.handRankings[selectedHand].probability}</p>
                  </div>

                  <div className="detail-section">
                    <h5>Strategy</h5>
                    <p className="strategy-text">
                      {TeachingBot.handRankings[selectedHand].strategy}
                    </p>
                  </div>

                  <div className="detail-section">
                    <h5>Example Hand</h5>
                    <p className="example-hand">
                      {TeachingBot.handRankings[selectedHand].example}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'concepts' && (
          <div className="concepts-section">
            <div className="concept-selector">
              <h3>Poker Concepts</h3>
              <div className="concept-buttons">
                {concepts.map((concept) => (
                  <button
                    key={concept.key}
                    className={`concept-button ${
                      selectedConcept === concept.key ? 'active' : ''
                    }`}
                    onClick={() => setSelectedConcept(concept.key)}
                  >
                    {concept.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="concept-details">
              <div className="concept-card">
                <h4>{concepts.find((c) => c.key === selectedConcept)?.name}</h4>
                <p className="concept-explanation">
                  {TeachingBot.teachConcept(selectedConcept)}
                </p>

                {selectedConcept === 'position' && (
                  <div className="position-guide">
                    <div className="position-item">
                      <strong>Early Position</strong>
                      <p>Act first or second. Play premium hands only.</p>
                    </div>
                    <div className="position-item">
                      <strong>Middle Position</strong>
                      <p>Some flexibility. Include suited connectors.</p>
                    </div>
                    <div className="position-item">
                      <strong>Late Position</strong>
                      <p>Act last. Play wider range with more hands.</p>
                    </div>
                  </div>
                )}

                {selectedConcept === 'potOdds' && (
                  <div className="odds-guide">
                    <div className="odds-example">
                      <strong>Example:</strong>
                      <p>Pot = $100, Cost to call = $20</p>
                      <p>Odds = $20 / $120 = 16.7%</p>
                      <p>If hand wins &gt;16.7% of the time → CALL</p>
                    </div>
                  </div>
                )}

                {selectedConcept === 'bankroll' && (
                  <div className="bankroll-guide">
                    <ul>
                      <li>Never risk more than 5% in one game</li>
                      <li>Keep a safety net of 20 buy-ins minimum</li>
                      <li>Move down limits during downswings</li>
                      <li>Move up only after 10+ successful sessions</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="strategies-section">
            <div className="strategy-cards">
              <div className="strategy-card premium">
                <h4>🎯 Premium Hands</h4>
                <p>Play aggressively with premium hands (AA, KK, QQ, AK)</p>
                <ul>
                  <li>Raise pre-flop</li>
                  <li>Build the pot</li>
                  <li>Thin value bets post-flop</li>
                </ul>
              </div>

              <div className="strategy-card position">
                <h4>📍 Position Play</h4>
                <p>Use position to make better decisions</p>
                <ul>
                  <li>Play tighter from early position</li>
                  <li>Expand range from late position</li>
                  <li>Use button advantage vs blinds</li>
                </ul>
              </div>

              <div className="strategy-card aggressive">
                <h4>💪 Aggressive Play</h4>
                <p>Aggression builds pots with value hands</p>
                <ul>
                  <li>Raise with strongest hands</li>
                  <li>3-bet premium hands</li>
                  <li>Keep opponents pressured</li>
                </ul>
              </div>

              <div className="strategy-card bluff">
                <h4>🎭 Bluffing</h4>
                <p>Bluff strategically in favorable spots</p>
                <ul>
                  <li>Bluff rarely in multiway pots</li>
                  <li>Choose aggressive opponents</li>
                  <li>Maintain balance with value bets</li>
                </ul>
              </div>

              <div className="strategy-card adaptation">
                <h4>🔄 Adaptation</h4>
                <p>Adjust strategy based on opponents</p>
                <ul>
                  <li>Tight players: steal blinds more</li>
                  <li>Loose players: play tighter</li>
                  <li>Aggressive players: set traps</li>
                </ul>
              </div>

              <div className="strategy-card bankroll">
                <h4>💰 Bankroll Strategy</h4>
                <p>Protect your chips with discipline</p>
                <ul>
                  <li>Set loss limits before playing</li>
                  <li>Know when to walk away</li>
                  <li>Build slowly over time</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="teaching-footer">
        <p>
          ✨ Master these concepts to improve your poker game. Use this
          knowledge when playing against the bots!
        </p>
      </div>
    </div>
  );
}

export default TeachingModule;
