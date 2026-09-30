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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Get active bets (pending or in progress)
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending_approval', 'active', 'live'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate totals
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    const totalPotentialWin = bets.reduce(
      (sum, bet) => sum + (bet.bet_amount * (bet.odds - 1)),
      0
    );
    const avgConfidence = bets.length > 0
      ? bets.reduce((sum, bet) => sum + bet.confidence, 0) / bets.length
      : 0;
    const totalEV = bets.reduce((sum, bet) => sum + (bet.expected_value || 0), 0);

    return res.status(200).json({
      status: 'success',
      activeBets: bets.map(bet => ({
        id: bet.id,
        team: bet.team,
        gameId: bet.game_id,
        homeTeam: bet.home_team,
        awayTeam: bet.away_team,
        matchTime: bet.match_time,
        betAmount: bet.bet_amount,
        odds: bet.odds,
        potentialWin: bet.bet_amount * (bet.odds - 1),
        confidence: bet.confidence,
        expectedValue: bet.expected_value,
        status: bet.status,
        result: bet.result,
        createdAt: bet.created_at
      })),
      summary: {
        activeBetsCount: bets.length,
        totalBetAmount,
        totalPotentialWin,
        averageConfidence: Math.round(avgConfidence),
        totalExpectedValue: totalEV.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Active bets error:', error);
    return res.status(500).json({ error: error.message });
  }
}
