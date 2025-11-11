import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaDollarSign, FaSync } from 'react-icons/fa';
import { getExchangeRate, getSupportedCurrencies } from '../services/currencyService';
import '../styles/Currency.css';

function Currency() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const codes = await getSupportedCurrencies();
      setCurrencies(codes);
    } catch (err) {
      setError('Failed to load currencies');
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getExchangeRate(fromCurrency, toCurrency, amount);
      
      if (data.result === 'success') {
        setResult(data);
        setLastUpdate(new Date().toLocaleString());
      } else {
        setError('Failed to convert currency');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again.');
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const popularPairs = [
    { from: 'USD', to: 'EUR', label: 'USD to EUR' },
    { from: 'USD', to: 'GBP', label: 'USD to GBP' },
    { from: 'USD', to: 'JPY', label: 'USD to JPY' },
    { from: 'EUR', to: 'USD', label: 'EUR to USD' },
    { from: 'GBP', to: 'USD', label: 'GBP to USD' },
    { from: 'USD', to: 'CAD', label: 'USD to CAD' },
  ];

  const setPopularPair = (from, to) => {
    setFromCurrency(from);
    setToCurrency(to);
    setResult(null);
  };

  return (
    <div className="currency">
      <div className="container">
        <div className="page-header">
          <h1>Currency Exchange</h1>
          <p>Convert currencies with real-time exchange rates</p>
        </div>

        <div className="currency-content">
          <div className="converter-section">
            <form onSubmit={handleConvert} className="converter-form">
              <div className="amount-input-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="amount-input"
                  placeholder="Enter amount"
                />
              </div>

              <div className="currency-selectors">
                <div className="currency-group">
                  <label htmlFor="fromCurrency">From</label>
                  <select
                    id="fromCurrency"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="currency-select"
                  >
                    {currencies.map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button" 
                  className="swap-button"
                  onClick={handleSwap}
                  title="Swap currencies"
                >
                  <FaExchangeAlt />
                </button>

                <div className="currency-group">
                  <label htmlFor="toCurrency">To</label>
                  <select
                    id="toCurrency"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="currency-select"
                  >
                    {currencies.map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-convert" disabled={loading}>
                <FaDollarSign /> {loading ? 'Converting...' : 'Convert'}
              </button>
            </form>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="result-box">
                <div className="result-header">
                  <h3>Conversion Result</h3>
                  {lastUpdate && (
                    <span className="last-update">
                      <FaSync /> Updated: {lastUpdate}
                    </span>
                  )}
                </div>
                
                <div className="result-display">
                  <div className="result-from">
                    <span className="result-amount">{amount}</span>
                    <span className="result-currency">{fromCurrency}</span>
                  </div>
                  
                  <FaExchangeAlt className="result-icon" />
                  
                  <div className="result-to">
                    <span className="result-amount">{result.conversion_result.toFixed(2)}</span>
                    <span className="result-currency">{toCurrency}</span>
                  </div>
                </div>

                <div className="exchange-rate-info">
                  <p>
                    Exchange Rate: <strong>1 {fromCurrency} = {result.conversion_rate.toFixed(4)} {toCurrency}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="popular-pairs-section">
            <h3>Popular Currency Pairs</h3>
            <div className="popular-pairs-grid">
              {popularPairs.map((pair, index) => (
                <button
                  key={index}
                  className="popular-pair-card"
                  onClick={() => setPopularPair(pair.from, pair.to)}
                >
                  <span className="pair-label">{pair.label}</span>
                  <FaExchangeAlt className="pair-icon" />
                </button>
              ))}
            </div>

            <div className="info-section">
              <h3>About Currency Exchange</h3>
              <div className="info-cards">
                <div className="info-card">
                  <h4>Real-Time Rates</h4>
                  <p>Get accurate, up-to-date exchange rates from reliable sources</p>
                </div>
                <div className="info-card">
                  <h4>195+ Currencies</h4>
                  <p>Convert between all major world currencies instantly</p>
                </div>
                <div className="info-card">
                  <h4>Easy to Use</h4>
                  <p>Simple interface for quick currency conversions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Currency;