// Vercel Serverless Function
// POST /api/games/save
// Save game results to Supabase

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
    } = req.body;

    // Validate required fields
    if (!userId || !playerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create game record
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        user_id: userId,
        player_name: playerName,
        buy_in: buyIn || 100,
        final_stack: finalStack || 0,
        profit: profit || 0,
        duration: duration || 0,
        hands_played: handsPlayed || 1,
        bots_played: bots || [],
        winner: winner || playerName,
        coaching_enabled: coachingEnabled || false,
        difficulty: difficulty || 'casual',
        created_at: new Date().toISOString()
      })
      .select();

    if (gameError) throw gameError;

    // Update player stats
    const { data: playerStats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (playerStats) {
      // Update existing stats
      const newStats = {
        total_games: (playerStats.total_games || 0) + 1,
        total_profit: (playerStats.total_profit || 0) + (profit || 0),
        total_hands: (playerStats.total_hands || 0) + (handsPlayed || 1),
        win_rate: calculateWinRate(playerStats.total_games + 1,
                  (playerStats.wins || 0) + (winner === playerName ? 1 : 0)),
        last_played: new Date().toISOString()
      };

      await supabase
        .from('player_stats')
        .update(newStats)
        .eq('user_id', userId);
    } else {
      // Create new stats
      await supabase
        .from('player_stats')
        .insert({
          user_id: userId,
          total_games: 1,
          total_profit: profit || 0,
          total_hands: handsPlayed || 1,
          wins: winner === playerName ? 1 : 0,
          win_rate: winner === playerName ? 100 : 0,
          last_played: new Date().toISOString()
        });
    }

    res.status(200).json({
      success: true,
      gameId: gameData[0]?.id,
      message: 'Game saved successfully'
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: error.message });
  }
}

function calculateWinRate(totalGames, wins) {
  return Math.round((wins / totalGames) * 100);
}
