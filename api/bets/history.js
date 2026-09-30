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
    const { userId, limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Get bet history
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['won', 'lost', 'push'])
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    // Calculate statistics
    const wonBets = bets.filter(b => b.status === 'won');
    const lostBets = bets.filter(b => b.status === 'lost');
    const pushBets = bets.filter(b => b.status === 'push');

    const totalWinAmount = wonBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalLossAmount = lostBets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    const winRate = bets.length > 0 ? (wonBets.length / bets.length) * 100 : 0;
    const roi = totalBetAmount > 0 ? ((totalWinAmount - totalLossAmount) / totalBetAmount) * 100 : 0;

    // High confidence plays stats
    const highConfidenceBets = bets.filter(b => b.confidence >= 75);
    const highConfidenceWins = highConfidenceBets.filter(b => b.status === 'won').length;
    const highConfidenceWinRate = highConfidenceBets.length > 0
      ? (highConfidenceWins / highConfidenceBets.length) * 100
      : 0;

    return res.status(200).json({
      status: 'success',
      bets: bets.map(bet => ({
        id: bet.id,
        team: bet.team,
        gameId: bet.game_id,
        homeTeam: bet.home_team,
        awayTeam: bet.away_team,
        matchTime: bet.match_time,
        betAmount: bet.bet_amount,
        odds: bet.odds,
        potentialWin: bet.bet_amount * (bet.odds - 1),
        profit: bet.profit || 0,
        confidence: bet.confidence,
        expectedValue: bet.expected_value,
        status: bet.status,
        result: bet.result,
        createdAt: bet.created_at,
        completedAt: bet.completed_at
      })),
      stats: {
        totalBets: bets.length,
        wins: wonBets.length,
        losses: lostBets.length,
        pushes: pushBets.length,
        winRate: winRate.toFixed(2),
        roi: roi.toFixed(2),
        totalBetAmount: totalBetAmount.toFixed(2),
        totalWinAmount: totalWinAmount.toFixed(2),
        totalLossAmount: totalLossAmount.toFixed(2),
        netProfit: (totalWinAmount - totalLossAmount).toFixed(2),
        highConfidenceStats: {
          totalBets: highConfidenceBets.length,
          wins: highConfidenceWins,
          winRate: highConfidenceWinRate.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Bet history error:', error);
    return res.status(500).json({ error: error.message });
  }
}
