import { createClient } from '@supabase/supabase-js';
import { BettingBot, SportsBettingStrategy } from '../../src/utils/BettingBot';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, games, strategy = 'value', bankroll = 10000 } = req.body;

    if (!userId || !games || !Array.isArray(games)) {
      return res.status(400).json({ error: 'Missing required fields: userId, games array' });
    }

    // Initialize betting bot with user settings
    const bot = new BettingBot({
      bankroll,
      strategy,
      maxRiskPerBet: 0.05,
      profitTarget: 0.10,
      lossLimit: 0.20
    });

    // Analyze games and find opportunities
    const opportunities = SportsBettingStrategy.findBettingOpportunities(games);
    const recommendations = [];

    // Get bot decision for each opportunity
    opportunities.forEach(({ game, analysis, opportunities: gameOpps }) => {
      gameOpps.forEach(opp => {
        const decision = bot.decideBet(opp);

        if (decision.shouldBet) {
          recommendations.push({
            gameId: game.id,
            homeTeam: game.homeTeam?.name,
            awayTeam: game.awayTeam?.name,
            matchTime: game.matchTime,
            team: opp.team,
            odds: opp.odds,
            probability: opp.probability,
            confidence: decision.confidence,
            recommendedBetSize: decision.amount,
            expectedValue: decision.ev,
            expectedProfit: decision.expectedProfit,
            reason: decision.reason,
            value: opp.value,
            analysis: analysis
          });
        }
      });
    });

    // Sort by expected value
    recommendations.sort((a, b) => b.expectedValue - a.expectedValue);

    // Log analysis for user
    await supabase
      .from('betting_analysis')
      .insert({
        user_id: userId,
        strategy,
        bankroll,
        opportunities_analyzed: games.length,
        recommendations_count: recommendations.length,
        top_ev: recommendations[0]?.expectedValue || 0,
        created_at: new Date()
      });

    return res.status(200).json({
      status: 'success',
      bankroll: bot.bankroll,
      strategy,
      recommendations,
      summary: {
        total_opportunities: games.length,
        high_confidence_plays: recommendations.filter(r => r.confidence >= 75).length,
        total_ev: recommendations.reduce((sum, r) => sum + r.expectedValue, 0),
        recommended_total_bet: recommendations.reduce((sum, r) => sum + r.recommendedBetSize, 0)
      }
    });
  } catch (error) {
    console.error('Betting analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
}
