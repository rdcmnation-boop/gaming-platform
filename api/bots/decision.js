// Vercel Serverless Function
// GET /api/bots/decision?handRank=8&position=late&potSize=500&opponents=3&botLevel=2

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { handRank, position, potSize, opponents, botLevel, botName } = req.query;

    // Convert to numbers
    const rank = parseInt(handRank) || 5;
    const level = parseInt(botLevel) || 2;
    const pot = parseInt(potSize) || 100;
    const opponentCount = parseInt(opponents) || 3;

    // Bot decision logic
    const decision = getBotDecision(rank, position, pot, opponentCount, level);

    // Log decision to Supabase for analytics
    await supabase.from('bot_decisions').insert({
      bot_name: botName || 'Unknown',
      bot_level: level,
      hand_rank: rank,
      position,
      pot_size: pot,
      opponent_count: opponentCount,
      decision: decision.action,
      confidence: decision.confidence,
      created_at: new Date().toISOString()
    });

    res.status(200).json({
      action: decision.action,
      confidence: decision.confidence,
      reason: decision.reason,
      suggestion: decision.suggestion
    });
  } catch (error) {
    console.error('Bot decision error:', error);
    res.status(500).json({ error: error.message });
  }
}

function getBotDecision(handRank, position, potSize, opponents, botLevel) {
  // Hand rank: 1-10 (10 = Royal Flush, 1 = High Card)

  // Position multipliers
  const positionMult = {
    'early': 0.6,
    'middle': 0.8,
    'late': 1.2,
    'button': 1.4
  };

  // Bot personality multipliers (1=Fish, 2=Casual, 3=Sharp, 4=Pro)
  const aggression = [0.3, 0.6, 0.75, 0.9][botLevel - 1] || 0.6;

  // Calculate decision score
  let score = handRank * 10; // Base hand strength (10-100)
  score *= positionMult[position] || 1.0; // Position adjustment
  score *= aggression; // Aggression personality
  score -= (opponents * 5); // More opponents = tighter play
  score += Math.random() * 10; // Add variance

  // Pot odds consideration
  const potOdds = (potSize * 0.1) / potSize; // Simplified pot odds
  const expectedValue = (handRank / 10) * potSize;

  // Determine action
  let action = 'FOLD';
  let confidence = 0;
  let reason = '';
  let suggestion = '';

  if (score > 50) {
    action = 'RAISE';
    confidence = Math.min(95, score);
    reason = `Strong hand (${handRank}/10) with ${position} position advantage`;
    suggestion = `🎯 PUSH with this hand. Build the pot aggressively.`;
  } else if (score > 35) {
    action = 'CALL';
    confidence = Math.min(85, score);
    reason = `Medium hand (${handRank}/10) with decent pot odds`;
    suggestion = `📊 CALL to see more cards. Observe opponent behavior.`;
  } else if (score > 15) {
    action = 'CHECK';
    confidence = Math.min(75, score);
    reason = `Weak hand (${handRank}/10) but possible draw`;
    suggestion = `💭 CHECK if possible. Don't invest more chips.`;
  } else {
    action = 'FOLD';
    confidence = Math.min(90, 100 - score);
    reason = `Weak hand (${handRank}/10) and unfavorable position`;
    suggestion = `❌ FOLD this hand. Wait for better spots.`;
  }

  // Occasional bluff for sharp bots
  if (botLevel >= 3 && Math.random() < 0.15 && action !== 'FOLD') {
    const originalAction = action;
    action = 'BLUFF';
    reason = `${reason} (Attempting a strategic bluff)`;
    suggestion = `🎭 BLUFF: Representing strength with ${originalAction}-worthy hand`;
  }

  return {
    action,
    confidence: Math.round(confidence),
    reason,
    suggestion
  };
}
