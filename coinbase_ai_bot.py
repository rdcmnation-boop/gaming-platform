#!/usr/bin/env python3
"""
RDCM Nation - AI Agent Trading Bot
Powered by Claude AI + Coinbase API
"""

import os
import json
import requests
from datetime import datetime, timedelta

# Claude API endpoint
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

class CoinbaseAIBot:
    def __init__(self, api_key: str, api_secret: str, passphrase: str):
        """Initialize bot with Coinbase credentials"""
        self.api_key = api_key
        self.api_secret = api_secret
        self.passphrase = passphrase
        self.base_url = "https://api.exchange.coinbase.com"
        self.product_id = "BTC-USD"  # Start with Bitcoin
        self.initial_balance = 0
        self.current_balance = 0
        self.trades = []
        self.conversation_history = []

        print("🤖 RDCM AI Trading Bot Initialized")
        print(f"📊 Trading: {self.product_id}")

    def get_market_data(self):
        """Fetch current market data from Coinbase"""
        try:
            # Get current price
            response = requests.get(
                f"{self.base_url}/products/{self.product_id}/ticker",
                headers={"User-Agent": "RDCM-AI-Bot"}
            )
            ticker = response.json()

            # Get historical data for analysis
            candles_response = requests.get(
                f"{self.base_url}/products/{self.product_id}/candles",
                params={"granularity": 3600},  # 1 hour candles
                headers={"User-Agent": "RDCM-AI-Bot"}
            )
            candles = candles_response.json()[:24]  # Last 24 hours

            return {
                "current_price": float(ticker.get("price", 0)),
                "high_24h": float(ticker.get("high", 0)),
                "low_24h": float(ticker.get("low", 0)),
                "volume": float(ticker.get("volume", 0)),
                "timestamp": ticker.get("time", ""),
                "historical": candles
            }
        except Exception as e:
            print(f"❌ Error fetching market data: {e}")
            return None

    def get_account_balance(self):
        """Get current account balance (simulated for demo)"""
        # In production, use proper Coinbase API authentication
        # For now, return demo balance
        return {
            "usd": 5000.00,
            "btc": 0.05,
            "eth": 0.5
        }

    def analyze_market_with_ai(self, market_data, balance):
        """Use Claude AI to analyze market and make trading decision"""

        # Calculate technical indicators
        if market_data and len(market_data["historical"]) > 0:
            closes = [float(c[4]) for c in market_data["historical"]]
            sma_short = sum(closes[-5:]) / 5  # 5-hour MA
            sma_long = sum(closes[-24:]) / 24 if len(closes) >= 24 else sum(closes) / len(closes)  # 24-hour MA

            market_context = f"""
Current Market Data for {self.product_id}:
- Current Price: ${market_data['current_price']:.2f}
- 24h High: ${market_data['high_24h']:.2f}
- 24h Low: ${market_data['low_24h']:.2f}
- Volume: {market_data['volume']:.0f}
- 5-hour MA: ${sma_short:.2f}
- 24-hour MA: ${sma_long:.2f}
- Trend: {'📈 UP' if sma_short > sma_long else '📉 DOWN'}

Account Balance:
- USD: ${balance['usd']:.2f}
- BTC: {balance['btc']:.6f}
- ETH: {balance['eth']:.6f}

Recent Trades: {len(self.trades)}
Total Profit/Loss: ${sum([t['profit'] for t in self.trades]):.2f}
"""
        else:
            market_context = "Market data unavailable - simulating decision"

        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": f"""As a professional crypto trading AI agent, analyze this market data and make a trading decision.

{market_context}

Based on technical analysis and market conditions, should I:
1. BUY (if bullish signals)
2. SELL (if bearish signals)
3. HOLD (if neutral)

Provide your decision with reasoning, risk assessment, and suggested position size (0-10% of available capital).
Format: DECISION: [BUY/SELL/HOLD] | CONFIDENCE: [0-100]% | REASONING: [your analysis]"""
        })

        # Get AI decision
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            system="""You are a professional cryptocurrency trading AI agent for RDCM Nation.
Your goal is to maximize profits while managing risk responsibly.
- Analyze technical indicators and market conditions
- Consider trend direction and momentum
- Suggest conservative position sizes (start with 2-5% of capital)
- Always explain your reasoning
- Be cautious with risk management""",
            messages=self.conversation_history
        )

        ai_response = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": ai_response
        })

        return ai_response

    def execute_trade(self, decision: str, market_data, balance):
        """Execute trade based on AI decision"""
        if "BUY" in decision.upper():
            # Simulate buy order
            position_size = 0.05  # 5% of capital
            usd_to_invest = balance['usd'] * position_size
            btc_acquired = usd_to_invest / market_data['current_price']

            trade = {
                "timestamp": datetime.now().isoformat(),
                "type": "BUY",
                "price": market_data['current_price'],
                "amount": btc_acquired,
                "usd_amount": usd_to_invest,
                "profit": 0  # Will be calculated on sell
            }
            self.trades.append(trade)
            print(f"✅ BUY Order Executed: {btc_acquired:.6f} BTC @ ${market_data['current_price']:.2f}")
            return "TRADE_EXECUTED"

        elif "SELL" in decision.upper():
            # Simulate sell order (only if we have holdings)
            if balance['btc'] > 0:
                sell_amount = balance['btc'] * 0.5  # Sell 50% of holdings
                usd_received = sell_amount * market_data['current_price']

                trade = {
                    "timestamp": datetime.now().isoformat(),
                    "type": "SELL",
                    "price": market_data['current_price'],
                    "amount": sell_amount,
                    "usd_amount": usd_received,
                    "profit": usd_received - (sell_amount * 50000)  # Simplified
                }
                self.trades.append(trade)
                print(f"✅ SELL Order Executed: {sell_amount:.6f} BTC @ ${market_data['current_price']:.2f}")
                return "TRADE_EXECUTED"
            else:
                print("⚠️ No holdings to sell")
                return "NO_HOLDINGS"

        else:
            print("⏸️ HOLD - No action taken")
            return "HOLDING"

    def run_trading_cycle(self):
        """Run one complete trading cycle"""
        print(f"\n{'='*60}")
        print(f"🔄 Trading Cycle: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")

        # Get market data
        market_data = self.get_market_data()
        if not market_data:
            print("❌ Failed to get market data. Retrying next cycle...")
            return

        # Get account balance
        balance = self.get_account_balance()

        # AI analysis and decision
        print("🧠 AI Agent analyzing market...")
        ai_decision = self.analyze_market_with_ai(market_data, balance)
        print(f"\n📊 AI Analysis:\n{ai_decision}")

        # Execute trade
        print("\n⚡ Executing decision...")
        self.execute_trade(ai_decision, market_data, balance)

        # Summary
        total_profit = sum([t.get('profit', 0) for t in self.trades])
        print(f"\n📈 Session Summary:")
        print(f"   Trades Executed: {len(self.trades)}")
        print(f"   Total Profit/Loss: ${total_profit:.2f}")
        print(f"   Current Price: ${market_data['current_price']:.2f}")

    def demo_mode(self):
        """Run bot in demo mode (no real money)"""
        print("\n" + "="*60)
        print("🤖 RDCM AI TRADING BOT - DEMO MODE")
        print("="*60)
        print("Running AI trading bot with simulated data...")
        print("In production, this connects to your Coinbase account.\n")

        for cycle in range(3):
            print(f"\n🔄 Cycle {cycle + 1}/3")
            self.run_trading_cycle()

        print("\n" + "="*60)
        print("✅ Demo Complete!")
        print("="*60)
        print(f"Total Trades: {len(self.trades)}")
        print(f"Total Profit: ${sum([t.get('profit', 0) for t in self.trades]):.2f}")
        print("\nTo deploy with real Coinbase API:")
        print("1. Set your Coinbase API credentials")
        print("2. Run: python coinbase_ai_bot.py --live")


def main():
    """Main entry point"""

    # Demo mode (no credentials needed)
    bot = CoinbaseAIBot(
        api_key="demo_key",
        api_secret="demo_secret",
        passphrase="demo_pass"
    )

    # Run demo
    bot.demo_mode()

    print("\n🚀 Ready for Production!")
    print("Next steps:")
    print("1. Get Coinbase API keys from your account")
    print("2. Set environment variables: COINBASE_KEY, COINBASE_SECRET, COINBASE_PASS")
    print("3. Update bot with real credentials")
    print("4. Run with real trading")


if __name__ == "__main__":
    main()
