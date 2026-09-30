import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateRandomHand, evaluateWinner, calculatePayout, getBotPersonality, formatCurrency } from '../utils/pokerLogic';
import { CoachingPanel } from './CoachingPanel';
import '../styles/pokerGame.css';

const AI_BOTS = [
  { name: 'ProBot', type: 'ai', level: 3, winRate: 0.80 },
  { name: 'BalancedAI', type: 'ai', level: 2, winRate: 0.60 },
  { name: 'FishBot', type: 'ai', level: 1, winRate: 0.30 },
  { name: 'SharpBot', type: 'ai', level: 3, winRate: 0.75 },
  { name: 'CasualBot', type: 'ai', level: 2, winRate: 0.50 }
];

export default function PokerGame() {
  const { user, playerData } = useAuth();
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, results
  const [players, setPlayers] = useState([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(100);
  const [gameLog, setGameLog] = useState([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [coachingEnabled, setCoachingEnabled] = useState(true);
  const [playerPosition, setPlayerPosition] = useState('button');
  const [lastPlayerDecision, setLastPlayerDecision] = useState(null);
  const [lastGameResult, setLastGameResult] = useState(null);

  useEffect(() => {
    if (user && playerData && gameState === 'lobby') {
      initializePlayers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, playerData, gameState]);

  function initializePlayers() {
    const humanPlayer = {
      id: user.id,
      name: playerData.username,
      type: 'human',
      balance: practiceMode ? 10000 : playerData.balance,
      bet: 0,
      hand: null,
      isActive: true
    };

    const aiPlayers = AI_BOTS.slice(0, 4).map((bot, idx) => ({
      id: `ai-${idx}`,
      name: bot.name,
      type: 'ai',
      level: bot.level,
      winRate: bot.winRate,
      balance: 5000 + idx * 1000,
      bet: 0,
      hand: null,
      isActive: true
    }));

    setPlayers([humanPlayer, ...aiPlayers]);
    addLog('✓ Players seated. Ready to play!');
  }

  function addLog(message) {
    setGameLog(prev => [...prev, message]);
  }

  async function startHand() {
    if (players[0].balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }

    setGameState('playing');
    setGameLog([]);
    addLog('--- NEW HAND STARTED ---');
    addLog(`Buy-in: ${formatCurrency(currentBet)}`);

    let newPlayers = [...players];
    let totalPot = 0;

    // Collect bets
    addLog('--- PLACING BETS ---');
    newPlayers.forEach((player, idx) => {
      if (player.isActive) {
        let betAmount = currentBet;
        if (player.type === 'ai') {
          betAmount = Math.floor(currentBet * (0.8 + Math.random() * 0.4));
        }
        betAmount = Math.min(betAmount, player.balance);

        newPlayers[idx].bet = betAmount;
        newPlayers[idx].balance -= betAmount;
        totalPot += betAmount;

        const personality = getBotPersonality(player.name);
        addLog(`${player.name} bets ${formatCurrency(betAmount)} → ${personality.comments.bet}`);
      }
    });

    setPot(totalPot);
    setPlayers(newPlayers);

    // Deal cards
    await new Promise(r => setTimeout(r, 1500));
    addLog('--- DEALING CARDS ---');

    newPlayers.forEach((player, idx) => {
      const hand = generateRandomHand();
      newPlayers[idx].hand = hand;
      const handDisplay = idx === 0 ? hand.name : '🃏 🃏';
      addLog(`${player.name} receives: ${handDisplay}`);
      if (player.type === 'ai') {
        const personality = getBotPersonality(player.name);
        addLog(`  → ${personality.comments.hand}`);
      }
    });

    setPlayers(newPlayers);

    // Evaluate
    await new Promise(r => setTimeout(r, 2000));
    addLog('--- EVALUATING HANDS ---');
    evaluateAndShowWinners(newPlayers, totalPot);
  }

  function evaluateAndShowWinners(players, totalPot) {
    const winners = evaluateWinner(players);
    const payout = calculatePayout(totalPot, winners.length);

    let newPlayers = [...players];
    winners.forEach(idx => {
      newPlayers[idx].balance += payout;
      newPlayers[idx].profit = payout;
    });

    addLog('--- RESULTS ---');
    if (winners.includes(0)) {
      addLog('🎉 YOU WIN! 🎉');
      addLog(`+${formatCurrency(payout)} from pot of ${formatCurrency(totalPot)}`);
    } else {
      const winner = players[winners[0]];
      const personality = getBotPersonality(winner.name);
      addLog(`${winner.name.toUpperCase()} WINS!`);
      addLog(`  → ${personality.comments.win}`);
      addLog(`Won ${formatCurrency(payout)}`);
    }

    setPlayers(newPlayers);
    setGameState('results');
  }

  function resetHand() {
    setPlayers(prev => prev.map(p => ({
      ...p,
      bet: 0,
      hand: null,
      profit: 0
    })));
    setPot(0);
    setGameState('lobby');
  }

  if (!user) {
    return (
      <div className="poker-container">
        <div className="poker-message">
          <h2>Sign in to play poker</h2>
          <p>Create an account or sign in to join the game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poker-container">
      <div className="poker-header">
        <h2>RDCM POKER TABLE</h2>
        <div className="header-stats">
          <div className="stat">
            <span className="label">Balance</span>
            <span className="value">{formatCurrency(players[0]?.balance || 0)}</span>
          </div>
          <div className="stat">
            <span className="label">Pot</span>
            <span className="value">{formatCurrency(pot)}</span>
          </div>
          <div className="stat">
            <span className="label">Players</span>
            <span className="value">{players.length}</span>
          </div>
        </div>
      </div>

      <div className="poker-table">
        {players.map((player, idx) => (
          <div key={idx} className={`seat ${player.type === 'human' ? 'human-seat' : ''}`}>
            <div className="player-name">{player.name}</div>
            <div className="player-hand">
              {player.hand ? (
                <span className={idx === 0 ? 'your-hand' : 'ai-hand'}>
                  {idx === 0 ? player.hand.name : '🃏 🃏'}
                </span>
              ) : (
                '---'
              )}
            </div>
            <div className="player-balance">Balance: {formatCurrency(player.balance)}</div>
            {player.bet > 0 && <div className="player-bet">Bet: {formatCurrency(player.bet)}</div>}
            {player.profit > 0 && <div className="player-profit">+{formatCurrency(player.profit)}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
        <div className="game-log" style={{ flex: 1 }}>
          {gameLog.map((log, idx) => (
            <div key={idx} className="log-entry">{log}</div>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <CoachingPanel
            currentHand={players[0]?.hand}
            pot={pot}
            position={playerPosition}
            opponents={players.slice(1)}
            chipStack={players[0]?.balance}
            gamePhase={gameState}
            playerDecision={lastPlayerDecision}
            lastResult={lastGameResult}
            showCoaching={coachingEnabled}
          />
        </div>
      </div>

      <div className="controls">
        {gameState === 'lobby' && (
          <>
            <label>
              <input
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
              />
              Practice Mode
            </label>
            <label>
              <input
                type="checkbox"
                checked={coachingEnabled}
                onChange={(e) => setCoachingEnabled(e.target.checked)}
              />
              🎓 Coaching
            </label>
            <label>
              Bet:
              <input
                type="number"
                value={currentBet}
                onChange={(e) => setCurrentBet(Math.max(10, parseInt(e.target.value) || 100))}
                min="10"
                max={players[0]?.balance || 10000}
              />
            </label>
            <button onClick={startHand} className="btn-primary">
              Start Hand
            </button>
          </>
        )}

        {gameState === 'results' && (
          <button onClick={resetHand} className="btn-primary">
            Next Hand
          </button>
        )}

        {gameState === 'playing' && (
          <div className="playing-status">Playing...</div>
        )}
      </div>
    </div>
  );
}
