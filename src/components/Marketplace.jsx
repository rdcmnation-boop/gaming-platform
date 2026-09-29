import React, { useState, useEffect } from 'react';
import './Marketplace.css';

const Marketplace = ({ userBalance = 5000, onPurchase = () => {} }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [listings, setListings] = useState([
    {
      id: 1,
      seller: 'AI-Agent-5',
      asset: 'Bitcoin',
      amount: 0.5,
      price: 42500,
      change24h: 2.5,
      image: '₿'
    },
    {
      id: 2,
      seller: 'AI-Agent-12',
      asset: 'Ethereum',
      amount: 5,
      price: 2250,
      change24h: 1.8,
      image: 'Ξ'
    },
    {
      id: 3,
      seller: 'Player-123',
      asset: 'USDC',
      amount: 1000,
      price: 1,
      change24h: 0,
      image: '$'
    },
    {
      id: 4,
      seller: 'AI-Agent-8',
      asset: 'Bitcoin',
      amount: 0.25,
      price: 42300,
      change24h: 2.1,
      image: '₿'
    },
    {
      id: 5,
      seller: 'AI-Agent-15',
      asset: 'Ethereum',
      amount: 10,
      price: 2280,
      change24h: 2.0,
      image: 'Ξ'
    }
  ]);

  const [tradeHistory, setTradeHistory] = useState([
    {
      id: 1,
      type: 'buy',
      asset: 'Bitcoin',
      amount: 0.1,
      price: 42500,
      total: 4250,
      rake: 637.50,
      totalCost: 4887.50,
      timestamp: '2026-09-29 08:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'sell',
      asset: 'Ethereum',
      amount: 2,
      price: 2250,
      total: 4500,
      rake: 675,
      proceeds: 3825,
      timestamp: '2026-09-29 07:15',
      status: 'completed'
    }
  ]);

  const [sellForm, setSellForm] = useState({
    asset: 'Bitcoin',
    amount: 0,
    price: 42500
  });

  const [balance, setBalance] = useState(userBalance);

  const handleBuyClick = (listing) => {
    const totalCost = listing.price * listing.amount * 1.15;
    if (balance >= totalCost) {
      setBalance(balance - totalCost);
      setTradeHistory([
        {
          id: tradeHistory.length + 1,
          type: 'buy',
          asset: listing.asset,
          amount: listing.amount,
          price: listing.price,
          total: listing.price * listing.amount,
          rake: listing.price * listing.amount * 0.15,
          totalCost,
          timestamp: new Date().toLocaleString(),
          status: 'completed'
        },
        ...tradeHistory
      ]);
      onPurchase(balance - totalCost);
    }
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();
    const total = sellForm.price * sellForm.amount;
    const rake = total * 0.15;
    const proceeds = total - rake;

    setTradeHistory([
      {
        id: tradeHistory.length + 1,
        type: 'sell',
        asset: sellForm.asset,
        amount: parseFloat(sellForm.amount),
        price: parseFloat(sellForm.price),
        total,
        rake,
        proceeds,
        timestamp: new Date().toLocaleString(),
        status: 'completed'
      },
      ...tradeHistory
    ]);

    setBalance(balance + proceeds);
    setSellForm({ asset: 'Bitcoin', amount: 0, price: 42500 });
  };

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h2>🏪 Marketplace</h2>
        <div className="balance-display">
          Balance: <span className="balance-amount">${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="marketplace-tabs">
        <button
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          📋 Browse & Buy
        </button>
        <button
          className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          📤 Sell Assets
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 Trade History
        </button>
      </div>

      <div className="marketplace-content">
        {/* Browse & Buy Tab */}
        {activeTab === 'browse' && (
          <div className="browse-section">
            <h3>Active Listings</h3>
            <div className="listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <div className="listing-asset">
                    <span className="asset-icon">{listing.image}</span>
                    <div className="asset-info">
                      <h4>{listing.asset}</h4>
                      <p className="seller-info">by {listing.seller}</p>
                    </div>
                  </div>

                  <div className="listing-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <strong>{listing.amount}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Price:</span>
                      <strong>${listing.price.toLocaleString()}</strong>
                    </div>
                    <div className="detail-row change">
                      <span>24h Change:</span>
                      <strong className={listing.change24h >= 0 ? 'positive' : 'negative'}>
                        {listing.change24h >= 0 ? '+' : ''}{listing.change24h}%
                      </strong>
                    </div>
                  </div>

                  <div className="listing-cost">
                    <div className="cost-breakdown">
                      <span>Subtotal:</span>
                      <span>${(listing.price * listing.amount).toFixed(2)}</span>
                    </div>
                    <div className="cost-breakdown rake">
                      <span>Rake (15%):</span>
                      <span>${(listing.price * listing.amount * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="cost-breakdown total">
                      <span>Total Cost:</span>
                      <span>${(listing.price * listing.amount * 1.15).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="buy-button"
                    onClick={() => handleBuyClick(listing)}
                    disabled={balance < listing.price * listing.amount * 1.15}
                  >
                    {balance >= listing.price * listing.amount * 1.15 ? '✓ Buy Now' : '✗ Insufficient Balance'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sell Assets Tab */}
        {activeTab === 'sell' && (
          <div className="sell-section">
            <h3>Create a Listing</h3>
            <form onSubmit={handleSellSubmit} className="sell-form">
              <div className="form-group">
                <label>Asset</label>
                <select
                  value={sellForm.asset}
                  onChange={(e) => setSellForm({ ...sellForm, asset: e.target.value })}
                >
                  <option>Bitcoin</option>
                  <option>Ethereum</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={sellForm.amount}
                  onChange={(e) => setSellForm({ ...sellForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Price per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sellForm.price}
                  onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="sell-breakdown">
                <div className="breakdown-row">
                  <span>Total Value:</span>
                  <span>${(sellForm.price * sellForm.amount).toFixed(2)}</span>
                </div>
                <div className="breakdown-row rake">
                  <span>Platform Rake (15%):</span>
                  <span>${(sellForm.price * sellForm.amount * 0.15).toFixed(2)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>You Receive:</span>
                  <span>${(sellForm.price * sellForm.amount * 0.85).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="sell-button">
                📤 Create Listing
              </button>
            </form>
          </div>
        )}

        {/* Trade History Tab */}
        {activeTab === 'history' && (
          <div className="history-section">
            <h3>Your Trade History</h3>
            <div className="history-table">
              <div className="table-header">
                <div className="col-type">Type</div>
                <div className="col-asset">Asset</div>
                <div className="col-amount">Amount</div>
                <div className="col-price">Price</div>
                <div className="col-total">Total</div>
                <div className="col-rake">Rake</div>
                <div className="col-time">Time</div>
              </div>

              {tradeHistory.map((trade) => (
                <div key={trade.id} className="table-row">
                  <div className="col-type">
                    <span className={`type-badge ${trade.type}`}>
                      {trade.type === 'buy' ? '📥 BUY' : '📤 SELL'}
                    </span>
                  </div>
                  <div className="col-asset">{trade.asset}</div>
                  <div className="col-amount">{trade.amount}</div>
                  <div className="col-price">${trade.price.toLocaleString()}</div>
                  <div className="col-total">${trade.total.toFixed(2)}</div>
                  <div className="col-rake rake-highlight">${trade.rake.toFixed(2)}</div>
                  <div className="col-time">{trade.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
