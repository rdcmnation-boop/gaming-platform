// 🤖 Autonomous Betting Bot
// Places bets automatically based on strategies and algorithms

class BettingBot {
  constructor(options = {}) {
    this.name = options.name || 'BettingBot';
    this.bankroll = options.bankroll || 10000;
    this.initialBankroll = this.bankroll;
    this.maxRiskPerBet = options.maxRiskPerBet || 0.05; // 5% of bankroll
    this.strategy = options.strategy || 'value'; // value, kelly, aggressive, conservative
    this.profitTarget = options.profitTarget || 0.10; // 10% profit goal
    this.lossLimit = options.lossLimit || 0.20; // Stop if down 20%
    this.totalBets = 0;
    this.winBets = 0;
    this.loseBets = 0;
    this.bets = [];
    this.stats = {
      totalWins: 0,
      totalLosses: 0,
      totalProfit: 0,
      winRate: 0,
      roi: 0,
      maxWin: 0,
      maxLoss: 0
    };
  }

  /**
   * Decide whether to place a bet
   * @param {object} opportunity - Betting opportunity
   * @returns {object} Decision with bet amount and details
   */
  decideBet(opportunity) {
    // Check if we should even consider this bet
    if (!this.shouldBet(opportunity)) {
      return { shouldBet: false, reason: 'Filters did not pass' };
    }

    // Calculate bet amount based on strategy
    const betAmount = this.calculateBetSize(opportunity);

    // Calculate expected value
    const ev = this.calculateEV(opportunity, betAmount);

    // Make decision
    const decision = {
      shouldBet: ev > 0,
      amount: betAmount,
      ev,
      expectedProfit: ev * opportunity.odds,
      confidence: this.calculateConfidence(opportunity),
      reason: this.getReason(opportunity, ev)
    };

    return decision;
  }

  /**
   * Pre-bet filters - quickly reject bad opportunities
   */
  shouldBet(opportunity) {
    // Check if bankroll is within limits
    if (this.bankroll <= this.initialBankroll * (1 - this.lossLimit)) {
      return false; // Hit loss limit
    }

    if (this.bankroll >= this.initialBankroll * (1 + this.profitTarget)) {
      return false; // Hit profit target - STOP BETTING
    }

    // Require minimum odds value
    if (!opportunity.odds || opportunity.odds < 1.5) {
      return false;
    }

    // Require positive expected value
    if (opportunity.probability <= 0 || opportunity.probability >= 1) {
      return false;
    }

    // Value filter: odds * probability > 1
    const valueRatio = opportunity.odds * opportunity.probability;
    if (valueRatio < 1.1) {
      return false; // Need at least 10% value edge
    }

    return true;
  }

  /**
   * Calculate bet size based on strategy
   */
  calculateBetSize(opportunity) {
    const maxBet = this.bankroll * this.maxRiskPerBet;

    switch (this.strategy) {
      case 'kelly':
        // Kelly Criterion: f = (bp - q) / b
        // where b=odds-1, p=probability, q=1-p
        const b = opportunity.odds - 1;
        const p = opportunity.probability;
        const q = 1 - p;
        const kelly = (b * p - q) / b;
        return Math.max(10, Math.min(maxBet, this.bankroll * kelly * 0.25)); // Use 25% of Kelly

      case 'value':
        // Bet more on high confidence, low risk bets
        const valueEdge = (opportunity.odds * opportunity.probability) - 1;
        return Math.max(10, Math.min(maxBet, maxBet * (valueEdge / 0.5)));

      case 'aggressive':
        // Risk max on every bet
        return maxBet;

      case 'conservative':
        // Risk only 2% per bet
        return this.bankroll * 0.02;

      default:
        return maxBet * 0.5;
    }
  }

  /**
   * Calculate expected value of a bet
   */
  calculateEV(opportunity, betAmount) {
    const winAmount = betAmount * (opportunity.odds - 1);
    const loseAmount = betAmount;

    const ev = (opportunity.probability * winAmount) - ((1 - opportunity.probability) * loseAmount);
    return ev / betAmount; // Return as ROI percentage
  }

  /**
   * Calculate confidence score 0-100
   */
  calculateConfidence(opportunity) {
    // Higher confidence for:
    // - Better odds
    // - Higher probability
    // - Lower variance

    let confidence = 50; // Base

    // Probability confidence
    const probDiff = Math.abs(opportunity.probability - 0.5);
    confidence += probDiff * 50; // 0-50 points

    // Odds value confidence
    const valueRatio = opportunity.odds * opportunity.probability;
    confidence += Math.max(0, (valueRatio - 1) * 25); // 0-25 points

    // Consensus confidence (if available)
    if (opportunity.consensus !== undefined) {
      confidence += opportunity.consensus * 25; // 0-25 points
    }

    return Math.min(99, Math.max(1, confidence));
  }

  /**
   * Record a bet result
   */
  recordBet(bet) {
    this.totalBets++;
    this.bets.push({
      ...bet,
      timestamp: new Date(),
      bankrollBefore: this.bankroll
    });

    if (bet.won) {
      this.winBets++;
      this.bankroll += bet.winAmount;
      this.stats.totalWins++;
      this.stats.totalProfit += bet.winAmount;
      this.stats.maxWin = Math.max(this.stats.maxWin, bet.winAmount);
    } else {
      this.loseBets++;
      this.bankroll -= bet.betAmount;
      this.stats.totalLosses++;
      this.stats.totalProfit -= bet.betAmount;
      this.stats.maxLoss = Math.max(this.stats.maxLoss, bet.betAmount);
    }

    // Update stats
    this.stats.winRate = this.winBets / this.totalBets;
    this.stats.roi = this.stats.totalProfit / this.initialBankroll;

    return {
      bankroll: this.bankroll,
      profit: this.stats.totalProfit,
      winRate: this.stats.winRate,
      roi: this.stats.roi
    };
  }

  /**
   * Get reason for bet decision
   */
  getReason(opportunity, ev) {
    if (ev <= 0) {
      return 'Negative expected value';
    }

    const valueRatio = opportunity.odds * opportunity.probability;
    if (valueRatio < 1.1) {
      return 'Insufficient value edge';
    }

    if (opportunity.probability > 0.75) {
      return 'High confidence play - Strong bet';
    }

    if (opportunity.probability > 0.60) {
      return 'Good value - Solid opportunity';
    }

    return 'Value detected - Medium confidence';
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      ...this.stats,
      bankroll: this.bankroll,
      initialBankroll: this.initialBankroll,
      totalBets: this.totalBets,
      winBets: this.winBets,
      loseBets: this.loseBets,
      strategy: this.strategy,
      profitGoal: this.initialBankroll * this.profitTarget,
      lossLimit: this.initialBankroll * (1 - this.lossLimit)
    };
  }

  /**
   * Get recent bets
   */
  getRecentBets(count = 10) {
    return this.bets.slice(-count).reverse();
  }

  /**
   * Predict outcome for analysis
   */
  predictOutcome(bet) {
    // Simulate expected outcome
    return {
      expectedValue: bet.expectedValue,
      profitIfWin: bet.winAmount,
      lossIfLose: bet.betAmount,
      breakEven: bet.breakEvenOdds,
      recommendation: bet.expectedValue > 0 ? '✅ BET' : '❌ SKIP'
    };
  }
}

/**
 * Sports Betting Strategy - analyzes sports data
 */
class SportsBettingStrategy {
  static analyzeGame(gameData) {
    // Analyze team stats, player injuries, weather, etc.
    const analysis = {
      homeTeamStrength: this.calculateTeamStrength(gameData.homeTeam),
      awayTeamStrength: this.calculateTeamStrength(gameData.awayTeam),
      homeWinProbability: 0,
      awayWinProbability: 0,
      confidence: 0
    };

    // Calculate win probabilities
    const strengthRatio = analysis.homeTeamStrength / (analysis.homeTeamStrength + analysis.awayTeamStrength);
    analysis.homeWinProbability = strengthRatio;
    analysis.awayWinProbability = 1 - strengthRatio;

    // Calculate confidence
    analysis.confidence = Math.abs(strengthRatio - 0.5) * 2 * 100;

    return analysis;
  }

  static calculateTeamStrength(team) {
    let strength = 50; // Base

    // Win rate
    if (team.winRate !== undefined) {
      strength += team.winRate * 30;
    }

    // Points per game
    if (team.ppg !== undefined) {
      strength += Math.min(20, team.ppg / 5);
    }

    // Defense rating
    if (team.defenseRating !== undefined) {
      strength += Math.min(20, (110 - team.defenseRating) / 3);
    }

    // Injuries
    if (team.keyInjuries !== undefined) {
      strength -= team.keyInjuries * 5;
    }

    return Math.max(10, Math.min(90, strength));
  }

  static findBettingOpportunities(games) {
    return games.map(game => {
      const analysis = this.analyzeGame(game);

      // Find value bets (when odds != probability)
      const opportunities = [];

      // Home team opportunity
      if (game.homeOdds && (game.homeOdds * analysis.homeWinProbability) > 1.05) {
        opportunities.push({
          type: 'moneyline',
          team: 'home',
          odds: game.homeOdds,
          probability: analysis.homeWinProbability,
          confidence: analysis.confidence,
          value: game.homeOdds * analysis.homeWinProbability
        });
      }

      // Away team opportunity
      if (game.awayOdds && (game.awayOdds * analysis.awayWinProbability) > 1.05) {
        opportunities.push({
          type: 'moneyline',
          team: 'away',
          odds: game.awayOdds,
          probability: analysis.awayWinProbability,
          confidence: analysis.confidence,
          value: game.awayOdds * analysis.awayWinProbability
        });
      }

      return {
        game,
        analysis,
        opportunities
      };
    });
  }
}

/**
 * Parlay Strategy - combine multiple bets
 */
class ParlayStrategy {
  static buildParlay(bets) {
    // Calculate combined odds
    const combinedOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);

    // Calculate combined probability
    const combinedProbability = bets.reduce((acc, bet) => acc * bet.probability, 1);

    return {
      bets,
      combinedOdds,
      combinedProbability,
      expectedValue: (combinedOdds * combinedProbability) - 1,
      recommendation: combinedProbability > 0.30 ? '✅ CONSIDER' : '❌ TOO RISKY'
    };
  }

  static suggestParlay(opportunities, maxBets = 3) {
    if (opportunities.length < 2) return null;

    // Sort by confidence
    const sorted = [...opportunities].sort((a, b) => b.confidence - a.confidence);

    // Take top N
    const selected = sorted.slice(0, maxBets);

    return this.buildParlay(selected);
  }
}

export { BettingBot, SportsBettingStrategy, ParlayStrategy };
