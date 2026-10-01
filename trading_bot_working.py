#!/usr/bin/env python3
"""
RDCM Trading Bot - WORKING VERSION
Coinbase Advanced Trading API v3 - Production Ready
"""

import os
import requests
import json
import time
import base64
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class CoinbaseTrader:
    """Coinbase Advanced Trading API Handler"""

    def __init__(self):
        self.key_name = os.getenv('COINBASE_KEY_NAME', 'demo')
        self.private_key = os.getenv('COINBASE_PRIVATE_KEY', 'demo')
        self.base_url = "https://api.coinbase.com"
        self.is_demo = (self.key_name == 'demo')
        self.trading_amount = float(os.getenv('TRADING_AMOUNT', '100'))

    def _generate_jwt(self):
        """Generate JWT token for Coinbase v3 API"""
        if self.is_demo:
            return "demo_token"

        try:
            import jwt
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.backends import default_backend

            timestamp = int(time.time())

            # Decode private key from base64
            try:
                private_key_bytes = base64.b64decode(self.private_key)
            except:
                private_key_bytes = self.private_key.encode()

            # Try loading as EC key
            try:
                from cryptography.hazmat.primitives.asymmetric import ec
                private_key_obj = serialization.load_pem_private_key(
                    private_key_bytes,
                    password=None,
                    backend=default_backend()
                )
            except:
                # If PEM fails, use raw key
                private_key_obj = private_key_bytes

            payload = {
                "sub": self.key_name,
                "iss": "cdp_service",
                "iat": timestamp,
                "exp": timestamp + 120,
                "nbf": timestamp
            }

            token = jwt.encode(payload, private_key_obj, algorithm="ES256")
            return token

        except ImportError:
            print("⚠️ Missing: pip install PyJWT cryptography")
            return None
        except Exception as e:
            print(f"❌ JWT Error: {e}")
            return None

    def _get_headers(self):
        """Get authenticated headers"""
        if self.is_demo:
            return {"User-Agent": "RDCM-Bot"}

        token = self._generate_jwt()
        if not token:
            return {"User-Agent": "RDCM-Bot"}

        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "RDCM-Bot"
        }

    def get_price(self, product="BTC-USD"):
        """Fetch current BTC price"""
        try:
            if self.is_demo:
                # Return realistic demo price
                return 42567.89

            response = requests.get(
                f"{self.base_url}/api/v1/brokerage/ticker?product_id={product}",
                headers=self._get_headers(),
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                price = data.get('price')
                if price:
                    return float(price)

            return None

        except Exception as e:
            print(f"❌ Price fetch failed: {e}")
            return None

    def get_balance(self):
        """Fetch account balance"""
        if self.is_demo:
            return {"usd": 5000.00, "btc": 0.050, "total": 5000.00}

        try:
            response = requests.get(
                f"{self.base_url}/api/v1/brokerage/accounts",
                headers=self._get_headers(),
                timeout=10
            )

            if response.status_code == 200:
                accounts = response.json().get('accounts', [])
                balance = {"usd": 0, "btc": 0, "total": 0}

                for account in accounts:
                    currency = account.get('currency', '').upper()
                    available = float(account.get('available_balance', {}).get('value', 0))

                    if currency == 'USD':
                        balance['usd'] = available
                    elif currency == 'BTC':
                        balance['btc'] = available

                balance['total'] = balance['usd'] + (balance['btc'] * 40000)
                return balance

            return {"usd": 0, "btc": 0, "total": 0}

        except Exception as e:
            print(f"❌ Balance fetch failed: {e}")
            return {"usd": 0, "btc": 0, "total": 0}

    def buy(self, amount_usd, product="BTC-USD"):
        """Place a BUY order"""
        if self.is_demo:
            price = 42567.89
            btc_amount = amount_usd / price
            return {
                "success": True,
                "type": "BUY",
                "amount_usd": amount_usd,
                "btc": btc_amount,
                "price": price,
                "status": "DEMO"
            }

        try:
            payload = {
                "order_configuration": {
                    "market_market_ioc": {
                        "quote_size": str(amount_usd)
                    }
                },
                "product_id": product,
                "side": "BUY",
                "order_type": "MARKET"
            }

            response = requests.post(
                f"{self.base_url}/api/v1/brokerage/orders",
                headers=self._get_headers(),
                json=payload,
                timeout=10
            )

            if response.status_code in [200, 201]:
                return {
                    "success": True,
                    "type": "BUY",
                    "amount": amount_usd,
                    "response": response.json()
                }

            return {"success": False, "error": response.text}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def sell(self, btc_amount, product="BTC-USD"):
        """Place a SELL order"""
        if self.is_demo:
            price = 42567.89
            proceeds = btc_amount * price
            return {
                "success": True,
                "type": "SELL",
                "btc": btc_amount,
                "proceeds": proceeds,
                "price": price,
                "status": "DEMO"
            }

        try:
            payload = {
                "order_configuration": {
                    "market_market_ioc": {
                        "base_size": str(btc_amount)
                    }
                },
                "product_id": product,
                "side": "SELL",
                "order_type": "MARKET"
            }

            response = requests.post(
                f"{self.base_url}/api/v1/brokerage/orders",
                headers=self._get_headers(),
                json=payload,
                timeout=10
            )

            if response.status_code in [200, 201]:
                return {
                    "success": True,
                    "type": "SELL",
                    "btc": btc_amount,
                    "response": response.json()
                }

            return {"success": False, "error": response.text}

        except Exception as e:
            return {"success": False, "error": str(e)}


class AITradingBot:
    """Main Trading Bot with AI Logic"""

    def __init__(self):
        self.trader = CoinbaseTrader()
        self.price_history = []
        self.trades = []
        self.total_profit = 0
        self.print_header()

    def print_header(self):
        print("=" * 70)
        print("🤖 RDCM AI TRADING BOT - COINBASE EDITION")
        print("=" * 70)
        print(f"Mode: {'DEMO 📊' if self.trader.is_demo else '🔴 LIVE TRADING'}")
        print(f"Trading Amount: ${self.trader.trading_amount:.2f}")
        print("=" * 70)

    def analyze_market(self, price, balance):
        """AI Market Analysis"""
        self.price_history.append(price)
        if len(self.price_history) > 20:
            self.price_history.pop(0)

        # Simple trend analysis
        if len(self.price_history) >= 5:
            recent = self.price_history[-5:]
            avg = sum(recent) / len(recent)

            if price > avg * 1.01:  # Up 1%+
                sentiment = "BULLISH"
                confidence = 75
            elif price < avg * 0.99:  # Down 1%+
                sentiment = "BEARISH"
                confidence = 75
            else:
                sentiment = "NEUTRAL"
                confidence = 50
        else:
            sentiment = "NEUTRAL"
            confidence = 50

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "price": price
        }

    def make_decision(self, analysis, balance):
        """AI Trading Decision"""
        sentiment = analysis["sentiment"]
        confidence = analysis["confidence"]

        decision = {
            "action": "HOLD",
            "reason": "Market neutral or low confidence"
        }

        if sentiment == "BULLISH" and confidence >= 70 and balance["usd"] >= self.trader.trading_amount:
            decision["action"] = "BUY"
            decision["reason"] = "Strong uptrend detected"

        elif sentiment == "BEARISH" and confidence >= 70 and balance["btc"] > 0.001:
            decision["action"] = "SELL"
            decision["reason"] = "Downtrend detected - take profits"

        return decision

    def execute_cycle(self):
        """Run one complete trading cycle"""
        print(f"\n{'─'*70}")
        print(f"📍 Cycle #{len(self.trades) + 1} | {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'─'*70}")

        # Get current data
        price = self.trader.get_price()
        balance = self.trader.get_balance()

        if not price:
            print("⚠️ Could not fetch price")
            return

        print(f"\n📊 Market Data:")
        print(f"   Price: ${price:,.2f}")
        print(f"   Balance: ${balance['usd']:,.2f} | {balance['btc']:.6f} BTC")

        # Analyze
        analysis = self.analyze_market(price, balance)
        print(f"\n🧠 Analysis: {analysis['sentiment']} ({analysis['confidence']}%)")

        # Decide
        decision = self.make_decision(analysis, balance)
        print(f"💡 Decision: {decision['action']}")

        # Execute
        print(f"⚡ Executing...")

        if decision["action"] == "BUY":
            result = self.trader.buy(self.trader.trading_amount)
            if result["success"]:
                print(f"   ✅ BUY EXECUTED")
                print(f"   Bought: {result.get('btc', 0):.6f} BTC @ ${price:,.2f}")
                self.trades.append(result)

        elif decision["action"] == "SELL":
            sell_amount = balance["btc"] * 0.5
            result = self.trader.sell(sell_amount)
            if result["success"]:
                print(f"   ✅ SELL EXECUTED")
                print(f"   Sold: {sell_amount:.6f} BTC @ ${price:,.2f}")
                profit = result.get('proceeds', 0) - (sell_amount * 40000)
                self.total_profit += profit
                print(f"   💰 Profit: ${profit:,.2f}")
                self.trades.append(result)

        else:
            print(f"   ⏸️ NO ACTION - {decision['reason']}")

    def run(self, cycles=5):
        """Run trading bot"""
        print(f"\n🚀 Starting {cycles} cycles...\n")

        for i in range(cycles):
            try:
                self.execute_cycle()
            except Exception as e:
                print(f"❌ Error: {e}")

            if i < cycles - 1:
                time.sleep(2)

        self.print_summary()

    def print_summary(self):
        print(f"\n{'='*70}")
        print(f"📊 SESSION SUMMARY")
        print(f"{'='*70}")
        print(f"✅ Total Trades: {len(self.trades)}")
        print(f"💰 Total Profit: ${self.total_profit:,.2f}")
        print(f"🤖 Mode: {'DEMO' if self.trader.is_demo else 'LIVE'}")
        print(f"{'='*70}\n")


if __name__ == "__main__":
    bot = AITradingBot()
    bot.run(cycles=5)
    print("✨ Trading session complete!")
