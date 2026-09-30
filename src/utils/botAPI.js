// Bot API Helper Functions
// Easy-to-use wrapper for backend bot endpoints

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Get bot decision for current hand situation
 * @param {string} botName - Name of the bot (ProBot, SharpBot, etc)
 * @param {number} botLevel - Bot difficulty level (1-4)
 * @param {number} handRank - Hand strength 1-10
 * @param {string} position - Table position (early, middle, late, button)
 * @param {number} potSize - Current pot size in chips
 * @param {number} opponents - Number of opponents
 * @returns {Promise} Bot decision object
 */
export async function getBotDecision(botName, botLevel, handRank, position, potSize, opponents) {
  try {
    const params = new URLSearchParams({
      handRank,
      position,
      potSize,
      opponents,
      botLevel,
      botName
    });

    const response = await fetch(`/api/bots/decision?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to get bot decision');
    return await response.json();
  } catch (error) {
    console.error('Bot decision error:', error);
    return {
      action: 'CALL',
      confidence: 50,
      reason: 'Default conservative play',
      suggestion: 'Call to see more cards'
    };
  }
}

/**
 * Get real-time coaching advice
 * @param {number} handRank - Hand strength 1-10
 * @param {string} position - Table position
 * @param {number} potSize - Current pot
 * @param {number} opponents - Number of opponents
 * @param {string} phase - Game phase (playing, results, ended)
 * @returns {Promise} Coaching advice object
 */
export async function getCoachingAdvice(handRank, position, potSize, opponents, phase = 'playing') {
  try {
    const params = new URLSearchParams({
      handRank,
      position,
      potSize,
      opponents,
      phase
    });

    const response = await fetch(`/api/coaching/advice?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to get coaching advice');
    return await response.json();
  } catch (error) {
    console.error('Coaching error:', error);
    return {
      strength: 50,
      tips: ['Play cautiously'],
      recommendedAction: 'Observe the table',
      feedback: null
    };
  }
}

/**
 * Save game results to database
 * @param {string} userId - User ID from Auth
 * @param {string} playerName - Player's display name
 * @param {number} buyIn - Initial buy-in
 * @param {number} finalStack - Final chip stack
 * @param {number} duration - Game duration in seconds
 * @param {number} handsPlayed - Number of hands
 * @param {array} bots - Array of bot names played against
 * @param {string} winner - Name of winner
 * @param {boolean} coachingEnabled - Was coaching on
 * @param {string} difficulty - Game difficulty level
 * @returns {Promise} Save result
 */
export async function saveGameResults({
  userId,
  playerName,
  buyIn = 100,
  finalStack = 0,
  duration = 0,
  handsPlayed = 1,
  bots = [],
  winner = '',
  coachingEnabled = false,
  difficulty = 'casual'
}) {
  try {
    const profit = finalStack - buyIn;

    const response = await fetch('/api/games/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        playerName,
        buyIn,
        finalStack,
        profit,
        duration,
        handsPlayed,
        bots,
        winner,
        coachingEnabled,
        difficulty
      })
    });

    if (!response.ok) throw new Error('Failed to save game');
    return await response.json();
  } catch (error) {
    console.error('Save game error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch get decisions for all bots at the table
 * @param {array} bots - Array of bot configs [{name, level}, ...]
 * @param {number} handRank - Hand strength
 * @param {string} position - Position
 * @param {number} potSize - Pot size
 * @param {number} opponents - Opponent count
 * @returns {Promise} Array of bot decisions
 */
export async function getAllBotDecisions(bots, handRank, position, potSize, opponents) {
  try {
    const promises = bots.map(bot =>
      getBotDecision(bot.name, bot.level, handRank, position, potSize, opponents - 1)
    );

    const decisions = await Promise.all(promises);
    return decisions.map((decision, idx) => ({
      ...decision,
      botName: bots[idx].name,
      botLevel: bots[idx].level
    }));
  } catch (error) {
    console.error('Batch decisions error:', error);
    return [];
  }
}

/**
 * Get teaching content from database
 * @param {string} category - Category (hand_rankings, concepts, strategies)
 * @returns {Promise} Array of content
 */
export async function getTeachingContent(category) {
  try {
    const response = await fetch(`/api/teaching/content?category=${category}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to get teaching content');
    return await response.json();
  } catch (error) {
    console.error('Teaching content error:', error);
    return [];
  }
}

/**
 * Calculate hand strength for display
 * @param {number} handRank - Rank 1-10
 * @returns {object} Strength data for UI
 */
export function calculateHandStrength(handRank) {
  const strength = Math.round((handRank / 10) * 100);

  let color = '#666'; // Gray
  if (strength >= 90) color = '#00ff88'; // Green
  else if (strength >= 70) color = '#FFD700'; // Gold
  else if (strength >= 50) color = '#FF6B9D'; // Pink
  else if (strength >= 30) color = '#FFA500'; // Orange
  else if (strength >= 10) color = '#FF4444'; // Red

  return {
    strength,
    color,
    label: strength >= 70 ? 'Strong' : strength >= 40 ? 'Medium' : 'Weak'
  };
}

/**
 * Format currency for display
 * @param {number} amount - Amount in chips
 * @returns {string} Formatted string
 */
export function formatChips(amount) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

/**
 * Get bot personality comment for action
 * @param {string} botName - Bot name
 * @param {string} action - Action taken
 * @returns {string} Comment
 */
export function getBotComment(botName, action) {
  const comments = {
    ProBot: {
      RAISE: 'raises the stakes aggressively!',
      CALL: 'calls with confidence',
      FOLD: 'folds and waits for better cards',
      BLUFF: 'makes a calculated bluff'
    },
    SharpBot: {
      RAISE: 'raises sharply!',
      CALL: 'calls strategically',
      FOLD: 'folds wisely',
      BLUFF: 'executes a sharp bluff'
    },
    FishBot: {
      RAISE: 'bets aggressively',
      CALL: 'calls along',
      FOLD: 'folds quickly',
      BLUFF: 'tries to bluff'
    },
    BalancedAI: {
      RAISE: 'raises moderately',
      CALL: 'calls sensibly',
      FOLD: 'folds cautiously',
      BLUFF: 'considers a bluff'
    }
  };

  const botComments = comments[botName] || comments.BalancedAI;
  return botComments[action] || 'makes a move';
}

export default {
  getBotDecision,
  getCoachingAdvice,
  saveGameResults,
  getAllBotDecisions,
  getTeachingContent,
  calculateHandStrength,
  formatChips,
  getBotComment
};
