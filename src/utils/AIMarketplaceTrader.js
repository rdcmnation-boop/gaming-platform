class AIMarketplaceTrader {
  constructor(botId, difficulty = 'intermediate') {
    this.botId = botId;
    this.difficulty = difficulty;
    this.portfolio = { bitcoin: 0, ethereum: 0, usdc: 0, usdt: 0 };
    this.cash = 10000;
    this.totalProfit = 0;
    this.totalTrades = 0;
    this.winRate = 0;
    this.profitableTrades = 0;
    this.lossTrades = 0;
    this.strategyParams = {
      profitMargin: this.getProfitMarginByDifficulty(),
      aggressiveness: this.getAggressivenessByDifficulty(),
      riskTolerance: this.getRiskToleranceByDifficulty(),
      positionSize: 0.2
    };
    this.tradingStats = {
      trades: [],
      averageProfitPerTrade: 0,
      winPercentage: 0,
      lastProfitLoss: 0
    };
  }

  getProfitMarginByDifficulty() {
    const margins = { beginner: 0.05, intermediate: 0.08, advanced: 0.12, expert: 0.15 };
    return margins[this.difficulty] || 0.08;
  }

  getAggressivenessByDifficulty() {
    const agg = { beginner: 0.2, intermediate: 0.5, advanced: 0.7, expert: 0.9 };
    return agg[this.difficulty] || 0.5;
  }

  getRiskToleranceByDifficulty() {
    const risk = { beginner: 0.05, intermediate: 0.10, advanced: 0.15, expert: 0.25 };
    return risk[this.difficulty] || 0.10;
  }

  analyzeMarket(listings) {
    const opportunities = [];
    if (!listings || listings.length === 0) return opportunities;
    const assetPrices = this.calculateAveragePrices(listings);
    for (const listing of listings) {
      const marketPrice = assetPrices[listing.asset] || listing.price_per_unit;
      const priceDeviation = (listing.price_per_unit - marketPrice) / marketPrice;
      if (priceDeviation < -0.05) {
        opportunities.push({
          type: 'buy',
          listing,
          asset: listing.asset,
          priceDeviation,
          expectedProfit: Math.abs(priceDeviation) * listing.price_per_unit,
          marketPrice,
          score: Math.abs(priceDeviation) * 100
        });
      }
      if (priceDeviation > 0.05 && this.portfolio[listing.asset.toLowerCase()] > 0) {
        opportunities.push({
          type: 'sell',
          listing,
          asset: listing.asset,
          priceDeviation,
          expectedProfit: priceDeviation * listing.price_per_unit,
          marketPrice,
          score: priceDeviation * 100
        });
      }
    }
    return opportunities.sort((a, b) => b.score - a.score);
  }

  calculateAveragePrices(listings) {
    const prices = {};
    const counts = {};
    for (const listing of listings) {
      if (!prices[listing.asset]) { prices[listing.asset] = 0; counts[listing.asset] = 0; }
      prices[listing.asset] += listing.price_per_unit;
      counts[listing.asset]++;
    }
    const averages = {};
    for (const asset in prices) { averages[asset] = prices[asset] / counts[asset]; }
    return averages;
  }

  shouldExecuteTrade(opportunity) {
    const minProfitThreshold = this.strategyParams.profitMargin;
    const riskScore = this.calculateRiskScore(opportunity);
    if (Math.abs(opportunity.expectedProfit) < minProfitThreshold) return false;
    if (riskScore > this.strategyParams.riskTolerance) return false;
    const aggressionThreshold = 1 - this.strategyParams.aggressiveness;
    if (Math.random() > aggressionThreshold) return false;
    return true;
  }

  calculateRiskScore(opportunity) {
    const volatility = Math.abs(opportunity.priceDeviation);
    const positionSizeRisk = this.strategyParams.positionSize;
    const difficultyRisk = 1 - this.strategyParams.aggressiveness;
    return volatility * positionSizeRisk * difficultyRisk;
  }

  executeBuy(listing) {
    const amount = Math.min(listing.amount, Math.floor(this.cash / (listing.price_per_unit * 1.15)));
    if (amount <= 0 || this.cash < listing.price_per_unit * amount * 1.15) return null;
    const total = listing.price_per_unit * amount;
    const rake = total * 0.15;
    const totalCost = total + rake;
    this.cash -= totalCost;
    const assetKey = listing.asset.toLowerCase();
    this.portfolio[assetKey] = (this.portfolio[assetKey] || 0) + amount;
    return { type: 'buy', asset: listing.asset, amount, price: listing.price_per_unit, total, rake, totalCost, timestamp: new Date().toISOString() };
  }

  executeSell(listing) {
    const assetKey = listing.asset.toLowerCase();
    const available = this.portfolio[assetKey] || 0;
    const amount = Math.min(listing.amount, available);
    if (amount <= 0) return null;
    const total = listing.price_per_unit * amount;
    const rake = total * 0.15;
    const proceeds = total - rake;
    this.portfolio[assetKey] -= amount;
    this.cash += proceeds;
    return { type: 'sell', asset: listing.asset, amount, price: listing.price_per_unit, total, rake, proceeds, timestamp: new Date().toISOString() };
  }

  executeTradingCycle(listings) {
    const opportunities = this.analyzeMarket(listings);
    const tradesExecuted = [];
    let totalProfit = 0;
    let totalRake = 0;
    for (const opportunity of opportunities.slice(0, 5)) {
      if (!this.shouldExecuteTrade(opportunity)) continue;
      let trade = null;
      if (opportunity.type === 'buy') {
        trade = this.executeBuy(opportunity.listing);
      } else if (opportunity.type === 'sell') {
        trade = this.executeSell(opportunity.listing);
      }
      if (trade) {
        tradesExecuted.push(trade);
        totalProfit += opportunity.expectedProfit;
        totalRake += (trade.rake || 0);
        this.totalTrades++;
      }
    }
    this.learnFromOutcome(tradesExecuted, totalProfit > 0);
    this.totalProfit += totalProfit;
    return { tradesExecuted, totalProfit, totalRake };
  }

  learnFromOutcome(trades, wasSuccessful) {
    if (trades.length === 0) return;
    if (wasSuccessful) {
      this.profitableTrades++;
      this.strategyParams.aggressiveness = Math.min(0.95, this.strategyParams.aggressiveness + 0.01);
    } else {
      this.lossTrades++;
      this.strategyParams.aggressiveness = Math.max(0.1, this.strategyParams.aggressiveness - 0.02);
    }
    this.winRate = (this.profitableTrades / (this.profitableTrades + this.lossTrades)) * 100;
    this.tradingStats.trades.push(...trades);
    this.tradingStats.winPercentage = this.winRate;
    this.tradingStats.averageProfitPerTrade = this.totalProfit / Math.max(1, this.totalTrades);
  }

  getAgentStatus() {
    return {
      botId: this.botId,
      difficulty: this.difficulty,
      portfolio: this.portfolio,
      cash: this.cash,
      totalProfit: this.totalProfit,
      totalTrades: this.totalTrades,
      winRate: this.winRate,
      tradingStats: this.tradingStats
    };
  }

  getPerformanceMetrics() {
    const portfolioValue = this.calculatePortfolioValue();
    const totalValue = this.cash + portfolioValue;
    const percentageReturn = ((totalValue - 10000) / 10000) * 100;
    return {
      botId: this.botId,
      difficulty: this.difficulty,
      totalProfit: this.totalProfit,
      percentageReturn,
      winRate: this.winRate,
      totalTrades: this.totalTrades,
      rakePaid: (this.totalTrades * 15),
      totalValue,
      averageProfitPerTrade: this.totalTrades > 0 ? this.totalProfit / this.totalTrades : 0
    };
  }

  calculatePortfolioValue() {
    const prices = { bitcoin: 42500, ethereum: 2250, usdc: 1, usdt: 1 };
    let value = 0;
    for (const asset in this.portfolio) {
      value += (this.portfolio[asset] || 0) * (prices[asset] || 1);
    }
    return value;
  }
}

export default AIMarketplaceTrader;
