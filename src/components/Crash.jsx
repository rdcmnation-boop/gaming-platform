import React, { useState, useEffect } from 'react';

export default function Crash() {
  const [gameActive, setGameActive] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(5000);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);

  useEffect(() => {
    if (!gameActive) return;

    const crashAt = 1 + Math.random() * 15; // Crash between 1x and 15x
    setCrashPoint(crashAt);

    const gameInterval = setInterval(() => {
      setMultiplier(prev => {
        const newMult = prev + 0.01;
        if (newMult >= crashAt) {
          setGameActive(false);
          setCrashed(true);
          clearInterval(gameInterval);
          return crashAt;
        }
        return newMult;
      });
    }, 100);

    return () => clearInterval(gameInterval);
  }, [gameActive]);

  const startGame = () => {
    if (betAmount > balance) {
      alert('Insufficient balance!');
      return;
    }

    setBalance(prev => prev - betAmount);
    setGameActive(true);
    setCrashed(false);
    setCashedOut(false);
    setMultiplier(1.0);
    setWinAmount(0);
  };

  const cashOut = () => {
    if (!gameActive) return;

    const winnings = betAmount * multiplier;
    setWinAmount(winnings);
    setBalance(prev => prev + winnings);
    setGameActive(false);
    setCashedOut(true);
  };

  return (
    <div className="crash-game">
      <div className="game-header">
        <h1>📈 NEXUS CRASH 3036</h1>
        <div className="balance-display">
          <span className="balance">💰 {balance.toFixed(2)} NEXUS</span>
        </div>
      </div>

      <div className="crash-display">
        <div className={`crash-chart ${crashed ? 'crashed' : ''} ${cashedOut ? 'cashed-out' : ''}`}>
          <svg viewBox="0 0 400 300" className="crash-graph">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 107, 157, 0.1)" />
                <stop offset="100%" stopColor="rgba(255, 107, 157, 0.5)" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[1, 2, 3, 4, 5].map(i => (
              <line
                key={`h${i}`}
                x1="50" y1={250 - (i * 40)}
                x2="380" y2={250 - (i * 40)}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="5,5"
              />
            ))}

            {/* Y-axis labels */}
            {[1, 2, 3, 4, 5].map(i => (
              <text
                key={`label${i}`}
                x="30" y={255 - (i * 40)}
                fontSize="12"
                fill="rgba(255,255,255,0.5)"
              >
                {i}x
              </text>
            ))}

            {/* Chart line */}
            <polyline
              points={`50,250 ${50 + (multiplier / crashPoint) * 330},${250 - (multiplier * 40)}`}
              fill="none"
              stroke="url(#chartGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="multiplier-display">
            <div className={`multiplier-value ${crashed ? 'crashed' : ''} ${cashedOut ? 'won' : ''}`}>
              {multiplier.toFixed(2)}x
            </div>
            {crashed && <div className="crash-label">💥 CRASHED!</div>}
            {cashedOut && <div className="cash-label">✅ CASHED OUT!</div>}
          </div>
        </div>

        {!gameActive && (
          <div className={`game-result ${crashed ? 'lost' : cashedOut ? 'won' : ''}`}>
            {crashed && !cashedOut && (
              <div className="lose-message">
                😢 GAME CRASHED!
                <p>You lost ${betAmount.toFixed(2)}</p>
              </div>
            )}
            {cashedOut && (
              <div className="win-message">
                🎉 YOU CASHED OUT!
                <p>Won ${winAmount.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="bet-input">
          <label>BET AMOUNT</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={balance}
            disabled={gameActive}
          />
        </div>

        <div className="action-buttons">
          {!gameActive ? (
            <button
              className="btn-start"
              onClick={startGame}
              disabled={betAmount > balance}
            >
              🚀 START GAME
            </button>
          ) : (
            <button
              className="btn-cashout"
              onClick={cashOut}
            >
              💰 CASH OUT NOW ({multiplier.toFixed(2)}x)
            </button>
          )}
        </div>
      </div>

      <div className="strategy-tips">
        <h3>⚡ STRATEGY</h3>
        <ul>
          <li>Watch the multiplier climb - it could crash anytime!</li>
          <li>The longer you wait, the higher your potential payout</li>
          <li>But the risk increases exponentially</li>
          <li>Cash out too early = small win, too late = total loss</li>
          <li>Most profitable: cash out at 2-3x multiplier consistently</li>
        </ul>
      </div>
    </div>
  );
}
