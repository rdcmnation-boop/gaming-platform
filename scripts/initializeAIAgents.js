const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const createAIAgents = async () => {
  const agents = [];
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

  // Create 21 AI agents (5-6 per difficulty level)
  let agentCount = 1;
  for (const difficulty of difficulties) {
    const agentsPerDifficulty = difficulty === 'beginner' ? 5 : 6;

    for (let i = 0; i < agentsPerDifficulty; i++) {
      agents.push({
        bot_id: `AI-Agent-${agentCount}`,
        difficulty,
        portfolio: { bitcoin: 0, ethereum: 0, usdc: 0, usdt: 0 },
        cash: 10000,
        total_profit: 0,
        total_trades: 0,
        win_rate: 50,
        trading_stats: { trades: [], averageProfitPerTrade: 0, winPercentage: 0 },
        last_trade: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      agentCount++;
    }
  }

  try {
    console.log('🤖 Initializing 21 AI agents...');

    // Insert agents into Supabase
    const { data, error } = await supabase
      .from('ai_agents')
      .insert(agents);

    if (error) {
      console.error('❌ Error inserting agents:', error);
    } else {
      console.log('✅ Successfully created 21 AI agents!');
      console.log(`   - 5 Beginner agents`);
      console.log(`   - 6 Intermediate agents`);
      console.log(`   - 6 Advanced agents`);
      console.log(`   - 6 Expert agents`);
      console.log(`   Total initial capital: $${agents.length * 10000}`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
};

createAIAgents();
