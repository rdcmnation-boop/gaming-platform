// Vercel Serverless Function
// GET /api/coaching/advice?handRank=9&position=late&potSize=500&opponents=2&phase=playing

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { handRank, position, potSize, opponents, phase } = req.query;

    const rank = parseInt(handRank) || 5;
    const pot = parseInt(potSize) || 100;
    const opponentCount = parseInt(opponents) || 3;

    const advice = getCoachingAdvice(rank, position, pot, opponentCount, phase);

    res.status(200).json(advice);
  } catch (error) {
    console.error('Coaching error:', error);
    res.status(500).json({ error: error.message });
  }
}

function getCoachingAdvice(handRank, position, potSize, opponents, phase) {
  // Hand strength 0-100
  const strength = Math.round((handRank / 10) * 100);

  // Get tips based on situation
  const tips = getTips(handRank, position, opponents);
  const action = getRecommendedAction(handRank, position, potSize, opponents);
  const feedback = getFeedback(handRank, phase);

  return {
    strength,
    tips,
    recommendedAction: action,
    feedback,
    stats: {
      pot: potSize,
      opponents,
      position,
      phase
    }
  };
}

function getTips(handRank, position, opponents) {
  const tips = [];

  // Hand strength tips
  if (handRank >= 8) {
    tips.push('💪 Strong hand detected. Consider raising to build the pot.');
  } else if (handRank >= 5) {
    tips.push('📊 Medium hand. Play cautiously and observe opponents.');
  } else {
    tips.push('⚠️ Weak hand. Consider folding unless in steal position.');
  }

  // Position tips
  if (position === 'late' || position === 'button') {
    tips.push('🎯 You have position advantage! Use it to control the pot.');
  } else if (position === 'early') {
    tips.push('📍 Early position: Play tight, only premium hands.');
  }

  // Opponent tips
  if (opponents >= 4) {
    tips.push('👥 Many opponents: Play tighter, focus on strong hands.');
  } else if (opponents === 1) {
    tips.push('1v1 situations: Play more hands, use aggression.');
  }

  return tips;
}

function getRecommendedAction(handRank, position, potSize, opponents) {
  let action = '';

  if (handRank >= 8) {
    action = '🎯 PUSH with your strong hand. Build the pot aggressively.';
  } else if (handRank >= 5) {
    action = '📊 CALL to see more cards. Gather information about opponents.';
  } else if (handRank >= 3 && (position === 'late' || position === 'button')) {
    action = '🎭 Consider a STEAL raise from late position.';
  } else {
    action = '❌ FOLD this hand. Wait for better opportunities.';
  }

  return action;
}

function getFeedback(handRank, phase) {
  if (phase === 'results' || phase === 'ended') {
    const feedbackOptions = [
      { icon: '✅', message: 'Excellent decision! Your play resulted in a win.' },
      { icon: '📈', message: 'Good aggression. You applied pressure effectively.' },
      { icon: '💭', message: 'Better luck next hand. Variance happens—focus on good decisions.' },
      { icon: '❌', message: 'Missed opportunity: You folded a winning hand.' },
      { icon: '🎓', message: 'Learning moment: Review your decision-making process.' },
      { icon: '💰', message: 'Great bankroll management! You protected your chips.' }
    ];

    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }

  return null;
}
