import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple AI trading logic (you can use your AIMarketplaceTrader class here)
function executeTradeLogic(agent, listings) {
  const trades = [];
  let totalProfit = 0;
  let totalRake = 0;

  if (!listings || listings.length === 0) {
    return { tradesExecuted: trades, totalProfit, totalRake };
  }

  // Find undervalued assets to buy
  for (let i = 0; i < Math.min(3, listings.length); i++) {
    const listing = listings[i];
    const buyChance = Math.random();

    if (buyChance > 0.6 && agent.cash > listing.price_per_unit * 1.15) {
      const amount = Math.min(1, Math.floor(agent.cash / (listing.price_per_unit * 1.15)));
      const total = listing.price_per_unit * amount;
      const rake = total * 0.15;

      trades.push({
        type: 'buy',
        asset: listing.asset,
        amount,
        total,
        rake
      });

      totalRake += rake;
      totalProfit += (Math.random() * 50 - 10); // Simulate profit
      agent.cash -= (total + rake);
    }
  }

  return { tradesExecuted: trades, totalProfit, totalRake };
}

export const handler = async (event, context) => {
  try {
    console.log('🤖 Starting AI Trading Cycle...');

    // Get all listings
    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active');

    // Get all AI agents
    const { data: agentsData } = await supabase
      .from('ai_agents')
      .select('*');

    let totalTradesExecuted = 0;
    let totalProfitGenerated = 0;
    let totalRakePaid = 0;

    // Run trading cycle for each agent
    for (const agentData of agentsData || []) {
      try {
        const agent = {
          ...agentData,
          cash: agentData.cash || 10000,
          portfolio: agentData.portfolio || {}
        };

        const result = executeTradeLogic(agent, listings || []);

        totalTradesExecuted += result.tradesExecuted.length;
        totalRakePaid += result.totalRake || 0;
        totalProfitGenerated += result.totalProfit || 0;

        // Update agent in Supabase
        const newProfit = (agentData.total_profit || 0) + result.totalProfit;
        const newTrades = (agentData.total_trades || 0) + result.tradesExecuted.length;

        await supabase
          .from('ai_agents')
          .update({
            cash: agent.cash,
            total_profit: newProfit,
            total_trades: newTrades,
            win_rate: Math.min(95, (Math.random() * 100)),
            last_trade: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('bot_id', agentData.bot_id);

        console.log(`✓ ${agentData.bot_id}: ${result.tradesExecuted.length} trades, $${result.totalProfit.toFixed(2)} profit`);
      } catch (error) {
        console.error(`✗ Error trading ${agentData.bot_id}:`, error.message);
      }
    }

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
          ai_total_trades: (metrics.ai_total_trades || 0) + totalTradesExecuted,
          ai_generated_rake: (metrics.ai_generated_rake || 0) + totalRakePaid,
          updated_at: new Date().toISOString()
        })
        .eq('id', metrics.id);
    }

    console.log(`✓ Trading cycle complete: ${totalTradesExecuted} trades, $${totalProfitGenerated.toFixed(2)} profit, $${totalRakePaid.toFixed(2)} rake`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tradesExecuted: totalTradesExecuted,
        profitGenerated: totalProfitGenerated,
        rakePaid: totalRakePaid
      })
    };
  } catch (error) {
    console.error('Trading cycle error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
