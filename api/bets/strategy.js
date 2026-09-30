import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getStrategy(req, res);
  } else if (req.method === 'POST') {
    return updateStrategy(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getStrategy(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Get current strategy settings
    const { data: settings, error } = await supabase
      .from('betting_strategies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return current settings or defaults
    const currentSettings = settings || {
      user_id: userId,
      strategy: 'value',
      bankroll: 10000,
      max_risk_per_bet: 0.05,
      profit_target: 0.10,
      loss_limit: 0.20,
      min_odds: 1.5,
      min_value_edge: 1.1,
      auto_mode: false
    };

    return res.status(200).json({
      status: 'success',
      strategy: currentSettings
    });
  } catch (error) {
    console.error('Get strategy error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function updateStrategy(req, res) {
  try {
    const { userId, ...strategyUpdates } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Validate strategy type
    const validStrategies = ['kelly', 'value', 'aggressive', 'conservative'];
    if (strategyUpdates.strategy && !validStrategies.includes(strategyUpdates.strategy)) {
      return res.status(400).json({
        error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`
      });
    }

    // Validate numeric ranges
    if (strategyUpdates.max_risk_per_bet && (strategyUpdates.max_risk_per_bet < 0.01 || strategyUpdates.max_risk_per_bet > 0.5)) {
      return res.status(400).json({ error: 'max_risk_per_bet must be between 0.01 and 0.5' });
    }

    if (strategyUpdates.profit_target && strategyUpdates.profit_target < 0) {
      return res.status(400).json({ error: 'profit_target must be positive' });
    }

    if (strategyUpdates.loss_limit && (strategyUpdates.loss_limit < 0.05 || strategyUpdates.loss_limit > 1)) {
      return res.status(400).json({ error: 'loss_limit must be between 0.05 and 1' });
    }

    const updateData = {
      user_id: userId,
      ...strategyUpdates,
      updated_at: new Date()
    };

    // Upsert strategy settings
    const { data: updated, error } = await supabase
      .from('betting_strategies')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Strategy updated successfully',
      strategy: updated
    });
  } catch (error) {
    console.error('Update strategy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
