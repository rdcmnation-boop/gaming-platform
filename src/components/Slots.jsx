import React, { useState } from 'react';

export default function Slots() {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(5000);
  const [result, setResult] = useState('');
  const [winAmount, setWinAmount] = useState(0);

  const symbols = ['🍒', '🍋', '🍊', '💎', '🌟', '7️⃣', '🎰'];

  const spin = () => {
    if (spinning || betAmount > balance) return;

    setSpinning(true);
    setResult('');
    setBalance(prev => prev - betAmount);

    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 50);

    setTimeout(() => {
      clearInterval(spinInterval);

      const finalReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      setReels(finalReels);
      setSpinning(false);
      evaluateResult(finalReels);
    }, spinDuration);
  };

  const evaluateResult = (finalReels) => {
    const [r1, r2, r3] = finalReels;
    let winAmount = 0;
    let message = '';

    if (r1 === r2 && r2 === r3) {
      if (r1 === '7️⃣') {
        winAmount = betAmount * 50;
        message = '🤯 JACKPOT! TRIPLE SEVENS!';
      } else if (r1 === '💎') {
        winAmount = betAmount * 25;
        message = '💎 DIAMOND JACKPOT!';
      } else {
        winAmount = betAmount * 10;
        message = '🎉 THREE OF A KIND!';
      }
    } else if ((r1 === r2 || r2 === r3 || r1 === r3)) {
      winAmount = betAmount * 3;
      message = '🎊 PAIR MATCH!';
    } else {
      message = '😢 Better luck next time!';
    }

    setWinAmount(winAmount);
    setBalance(prev => prev + winAmount);
    setResult(message);
  };

  return (
    <div className="slots-game">
      <div className="game-header">
        <h1>🎰 NEXUS SLOTS 3036</h1>
        <div className="balance-display">
          <span className="balance">💰 {balance.toFixed(2)} NEXUS</span>
        </div>
      </div>

      <div className="slots-machine">
        <div className="reel-container">
          <div className={`reel ${spinning ? 'spinning' : ''}`}>{reels[0]}</div>
          <div className={`reel ${spinning ? 'spinning' : ''}`}>{reels[1]}</div>
          <div className={`reel ${spinning ? 'spinning' : ''}`}>{reels[2]}</div>
        </div>

        <div className="payline">
          <div className="line"></div>
        </div>

        <div className="controls">
          <div className="bet-section">
            <label>BET AMOUNT</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={balance}
              disabled={spinning}
            />
          </div>

          <button
            className="btn-spin"
            onClick={spin}
            disabled={spinning || betAmount > balance}
          >
            {spinning ? '⏳ SPINNING...' : '🎯 SPIN'}
          </button>
        </div>

        {result && (
          <div className={`result-display ${winAmount > 0 ? 'win' : 'lose'}`}>
            <div className="result-message">{result}</div>
            {winAmount > 0 && (
              <div className="win-amount">
                WON: ${winAmount.toFixed(2)} 💰
              </div>
            )}
          </div>
        )}
      </div>

      <div className="payouts">
        <h3>PAYOUT SCHEDULE</h3>
        <div className="payout-grid">
          <div className="payout-line">
            <span>7️⃣ 7️⃣ 7️⃣</span>
            <span className="payout-amount">50x</span>
          </div>
          <div className="payout-line">
            <span>💎 💎 💎</span>
            <span className="payout-amount">25x</span>
          </div>
          <div className="payout-line">
            <span>ANY MATCH</span>
            <span className="payout-amount">10x</span>
          </div>
          <div className="payout-line">
            <span>PAIR</span>
            <span className="payout-amount">3x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
