import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      betAmount,
      odds,
      team,
      gameId,
      homeTeam,
      awayTeam,
      matchTime,
      confidence,
      expectedValue,
      status = 'pending_approval'
    } = req.body;

    if (!userId || !betAmount || !odds || !gameId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, betAmount, odds, gameId'
      });
    }

    // Create bet record
    const { data: bet, error } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        bet_amount: betAmount,
        odds,
        team,
        game_id: gameId,
        home_team: homeTeam,
        away_team: awayTeam,
        match_time: matchTime,
        confidence,
        expected_value: expectedValue,
        status,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Bet insertion error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Calculate potential payout
    const potentialWin = betAmount * (odds - 1);
    const potentialLoss = betAmount;

    return res.status(200).json({
      status: 'success',
      bet: {
        id: bet.id,
        betAmount,
        odds,
        team,
        gameId,
        potentialWin,
        potentialLoss,
        totalPayout: betAmount + potentialWin,
        confidence,
        expectedValue,
        status: 'pending_approval'
      },
      message: 'Bet created and pending approval'
    });
  } catch (error) {
    console.error('Bet execution error:', error);
    return res.status(500).json({ error: error.message });
  }
}
