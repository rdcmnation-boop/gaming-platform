// Comprehensive AI Bot System: Teaching, Playing, Coaching, and Combined
import { HAND_RANKS } from './pokerLogic';

// ============================================================================
// TEACHING BOT - Educational content and poker strategy lessons
// ============================================================================
export const TeachingBot = {
  name: 'TeachingBot',
  type: 'teacher',
  description: 'Teaches poker strategy, hand rankings, and optimal plays',

  handRankings: {
    [HAND_RANKS.ROYAL_FLUSH.rank]: {
      name: 'ROYAL FLUSH',
      description: 'Ace-high straight flush (A-K-Q-J-10, all same suit)',
      probability: 'Rarest hand: 1 in 649,740',
      strategy: 'This is the best possible hand. Always play it aggressively.',
      example: '♠A ♠K ♠Q ♠J ♠10'
    },
    [HAND_RANKS.STRAIGHT_FLUSH.rank]: {
      name: 'STRAIGHT FLUSH',
      description: 'Five cards in sequence, all of the same suit',
      probability: '1 in 72,193',
      strategy: 'Extremely strong hand. Bet confidently and try to extract value.',
      example: '♥9 ♥8 ♥7 ♥6 ♥5'
    },
    [HAND_RANKS.FOUR_OF_A_KIND.rank]: {
      name: 'FOUR OF A KIND',
      description: 'Four cards of the same rank',
      probability: '1 in 4,165',
      strategy: 'Very strong hand. Raise bets to build the pot and maximize winnings.',
      example: '♠K ♥K ♦K ♣K ♠2'
    },
    [HAND_RANKS.FULL_HOUSE.rank]: {
      name: 'FULL HOUSE',
      description: 'Three of a kind plus a pair',
      probability: '1 in 694',
      strategy: 'Strong hand. Bet with confidence, but watch for straight/flush possibilities.',
      example: '♠7 ♥7 ♦7 ♣3 ♠3'
    },
    [HAND_RANKS.FLUSH.rank]: {
      name: 'FLUSH',
      description: 'Five cards of the same suit (not in sequence)',
      probability: '1 in 509',
      strategy: 'Solid hand. Bet moderately; be cautious of full houses or straights.',
      example: '♦K ♦J ♦8 ♦5 ♦2'
    },
    [HAND_RANKS.STRAIGHT.rank]: {
      name: 'STRAIGHT',
      description: 'Five cards in sequence (any suits)',
      probability: '1 in 255',
      strategy: 'Good hand. Standard betting is recommended. Avoid overcommitting.',
      example: '♠9 ♥8 ♦7 ♣6 ♠5'
    },
    [HAND_RANKS.THREE_OF_A_KIND.rank]: {
      name: 'THREE OF A KIND',
      description: 'Three cards of the same rank',
      probability: '1 in 47',
      strategy: 'Decent hand. Play cautiously; watch for opponent betting patterns.',
      example: '♠5 ♥5 ♦5 ♣K ♠9'
    },
    [HAND_RANKS.TWO_PAIR.rank]: {
      name: 'TWO PAIR',
      description: 'Two different pairs',
      probability: '1 in 21',
      strategy: 'Moderate hand. Bet appropriately; fold if opponent shows aggression.',
      example: '♠Q ♥Q ♦7 ♣7 ♠2'
    },
    [HAND_RANKS.ONE_PAIR.rank]: {
      name: 'ONE PAIR',
      description: 'Two cards of the same rank',
      probability: '1 in 2.4',
      strategy: 'Weak-moderate hand. Consider position and opponent tendencies.',
      example: '♠J ♥J ♦8 ♣5 ♠2'
    },
    [HAND_RANKS.HIGH_CARD.rank]: {
      name: 'HIGH CARD',
      description: 'No matching cards (highest card is Ace)',
      probability: 'Most common unpaired hand',
      strategy: 'Weakest hand. Fold unless you have strategic advantage.',
      example: '♠A ♥K ♦Q ♣J ♠9'
    }
  },

  strategies: {
    earlyPosition: 'Play tighter in early position. Only play premium hands (pairs 8+, AK, AQ).',
    middlePosition: 'Expand your range in middle position. Include suited connectors and medium pairs.',
    latePosition: 'Play looser in late position. You have more information about opponent action.',
    aggressive: 'Aggressive play involves raising to build the pot with strong hands.',
    defensive: 'Conservative play protects your stack when hands are weak.',
    bluffing: 'Bluff sparingly with weak hands when you have a strong story and position.'
  },

  getHandExplanation(handRank) {
    return this.handRankings[handRank] || {
      name: 'UNKNOWN',
      description: 'Hand ranking not found',
      strategy: 'Please check your hand.'
    };
  },

  explainBettingDecision(hand, position, opponents, chipStack) {
    const handInfo = this.getHandExplanation(hand.rank);
    let explanation = `Hand: ${handInfo.name}\n`;
    explanation += `${handInfo.description}\n\n`;
    explanation += `Strategy for ${position} position:\n`;
    explanation += `${this.strategies[position] || 'Standard poker strategy applies.'}\n\n`;
    explanation += `Recommended action: ${handInfo.strategy}`;
    return explanation;
  },

  teachConcept(concept) {
    const concepts = {
      potOdds: 'Pot odds = Amount to call / Total pot size. Compare with hand probability to decide if calling is profitable.',
      position: 'Position is crucial. Late position allows you to act last with more information. Early position requires stronger hands.',
      bankroll: 'Bankroll management: Never risk more than 5% of your total bankroll in a single game to avoid ruin.',
      handSelection: 'Hand selection: Play premium hands early, loosen up in late position based on opponent tendencies.',
      readingOpponents: 'Read opponents: Watch for betting patterns, tells, and consistency. Adapt your strategy accordingly.',
      ranges: 'Hand ranges: Think about what hands your opponents might have, not just your own hand.'
    };
    return concepts[concept] || 'Concept not found. Available: potOdds, position, bankroll, handSelection, readingOpponents, ranges';
  }
};

// ============================================================================
// PLAYING BOT - AI agent with strategic poker decision-making
// ============================================================================
export const PlayingBot = {
  name: 'PlayingBot',
  type: 'player',
  description: 'AI agent that plays poker with configurable difficulty levels',

  getBetDecision(hand, position, potSize, chipStack, opponents, aggressionLevel = 1) {
    const handRank = hand?.rank || 0;
    const handValue = handRank / 10; // Normalize to 0-1
    const opponentCount = opponents.length;
    const potOdds = potSize / (chipStack + potSize);

    // Base bet calculation
    let baseBet = Math.floor(potSize * 0.1);
    let action = 'check';

    // Decision logic based on hand strength and position
    if (handValue > 0.7) {
      // Strong hand
      action = 'raise';
      baseBet = Math.floor(potSize * (0.3 + aggressionLevel * 0.2));
    } else if (handValue > 0.4) {
      // Medium hand
      if (potOdds < 0.3) {
        action = 'call';
        baseBet = potSize * 0.1;
      } else {
        action = 'fold';
      }
    } else {
      // Weak hand
      if (Math.random() < 0.1) {
        // Occasional bluff
        action = 'bluff';
        baseBet = Math.floor(potSize * 0.2);
      } else {
        action = 'fold';
      }
    }

    // Position adjustment
    const positionMultiplier = position === 'latePosition' ? 1.2 : position === 'earlyPosition' ? 0.8 : 1.0;
    baseBet = Math.floor(baseBet * positionMultiplier);

    // Ensure bet doesn't exceed stack
    baseBet = Math.min(baseBet, chipStack);
    baseBet = Math.max(baseBet, 10); // Minimum bet

    return {
      action,
      amount: baseBet,
      reasoning: this.getActionReasoning(action, handValue, aggressionLevel)
    };
  },

  getActionReasoning(action, handValue, aggressionLevel) {
    const reasons = {
      raise: 'Strong hand detected. Raising to build the pot and extract value.',
      call: 'Moderate hand with acceptable odds. Calling to see more cards.',
      fold: 'Weak hand with poor odds. Folding to preserve chipstack.',
      check: 'Uncertain hand strength. Checking to see opponent action.',
      bluff: 'Position and situation favor a bluff attempt.'
    };
    return reasons[action] || 'Standard play.';
  },

  adjustDifficulty(level) {
    const difficulties = {
      1: { name: 'Fish', aggressiveness: 0.3, cardSelection: 0.5, bluffFrequency: 0.05 },
      2: { name: 'Casual', aggressiveness: 0.6, cardSelection: 0.7, bluffFrequency: 0.1 },
      3: { name: 'Balanced', aggressiveness: 0.75, cardSelection: 0.85, bluffFrequency: 0.15 },
      4: { name: 'Sharp', aggressiveness: 0.9, cardSelection: 0.95, bluffFrequency: 0.25 }
    };
    return difficulties[level] || difficulties[2];
  }
};

// ============================================================================
// COACHING BOT - Real-time advice and feedback during gameplay
// ============================================================================
export const CoachingBot = {
  name: 'CoachingBot',
  type: 'coach',
  description: 'Provides real-time coaching and strategic advice during gameplay',

  getCoachingAdvice(currentHand, decision, pot, position, opponents, gamePhase) {
    let advice = [];

    // Hand strength analysis
    if (currentHand?.rank >= 7) {
      advice.push('💪 Strong hand! Consider raising to build the pot.');
    } else if (currentHand?.rank >= 4) {
      advice.push('📊 Moderate hand. Play cautiously and observe opponent reactions.');
    } else {
      advice.push('⚠️ Weak hand. Consider folding unless you have position advantage.');
    }

    // Position-based advice
    if (position === 'latePosition') {
      advice.push('✅ You have position advantage! Use it to see opponents before acting.');
    } else if (position === 'earlyPosition') {
      advice.push('📍 Early position: Play premium hands only to avoid tough spots.');
    }

    // Bet sizing advice
    if (decision?.amount > pot * 0.5) {
      advice.push('💸 Large bet detected. Ensure this represents your hand strength accurately.');
    } else if (decision?.amount < pot * 0.05) {
      advice.push('💰 Consider betting more with strong hands to build value.');
    }

    // Opponent count advice
    if (opponents?.length > 3) {
      advice.push('👥 Multiple opponents: Play tighter; bluffing is less effective.');
    }

    return advice;
  },

  replayAnalysis(hand, playerDecision, actualResult) {
    const analysis = {
      handStrength: TeachingBot.getHandExplanation(hand.rank),
      decisionMade: playerDecision,
      result: actualResult,
      feedback: ''
    };

    if (actualResult.won && playerDecision === 'fold') {
      analysis.feedback = '❌ Missed opportunity: You folded a winning hand. Consider pot odds more carefully next time.';
    } else if (!actualResult.won && playerDecision === 'raise') {
      analysis.feedback = '📈 Learning moment: Your raise was called and you lost. Opponent may have read your bet.';
    } else if (actualResult.won) {
      analysis.feedback = '✅ Excellent decision! Your play resulted in a win.';
    } else {
      analysis.feedback = '💭 Better luck next hand. Poker involves variance—review your decision rationale, not just results.';
    }

    return analysis;
  },

  suggestNextMove(hand, currentPot, chipStack, opponents) {
    const handStrength = hand?.rank || 0;
    const stackSize = chipStack / (currentPot || 1);

    let suggestion = '';

    if (handStrength >= 8) {
      suggestion = '🎯 PUSH with your strong hand. Build the pot aggressively.';
    } else if (handStrength >= 5 && stackSize > 5) {
      suggestion = '🤔 CALL to see more cards. Your hand has potential.';
    } else if (handStrength >= 3 && stackSize < 3) {
      suggestion = '🚨 ALL-IN might be necessary. Protect your remaining chips.';
    } else {
      suggestion = '❌ FOLD. Preserve your chipstack for better opportunities.';
    }

    return suggestion;
  }
};

// ============================================================================
// COMBINED BOT SYSTEM - Integrates Teaching, Playing, and Coaching
// ============================================================================
export const CombinedBotSystem = {
  name: 'CombinedBot',
  type: 'combined',
  description: 'Unified bot system combining teaching, playing, and coaching capabilities',

  modes: {
    learning: 'Learn poker fundamentals and strategy',
    playing: 'Play against AI with real-time coaching',
    coaching: 'Get advice from coach while you play'
  },

  bots: {
    teacher: TeachingBot,
    player: PlayingBot,
    coach: CoachingBot
  },

  createBotInstance(botType, configuration = {}) {
    const baseConfig = {
      name: botType,
      difficulty: configuration.difficulty || 2,
      aggressiveness: configuration.aggressiveness || 0.5,
      coachingEnabled: configuration.coachingEnabled !== false,
      teachingMode: configuration.teachingMode || false,
      personality: configuration.personality || 'neutral'
    };

    if (botType === 'teacher' || configuration.teachingEnabled) {
      return { ...baseConfig, ...TeachingBot };
    } else if (botType === 'coach' || configuration.coachingEnabled) {
      return { ...baseConfig, ...CoachingBot, playerBot: PlayingBot };
    } else {
      return { ...baseConfig, ...PlayingBot };
    }
  },

  runGameSession(gameConfig) {
    const session = {
      id: Math.random().toString(36).substr(2, 9),
      config: gameConfig,
      hands: [],
      stats: {
        userWins: 0,
        botWins: 0,
        breakeven: 0,
        lessonsLearned: []
      },
      currentHand: null
    };

    return session;
  },

  analyzeGameSession(session) {
    const winRate = session.stats.userWins / (session.hands?.length || 1);
    const insights = [];

    if (winRate < 0.3) {
      insights.push('Hand selection needs improvement. Review the hand rankings lesson.');
    }
    if (session.stats.lessonsLearned.includes('position')) {
      insights.push('Good position awareness! You\'re learning when to play more hands.');
    }

    return {
      summary: `You won ${session.stats.userWins}/${session.hands?.length} hands (${(winRate * 100).toFixed(1)}%)`,
      insights,
      recommendations: this.getRecommendations(winRate)
    };
  },

  getRecommendations(winRate) {
    if (winRate > 0.6) return ['Great job! Try harder opponents.'];
    if (winRate > 0.4) return ['Solid play. Work on late position play.', 'Study bluffing strategies.'];
    if (winRate > 0.2) return ['Focus on hand selection.', 'Learn pot odds calculation.', 'Study position strategy.'];
    return ['Start with teaching mode to learn fundamentals.'];
  }
};

// ============================================================================
// BOT PERSONALITY SYSTEM - Contextual commentary
// ============================================================================
export const BotPersonalities = {
  mentor: {
    name: 'Mentor',
    commentary: {
      teaching: 'Let me explain why this play is optimal...',
      strong_hand: 'Excellent hand! This is a premium hand to play.',
      weak_hand: 'This hand has limited potential. Consider folding.',
      mistake: 'I notice you might have overlooked something. Here\'s what happened...'
    }
  },
  sharp: {
    name: 'Sharp',
    commentary: {
      aggressive: 'Raising! I like the aggression here.',
      strong_hand: 'This is money. Playing it hard.',
      weak_hand: 'Folding the junk. Can\'t win with this.',
      mistake: 'That play was too loose. You\'re bleeding chips.'
    }
  },
  friendly: {
    name: 'Friendly',
    commentary: {
      winning: 'Nice win! Great decision!',
      losing: 'Unlucky. Variance happens—keep playing well!',
      learning: 'You\'re getting better at this!',
      help: 'Want some tips? I\'m here to help!'
    }
  },
  analytical: {
    name: 'Analytical',
    commentary: {
      decision: 'Based on hand probability and pot odds...',
      strategy: 'Let me break down the math for you...',
      mistake: 'Analyzing that decision: the expected value was negative.',
      success: 'That decision has positive expected value over time.'
    }
  }
};

export default {
  TeachingBot,
  PlayingBot,
  CoachingBot,
  CombinedBotSystem,
  BotPersonalities
};
