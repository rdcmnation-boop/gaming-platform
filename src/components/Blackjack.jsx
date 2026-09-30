import React, { useState } from 'react';

export default function Blackjack() {
  const [gameState, setGameState] = useState('betting'); // betting, playing, finished
  const [betAmount, setBetAmount] = useState(10);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState(5000);
  const [winnings, setWinnings] = useState(0);

  const cardDeck = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const getCardValue = (card) => {
    if (card === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card)) return 10;
    return parseInt(card);
  };

  const calculateScore = (hand) => {
    let score = hand.reduce((sum, card) => sum + getCardValue(card), 0);
    let aces = hand.filter(c => c === 'A').length;

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  };

  const drawCard = () => Math.floor(Math.random() * cardDeck.length);

  const startGame = () => {
    if (betAmount > balance) {
      alert('Insufficient balance!');
      return;
    }

    const newPlayer = [cardDeck[drawCard()], cardDeck[drawCard()]];
    const newDealer = [cardDeck[drawCard()], cardDeck[drawCard()]];

    setPlayerHand(newPlayer);
    setDealerHand(newDealer);
    setPlayerScore(calculateScore(newPlayer));
    setDealerScore(calculateScore([newDealer[0]]));
    setGameState('playing');
    setResult('');
  };

  const hit = () => {
    const newCard = cardDeck[drawCard()];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    const newScore = calculateScore(newHand);
    setPlayerScore(newScore);

    if (newScore > 21) {
      endGame(newScore, dealerScore, 'bust');
    }
  };

  const stand = () => {
    let newDealerHand = [...dealerHand];
    let newDealerScore = calculateScore(newDealerHand);

    while (newDealerScore < 17) {
      newDealerHand.push(cardDeck[drawCard()]);
      newDealerScore = calculateScore(newDealerHand);
    }

    setDealerHand(newDealerHand);
    setDealerScore(newDealerScore);
    endGame(playerScore, newDealerScore, 'stand');
  };

  const endGame = (pScore, dScore, reason) => {
    let resultMsg = '';
    let win = 0;

    if (reason === 'bust') {
      resultMsg = '💥 BUST! Dealer wins!';
    } else if (dScore > 21) {
      resultMsg = '🎉 Dealer bust! You win!';
      win = betAmount * 2;
    } else if (pScore > dScore) {
      resultMsg = '🎉 You win!';
      win = betAmount * 2;
    } else if (pScore < dScore) {
      resultMsg = '😢 Dealer wins!';
    } else {
      resultMsg = '🤝 Push! Tie!';
      win = betAmount;
    }

    setResult(resultMsg);
    setBalance(prev => prev - betAmount + win);
    setWinnings(win);
    setGameState('finished');
  };

  const playAgain = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setResult('');
    setWinnings(0);
  };

  return (
    <div className="blackjack-game">
      <div className="game-header">
        <h1>♠️ BLACKJACK 3036</h1>
        <div className="balance-display">
          <span className="balance">💰 {balance.toFixed(2)} NEXUS</span>
        </div>
      </div>

      {gameState === 'betting' && (
        <div className="betting-phase">
          <div className="bet-input">
            <label>PLACE YOUR BET</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={balance}
            />
            <button className="btn-deal" onClick={startGame}>
              🎯 DEAL
            </button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'finished') && (
        <div className="game-area">
          <div className="dealer-section">
            <h3>DEALER</h3>
            <div className="cards-display">
              {dealerHand.map((card, idx) => (
                <div key={idx} className="card">{card}</div>
              ))}
            </div>
            <div className="score">Score: {dealerScore}</div>
          </div>

          <div className="player-section">
            <h3>YOU</h3>
            <div className="cards-display">
              {playerHand.map((card, idx) => (
                <div key={idx} className="card">{card}</div>
              ))}
            </div>
            <div className="score">Score: {playerScore}</div>
          </div>

          {gameState === 'playing' && (
            <div className="action-buttons">
              <button className="btn-action" onClick={hit}>🎴 HIT</button>
              <button className="btn-action" onClick={stand}>✋ STAND</button>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="game-result">
              <div className="result-message">{result}</div>
              <div className="winnings">Winnings: ${winnings.toFixed(2)}</div>
              <button className="btn-action" onClick={playAgain}>🔄 PLAY AGAIN</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
