// Poker hand rankings and evaluation logic
export const HAND_RANKS = {
  ROYAL_FLUSH: { rank: 10, name: 'ROYAL FLUSH' },
  STRAIGHT_FLUSH: { rank: 9, name: 'STRAIGHT FLUSH' },
  FOUR_OF_A_KIND: { rank: 8, name: 'FOUR OF A KIND' },
  FULL_HOUSE: { rank: 7, name: 'FULL HOUSE' },
  FLUSH: { rank: 6, name: 'FLUSH' },
  STRAIGHT: { rank: 5, name: 'STRAIGHT' },
  THREE_OF_A_KIND: { rank: 4, name: 'THREE OF A KIND' },
  TWO_PAIR: { rank: 3, name: 'TWO PAIR' },
  ONE_PAIR: { rank: 2, name: 'ONE PAIR' },
  HIGH_CARD: { rank: 1, name: 'HIGH CARD' }
};

export function generateRandomHand() {
  const hands = [
    HAND_RANKS.ROYAL_FLUSH,
    HAND_RANKS.STRAIGHT_FLUSH,
    HAND_RANKS.FOUR_OF_A_KIND,
    HAND_RANKS.FULL_HOUSE,
    HAND_RANKS.FLUSH,
    HAND_RANKS.STRAIGHT,
    HAND_RANKS.THREE_OF_A_KIND,
    HAND_RANKS.TWO_PAIR,
    HAND_RANKS.ONE_PAIR,
    HAND_RANKS.HIGH_CARD
  ];

  // Weight towards lower hands for realism
  return hands[Math.floor(Math.random() * hands.length)];
}

export function evaluateWinner(players) {
  // Returns array of winning player indices
  if (!players || players.length === 0) return [];

  let maxRank = 0;
  let winners = [];

  players.forEach((player, idx) => {
    const handRank = player.hand?.rank || 0;
    if (handRank > maxRank) {
      maxRank = handRank;
      winners = [idx];
    } else if (handRank === maxRank) {
      winners.push(idx);
    }
  });

  return winners;
}

export function calculatePayout(totalPot, winnerCount) {
  return Math.floor(totalPot / winnerCount);
}

export function getBotPersonality(botName) {
  const personalities = {
    'ProBot': {
      style: 'aggressive',
      winRate: 0.80,
      comments: {
        bet: 'raises the stakes',
        win: 'Strong hand. GG.',
        lose: 'Nice hand.',
        fold: 'I fold.'
      }
    },
    'BalancedAI': {
      style: 'strategic',
      winRate: 0.60,
      comments: {
        bet: 'calls your bet',
        win: 'That was close!',
        lose: 'Good play.',
        fold: 'Not this time.'
      }
    },
    'FishBot': {
      style: 'passive',
      winRate: 0.30,
      comments: {
        bet: 'checks in with a bet',
        win: 'Lucky hand!',
        lose: 'Maybe next time!',
        fold: 'I\'m out.'
      }
    },
    'SharpBot': {
      style: 'aggressive',
      winRate: 0.75,
      comments: {
        bet: 'plays aggressively',
        win: 'Read you perfectly.',
        lose: 'Well done.',
        fold: 'Folding.'
      }
    },
    'CasualBot': {
      style: 'casual',
      winRate: 0.50,
      comments: {
        bet: 'places a casual bet',
        win: 'Fun game!',
        lose: 'Nice play!',
        fold: 'I\'m out this round.'
      }
    }
  };

  return personalities[botName] || {
    style: 'standard',
    winRate: 0.50,
    comments: {
      bet: 'places a bet',
      win: 'Wins the hand!',
      lose: 'Good game.',
      fold: 'Folds.'
    }
  };
}

export function formatCurrency(amount) {
  if (amount >= 1000000) {
    return '$' + (amount / 1000000).toFixed(1) + 'M';
  } else if (amount >= 1000) {
    return '$' + (amount / 1000).toFixed(1) + 'K';
  }
  return '$' + amount.toLocaleString();
}
