import React, { useState } from 'react';

export default function Dice() {
  const [rolling, setRolling] = useState(false);
  const [playerDice, setPlayerDice] = useState([1, 1]);
  const [dealerDice, setDealerDice] = useState([1, 1]);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(5000);
  const [result, setResult] = useState('');
  const [playerWins, setPlayerWins] = useState(0);
  const [dealerWins, setDealerWins] = useState(0);

  const rollDice = () => {
    if (rolling || betAmount > balance) return;

    setRolling(true);
    setBalance(prev => prev - betAmount);

    const rollDuration = 1500;
    const rollInterval = setInterval(() => {
      setPlayerDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      setDealerDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    }, 50);

    setTimeout(() => {
      clearInterval(rollInterval);

      const finalPlayer = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      const finalDealer = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];

      setPlayerDice(finalPlayer);
      setDealerDice(finalDealer);
      setRolling(false);

      evaluateRound(finalPlayer, finalDealer);
    }, rollDuration);
  };

  const evaluateRound = (player, dealer) => {
    const playerTotal = player[0] + player[1];
    const dealerTotal = dealer[0] + dealer[1];
    let winAmount = 0;
    let message = '';

    if (playerTotal > dealerTotal) {
      winAmount = betAmount * 2;
      message = '🎉 YOU WIN!';
      setPlayerWins(prev => prev + 1);
    } else if (dealerTotal > playerTotal) {
      message = '😢 DEALER WINS!';
      setDealerWins(prev => prev + 1);
    } else {
      message = '🤝 TIE!';
      winAmount = betAmount;
    }

    setBalance(prev => prev + winAmount);
    setResult(message);
  };

  const renderDice = (dice) => (
    <div className="dice-pair">
      {dice.map((num, idx) => (
        <div key={idx} className={`die die-${num}`}>
          {Array(num).fill().map((_, i) => (
            <div key={i} className="pip"></div>
          ))}
        </div>
      ))}
    </div>
  );

  const getDiceTotal = (dice) => dice[0] + dice[1];

  return (
    <div className="dice-game">
      <div className="game-header">
        <h1>🎲 NEXUS DICE 3036</h1>
        <div className="balance-display">
          <span className="balance">💰 {balance.toFixed(2)} NEXUS</span>
        </div>
      </div>

      <div className="dice-arena">
        <div className="player-section">
          <h2>YOUR ROLL</h2>
          {renderDice(playerDice)}
          <div className="dice-total">Total: {getDiceTotal(playerDice)}</div>
          <div className="wins">Wins: {playerWins}</div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="dealer-section">
          <h2>DEALER ROLL</h2>
          {renderDice(dealerDice)}
          <div className="dice-total">Total: {getDiceTotal(dealerDice)}</div>
          <div className="wins">Wins: {dealerWins}</div>
        </div>
      </div>

      {result && (
        <div className={`result-display ${playerWins > dealerWins ? 'win' : 'lose'}`}>
          <div className="result-message">{result}</div>
        </div>
      )}

      <div className="controls">
        <div className="bet-section">
          <label>BET AMOUNT</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={balance}
            disabled={rolling}
          />
        </div>

        <button
          className="btn-roll"
          onClick={rollDice}
          disabled={rolling || betAmount > balance}
        >
          {rolling ? '🎲 ROLLING...' : '🎯 ROLL DICE'}
        </button>
      </div>

      <div className="rules">
        <h3>HOW TO PLAY</h3>
        <p>Roll the highest total to win! Each dice goes from 1-6. First to higher total wins the round.</p>
        <p><strong>Win Odds:</strong> 50/50 (plus ties)</p>
        <p><strong>Payout:</strong> 2x your bet on win</p>
      </div>
    </div>
  );
}
