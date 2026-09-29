import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RAKE_PERCENTAGE = 0.15;

export const handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { action, userId, asset, amount, price, transactionType } = body;

    if (action === 'buy') {
      return await handleBuyTransaction(userId, asset, amount, price);
    } else if (action === 'sell') {
      return await handleSellTransaction(userId, asset, amount, price);
    } else if (action === 'aiTrade') {
      return await handleAITrade(userId, asset, amount, price, transactionType);
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid action' })
    };
  } catch (error) {
    console.error('Transaction error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function handleBuyTransaction(userId, asset, amount, price) {
  const total = price * amount;
  const rake = total * RAKE_PERCENTAGE;
  const totalCost = total + rake;
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Record transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert([{
      transaction_id: transactionId,
      user_id: userId,
      type: 'buy',
      asset,
      amount,
      price_per_unit: price,
      total,
      rake,
      status: 'completed'
    }]);

  if (txError) throw txError;

  // Update platform metrics
  const { data: metrics } = await supabase
    .from('platform_metrics')
    .select('*')
    .limit(1)
    .single();

  if (metrics) {
    await supabase
      .from('platform_metrics')
      .update({
        total_volume: (metrics.total_volume || 0) + total,
        total_rake: (metrics.total_rake || 0) + rake,
        total_buy_transactions: (metrics.total_buy_transactions || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', metrics.id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      transactionId,
      details: {
        total,
        rake,
        totalCost,
        timestamp: new Date().toISOString()
      }
    })
  };
}

async function handleSellTransaction(userId, asset, amount, price) {
  const total = price * amount;
  const rake = total * RAKE_PERCENTAGE;
  const proceeds = total - rake;
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { error: txError } = await supabase
    .from('transactions')
    .insert([{
      transaction_id: transactionId,
      user_id: userId,
      type: 'sell',
      asset,
      amount,
      price_per_unit: price,
      total,
      rake,
      status: 'completed'
    }]);

  if (txError) throw txError;

  const { data: metrics } = await supabase
    .from('platform_metrics')
    .select('*')
    .limit(1)
    .single();

  if (metrics) {
    await supabase
      .from('platform_metrics')
      .update({
        total_volume: (metrics.total_volume || 0) + total,
        total_rake: (metrics.total_rake || 0) + rake,
        total_sell_transactions: (metrics.total_sell_transactions || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', metrics.id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      transactionId,
      details: {
        total,
        rake,
        proceeds,
        timestamp: new Date().toISOString()
      }
    })
  };
}

async function handleAITrade(botId, asset, amount, price, transactionType) {
  const total = price * amount;
  const rake = total * RAKE_PERCENTAGE;
  const transactionId = `TXN-AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { error: txError } = await supabase
    .from('ai_transactions')
    .insert([{
      transaction_id: transactionId,
      bot_id: botId,
      type: transactionType,
      asset,
      amount,
      total,
      rake,
      status: 'completed'
    }]);

  if (txError) throw txError;

  const { data: metrics } = await supabase
    .from('platform_metrics')
    .select('*')
    .limit(1)
    .single();

  if (metrics) {
    await supabase
      .from('platform_metrics')
      .update({
        ai_generated_volume: (metrics.ai_generated_volume || 0) + total,
        ai_generated_rake: (metrics.ai_generated_rake || 0) + rake,
        ai_total_trades: (metrics.ai_total_trades || 0) + 1,
        total_volume: (metrics.total_volume || 0) + total,
        total_rake: (metrics.total_rake || 0) + rake,
        updated_at: new Date().toISOString()
      })
      .eq('id', metrics.id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      transactionId,
      details: {
        total,
        rake,
        timestamp: new Date().toISOString()
      }
    })
  };
}
